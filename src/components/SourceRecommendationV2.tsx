import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Language } from "./LanguageToggle";
import { useSupabaseData, Source } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { useAppToast } from "@/hooks/useToast";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useAccessibilityAnnouncements } from "@/hooks/useAccessibility";
import { SocialSharing } from "./SocialSharing";
import { 
  ArrowLeft, 
  ExternalLink, 
  BookOpen, 
  Heart, 
  Calendar,
  SkipForward,
  CheckCircle,
  Loader2
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
  const [loading, setLoading] = useState(false);
  const [sourceHistory, setSourceHistory] = useState<string[]>([]);

  const { announce } = useAccessibilityAnnouncements();
  
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

  // Get sources filtered by topic and time
  const getFilteredSources = () => {
    return sources.filter(source => {
      const matchesTopic = source.category.toLowerCase() === topicSelected.toLowerCase() ||
                          source.subcategory?.toLowerCase() === topicSelected.toLowerCase();
      const matchesTime = source.estimated_time <= timeSelected;
      const notInHistory = !sourceHistory.includes(source.id);
      
      return matchesTopic && matchesTime && notInHistory;
    });
  };

  // Get random source from filtered results
  const getRandomSource = () => {
    const filtered = getFilteredSources();
    if (filtered.length === 0) {
      // If no sources match, show any published source
      const available = sources.filter(s => !sourceHistory.includes(s.id));
      return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null;
    }
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  // Load initial source
  useEffect(() => {
    if (sources.length > 0 && !currentSource) {
      const source = getRandomSource();
      if (source) {
        setCurrentSource(source);
        createSessionForSource(source);
      }
    }
  }, [sources, currentSource]);

  const createSessionForSource = async (source: Source) => {
    if (!user) return;
    
    const session = await createSession(topicSelected, timeSelected, source.id);
    if (session) {
      setCurrentSessionId(session.id);
    }
  };

  const handleSkip = async () => {
    if (!currentSource) return;
    
    setLoading(true);
    
    // Add current source to history
    setSourceHistory(prev => [...prev, currentSource.id]);
    
    // Get new source
    const newSource = getRandomSource();
    if (newSource) {
      setCurrentSource(newSource);
      await createSessionForSource(newSource);
      announce(`Skipped to new source: ${language === 'he' ? newSource.title_he : newSource.title}`);
    } else {
      error(content[language].noSources);
    }
    
    setLoading(false);
  };

  const handleSave = async () => {
    if (!currentSessionId) return;
    
    setLoading(true);
    await updateSessionStatus(currentSessionId, 'saved');
    success(content[language].saveButton);
    setLoading(false);
  };

  const handleMarkLearned = async () => {
    if (!currentSessionId) return;
    
    setLoading(true);
    await updateSessionStatus(currentSessionId, 'learned');
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

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{content[language].loading}</p>
        </div>
      </div>
    );
  }

  if (!currentSource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <p className="text-muted-foreground mb-4">{content[language].noSources}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {content[language].backButton}
          </Button>
        </Card>
      </div>
    );
  }

  const title = language === 'he' ? currentSource.title_he : currentSource.title;
  const textExcerpt = language === 'he' ? currentSource.text_excerpt_he : currentSource.text_excerpt;
  const reflectionPrompt = language === 'he' ? currentSource.reflection_prompt_he : currentSource.reflection_prompt;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {content[language].backButton}
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold">{content[language].title}</h1>
            <p className="text-muted-foreground">{content[language].subtitle}</p>
          </div>
          
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        {/* Source Card */}
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground">
                Estimated time: {currentSource.estimated_time} minutes
              </p>
            </div>

            {textExcerpt && (
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="leading-relaxed">{textExcerpt}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Category</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                  {currentSource.category}
                </span>
                {currentSource.subcategory && (
                  <span className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded-md text-sm">
                    {currentSource.subcategory}
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{content[language].reflectionPromptLabel}</h3>
              <p className="text-muted-foreground italic">{reflectionPrompt}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
              onClick={() => window.open(currentSource.sefaria_link, '_blank')} 
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
              sefariaLink: currentSource.sefaria_link
            }}
          />
        </Card>

        {/* Estimated Time */}
        <div className="text-center text-sm text-muted-foreground">
          Estimated time: {currentSource.estimated_time} minutes
        </div>
      </div>
    </div>
  );
};