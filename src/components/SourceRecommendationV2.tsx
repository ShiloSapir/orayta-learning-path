import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Language } from "./LanguageToggle";
import { useSupabaseData, Source } from "@/hooks/useSupabaseData";
import { useSmartRecommendation } from "@/hooks/useSmartRecommendation";
import { useAuth } from "@/hooks/useAuth";
import { useAppToast } from "@/hooks/useToast";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useAccessibilityAnnouncements } from "@/hooks/useAccessibility";
import { SocialSharing } from "./SocialSharing";
import { SourceLoadingState } from "./SourceLoadingState";
import { useMinimumLoading } from "@/hooks/useMinimumLoading";
import { EnhancedSourceDisplay } from "./EnhancedSourceDisplay";
import { usePersonalizationEngine } from "@/hooks/usePersonalizationEngine";
import { useContentQualityAssurance } from "@/hooks/useContentQualityAssurance";
import { useAISourceGenerator } from "@/hooks/useAISourceGenerator";
import { normalizeTopic } from "@/utils/normalizeTopic";
import { getRelatedTopics } from "@/utils/topicRelations";
import { 
  ExternalLink, 
  BookOpen, 
  Heart, 
  Calendar,
  SkipForward,
  CheckCircle,
  AlertTriangle,
  
} from "lucide-react";

interface SourceRecommendationProps {
  language: Language;
  timeSelected: number;
  topicSelected: string;
  onBack: () => void;
  onReflection: (sessionId: string) => void;
}

const content = {
  en: {
    title: "Your Torah Source",
    subtitle: "Selected for your spiritual journey",
    backButton: "Back",
    skipButton: "Skip This Source",
    
    saveButton: "Save for Later",
    learnedButton: "Mark as Learned",
    calendarButton: "Add to Calendar",
    reflectionButton: "Write Reflection",
    commentariesLabel: "Suggested Commentaries:",
    reflectionPromptLabel: "Reflection Prompt:",
    fromTo: "From",
    to: "to",
    sefariaLink: "Open in Sefaria",
    loading: "Finding your perfect source...",
    noSources: "No sources available for this topic. Please try another topic.",
    errorLoading: "Error loading source. Please try again."
  },
  he: {
    title: "המקור שלך",
    subtitle: "נבחר למסע הרוחני שלך",
    backButton: "חזור",
    skipButton: "דלג על המקור הזה",
    
    saveButton: "שמור למועד מאוחר",
    learnedButton: "סמן כנלמד",
    calendarButton: "הוסף ליומן",
    reflectionButton: "כתוב הרהור",
    commentariesLabel: "פירושים מומלצים:",
    reflectionPromptLabel: "שאלה להרהור:",
    fromTo: "מ",
    to: "עד",
    sefariaLink: "פתח בספריא",
    loading: "מחפש את המקור המושלם עבורך...",
    noSources: "אין מקורות זמינים לנושא זה. אנא נסה נושא אחר.",
    errorLoading: "שגיאה בטעינת המקור. אנא נסה שוב."
  }
};

export const SourceRecommendationV2 = ({ 
  language, 
  timeSelected, 
  topicSelected, 
  onBack, 
  onReflection 
}: SourceRecommendationProps) => {
  const { user } = useAuth();
  const { sources, loading: dataLoading, createSession, updateSessionStatus } = useSupabaseData();
  const { success, error } = useAppToast();
  const [currentSource, setCurrentSource] = useState<Source | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [matchType, setMatchType] = useState<'exact' | 'related' | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [qualityWarnings, setQualityWarnings] = useState<string[]>([]);
  
  // Enhanced smart recommendation system with personalization
  const {
    getRecommendedSource,
    addToHistory,
    updateUserHistory,
    sourceHistory,
    getFilteredSources
  } = useSmartRecommendation(sources, {
    timeSelected,
    topicSelected,
    language
  });

  // Personalization engine
  const { 
    getPersonalizedRecommendations, 
    updateLearningPattern 
  } = usePersonalizationEngine();

  // Content quality assurance
  const { 
    assessSourceQuality, 
    validateTorahReferences 
  } = useContentQualityAssurance();

  // AI Source Generator for fallback
  const { generateFallbackSource, isGenerating } = useAISourceGenerator();
  const showDataLoading = useMinimumLoading(dataLoading);
  const showAIGenerating = useMinimumLoading(isGenerating);

  const { announce } = useAccessibilityAnnouncements();

  const determineMatchType = (source: Source): 'exact' | 'related' => {
    const normalized = normalizeTopic(topicSelected);
    const cat = normalizeTopic(source.category);
    const sub = normalizeTopic(source.subcategory || '');
    if (cat === normalized || sub === normalized) return 'exact';
    const related = getRelatedTopics(normalized);
    return related.includes(cat) || related.includes(sub) ? 'related' : 'related';
  };
  
  // Set up keyboard navigation
  useKeyboardNavigation({
    shortcuts: [
      { key: 'ArrowLeft', action: onBack, description: 'Go back' },
      { key: 'Enter', action: () => currentSource && handleReflection(), description: 'Write reflection' },
      { key: 's', action: () => currentSource && handleSave(), description: 'Save source' },
      { key: 'l', action: () => currentSource && handleMarkLearned(), description: 'Mark as learned' },
      { key: 'n', action: () => currentSource && handleSkip(), description: 'Skip source' }
    ]
  });

  // Load new source using enhanced smart recommendation with minimal quality checks
  const loadNewSource = async () => {
    console.log('🔄 Loading new source...');
    
    // Try smart recommendation first (primary method)
    let selectedSource = getRecommendedSource();
    
    if (selectedSource) {
      console.log('✅ Found source via smart recommendation:', selectedSource.title);
      
      // Minimal quality validation (just warnings, don't block)
      try {
        const qualityMetrics = await assessSourceQuality(selectedSource);
        const torahValidation = validateTorahReferences(selectedSource);
        
        const warnings = [
          ...torahValidation.warnings,
          ...torahValidation.suggestions,
          ...(qualityMetrics.score < 60 ? [`Source quality score: ${qualityMetrics.score}%`] : [])
        ];
        
        setQualityWarnings(warnings);
      } catch (error) {
        console.warn('Quality check failed, proceeding anyway:', error);
        setQualityWarnings([]);
      }
      
      setCurrentSource(selectedSource);
      setMatchType(determineMatchType(selectedSource));
      createSessionForSource(selectedSource);
      setShowFallback(false);
      return selectedSource;
    }
    
    console.log('❌ No source found via smart recommendation, trying personalized...');
    
    // Try personalized recommendations as backup
    try {
      const personalizedSources = getPersonalizedRecommendations(sources, {
        timeSelected,
        topicSelected,
        language
      });

      if (personalizedSources.length > 0) {
        selectedSource = personalizedSources[0];
        console.log('✅ Found source via personalization:', selectedSource.title);
        setCurrentSource(selectedSource);
        setMatchType(determineMatchType(selectedSource));
        createSessionForSource(selectedSource);
        setShowFallback(false);
        setQualityWarnings([]);
        return selectedSource;
      }
    } catch (error) {
      console.warn('Personalization failed:', error);
    }
    
    console.log('❌ No personalized sources, checking if any sources exist at all...');
    
    // Check if we have ANY published sources
    const anyPublishedSources = sources.filter(s => s.published && !sourceHistory.includes(s.id));
    
    if (anyPublishedSources.length === 0) {
      console.log('❌ No published sources available, trying AI generation...');
      
      // Try AI fallback generation only if truly no sources exist
      try {
        const aiSource = await generateFallbackSource(topicSelected, timeSelected, 'beginner');
        if (aiSource) {
          const convertedSource: Source = {
            ...aiSource,
            id: aiSource.id || crypto.randomUUID(),
            published: aiSource.published || true,
            difficulty_level: aiSource.difficulty_level as 'beginner' | 'intermediate' | 'advanced',
            source_type: aiSource.source_type as 'text_study' | 'practical_halacha' | 'philosophical' | 'historical' | 'mystical',
            language_preference: aiSource.language_preference as 'english' | 'hebrew' | 'both',
            ai_generated: true,
          };
          setCurrentSource(convertedSource);
          setMatchType('related');
          createSessionForSource(convertedSource);
          setShowFallback(false);
          setQualityWarnings([]);
          announce(`Generated new source: ${language === 'he' ? aiSource.title_he : aiSource.title}`);
          return convertedSource;
        }
      } catch (error) {
        console.error('AI fallback generation failed:', error);
      }
      
      // Last resort: show fallback mechanisms
      console.log('❌ All methods failed, showing fallback UI');
      setShowFallback(true);
      return null;
    }
    
    // If we have sources but filtering is too strict, grab a random one
    console.log('🎲 Fallback to random source from', anyPublishedSources.length, 'available');
    selectedSource = anyPublishedSources[Math.floor(Math.random() * anyPublishedSources.length)];
    setCurrentSource(selectedSource);
    setMatchType('related');
    createSessionForSource(selectedSource);
    setShowFallback(false);
    setQualityWarnings(['This source may not perfectly match your criteria, but it\'s a good learning opportunity!']);
    return selectedSource;
  };

  // Load initial source with enhanced error handling
  useEffect(() => {
    if (sources.length > 0 && !currentSource && !showFallback) {
      loadNewSource().then(source => {
        if (!source) {
          const filteredSources = getFilteredSources();
          if (filteredSources.length === 0) {
            setShowFallback(true);
          } else {
            error(content[language].noSources);
          }
        }
      });
    }
  }, [sources, currentSource, showFallback]);

  const createSessionForSource = async (source: Source) => {
    if (!user) return;
    
    const session = await createSession(topicSelected, timeSelected, source.id);
    if (session) {
      setCurrentSessionId(session.id);
    }
  };

  const handleSkip = async () => {
    if (!currentSource) return;
    
    console.log('⏭️ Skipping source:', currentSource.title);
    setLoading(true);
    
    try {
      // Update user learning patterns and history
      addToHistory(currentSource.id);
      updateUserHistory(currentSource, 'skipped');
      updateLearningPattern(currentSource, 'skipped');
      
      // Clear current source before loading new one
      setCurrentSource(null);
      setQualityWarnings([]);
      
      // Get new source using enhanced recommendation
      const newSource = await loadNewSource();
      if (newSource) {
        console.log('✅ Successfully skipped to new source:', newSource.title);
        announce(`Skipped to new source: ${language === 'he' ? newSource.title_he : newSource.title}`);
      } else {
        console.log('❌ No new source found after skip');
        error('No more sources available. Try adjusting your time or topic selection.');
      }
    } catch (skipError) {
      console.error('Error during skip:', skipError);
      error('Failed to skip source. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async () => {
    if (!currentSessionId || !currentSource) return;
    
    setLoading(true);
    await updateSessionStatus(currentSessionId, 'saved');
    updateUserHistory(currentSource, 'saved');
    success(content[language].saveButton);
    setLoading(false);
  };

  const handleMarkLearned = async () => {
    if (!currentSessionId || !currentSource) return;
    
    setLoading(true);
    await updateSessionStatus(currentSessionId, 'learned');
    updateUserHistory(currentSource, 'completed');
    updateLearningPattern(currentSource, 'completed');
    success(content[language].learnedButton);
    setLoading(false);
  };

  const handleCalendar = () => {
    if (!currentSource) return;
    
    const title = language === 'he' ? currentSource.title_he : currentSource.title;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + timeSelected * 60000);
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Study: ${title}`)}`;
    
    window.open(calendarUrl, '_blank');
    success(content[language].calendarButton);
  };

  const handleReflection = () => {
    if (currentSessionId) {
      onReflection(currentSessionId);
    }
  };

  if (showDataLoading) {
    return (
      <SourceLoadingState
        message={content[language].loading}
        variant="detailed"
      />
    );
  }

  if (showAIGenerating) {
    return (
      <SourceLoadingState
        message="Generating new source..."
        variant="minimal"
      />
    );
  }

  // Show loading state while waiting for webhook response or processing
  if (!currentSource && !loading && !showDataLoading) {
    return (
      <SourceLoadingState
        message={content[language].loading}
        variant="detailed"
      />
    );
  }

  // Add null safety checks
  if (!currentSource) {
    return null;
  }

  const title = language === 'he' ? currentSource.title_he : currentSource.title;
  const textExcerpt = language === 'he' ? currentSource.text_excerpt_he : currentSource.text_excerpt;
  const reflectionPrompt = language === 'he' ? currentSource.reflection_prompt_he : currentSource.reflection_prompt;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">{content[language].title}</h1>
          <p className="text-muted-foreground">{content[language].subtitle}</p>
        </div>

        {/* Quality Warnings */}
        {qualityWarnings.length > 0 && (
          <Card className="p-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Content Quality Notes
                </h4>
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-0.5">
                  {qualityWarnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Source Display */}
        <EnhancedSourceDisplay
          source={currentSource}
          language={language}
          onSefariaClick={() => currentSource && window.open(currentSource.sefaria_link, '_blank')}
          matchType={matchType || undefined}
        />

        {/* Reflection Prompt */}
        <Card className="p-6">
          <h3 className="font-semibold mb-2">{content[language].reflectionPromptLabel}</h3>
          <p className="text-muted-foreground italic">{reflectionPrompt}</p>
        </Card>

        {/* Action Buttons */}
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              onClick={handleSkip}
              variant="outline"
              disabled={loading}
            >
              <SkipForward className="h-4 w-4 mr-2" />
              {content[language].skipButton}
            </Button>

            
            <Button 
              onClick={handleSave} 
              variant="outline"
              disabled={loading}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {content[language].saveButton}
            </Button>
            
            <Button 
              onClick={handleMarkLearned} 
              variant="outline"
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {content[language].learnedButton}
            </Button>
            
            <Button 
              onClick={handleCalendar} 
              variant="outline"
              disabled={loading}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {content[language].calendarButton}
            </Button>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleReflection} 
              className="flex-1"
              disabled={loading}
            >
              <Heart className="h-4 w-4 mr-2" />
              {content[language].reflectionButton}
            </Button>
            
            <Button 
              onClick={() => currentSource && window.open(currentSource.sefaria_link, '_blank')} 
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {content[language].sefariaLink}
            </Button>
          </div>

          {/* Social Sharing */}
          <SocialSharing 
            language={language}
            source={{
              title,
              text: textExcerpt || '',
              sefariaLink: currentSource?.sefaria_link || ''
            }}
          />
        </Card>

        {/* Estimated Time */}
        <div className="text-center text-sm text-muted-foreground">
          Estimated time: {currentSource?.estimated_time || 15} minutes
        </div>
      </div>
    </div>
  );
};