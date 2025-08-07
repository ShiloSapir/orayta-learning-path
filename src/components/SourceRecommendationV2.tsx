import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Language } from "./LanguageToggle";
import { useAuth } from "@/hooks/useAuth";
import { useAppToast } from "@/hooks/useToast";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useAccessibilityAnnouncements } from "@/hooks/useAccessibility";
import { SocialSharing } from "./SocialSharing";
import { SourceLoadingState } from "./SourceLoadingState";
import { useMinimumLoading } from "@/hooks/useMinimumLoading";
import { useWebhookSource, WebhookSource } from "@/hooks/useWebhookSource";
import { 
  ExternalLink, 
  BookOpen, 
  Heart, 
  Calendar,
  SkipForward,
  CheckCircle,
  BookmarkPlus,
  BookmarkCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MotionWrapper, StaggeredContainer } from "@/components/MotionWrapper";
import { ScaleOnTap } from "@/components/ui/motion";
import { useBlessingToast } from "@/components/ui/blessing-toast";
import { ScrollIcon } from "@/components/ui/torah-icons";

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
    saveToggle: "Save Source",
    savedIndicator: "Saved",
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
    saveToggle: "שמור מקור",
    savedIndicator: "נשמר",
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
  const { success } = useAppToast();
  const { showBlessing } = useBlessingToast();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isTogglingSave, setIsTogglingSave] = useState<boolean>(false);
  
  // Use webhook source instead of Supabase
  const { source: webhookSource, loading: webhookLoading, error: webhookError, refetch } = useWebhookSource(
    timeSelected, 
    topicSelected, 
    language
  );

  const showLoading = useMinimumLoading(webhookLoading);
  const { announce } = useAccessibilityAnnouncements();

  // Set up keyboard navigation
  useKeyboardNavigation({
    shortcuts: [
      { key: 'ArrowLeft', action: onBack, description: 'Go back' },
      { key: 'Enter', action: () => webhookSource && handleReflection(), description: 'Write reflection' },
      { key: 's', action: () => webhookSource && handleSave(), description: 'Save source' },
      { key: 'l', action: () => webhookSource && handleMarkLearned(), description: 'Mark as learned' },
      { key: 'n', action: () => webhookSource && handleSkip(), description: 'Skip source' }
    ]
  });

  // Create a session when source is loaded
  useEffect(() => {
    if (webhookSource && user && !currentSessionId) {
      createSessionForWebhookSource(webhookSource);
    }
  }, [webhookSource, user, currentSessionId]);

  const createSessionForWebhookSource = async (source: WebhookSource) => {
    if (!user) return;
    
    // Create a simple session tracking for webhook sources
    const sessionId = crypto.randomUUID();
    setCurrentSessionId(sessionId);
    
    // Store session data in localStorage for now
    const sessionData = {
      id: sessionId,
      user_id: user.id,
      topic_selected: topicSelected,
      time_selected: timeSelected,
      source_title: source.title,
      status: 'recommended',
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem(`webhook_session_${sessionId}`, JSON.stringify(sessionData));
  };

  const handleSkip = async () => {
    if (!webhookSource) return;
    
    console.log('⏭️ Skipping webhook source:', webhookSource.title);
    announce(`Skipping to new source`);
    
    // Generate new source
    refetch();
  };

  const handleToggleSave = async () => {
    if (!user || !webhookSource || isTogglingSave) return;
    
    setIsTogglingSave(true);
    try {
      if (!isSaved) {
        // Save to database
        const { error } = await supabase
          .from('saved_sources')
          .insert({
            user_id: user.id,
            source_title: webhookSource.title,
            source_title_he: webhookSource.title_he,
            source_excerpt: webhookSource.excerpt,
            source_excerpt_he: webhookSource.excerpt,
            sefaria_link: webhookSource.sefaria_link,
            topic_selected: topicSelected,
            time_selected: timeSelected,
            is_saved: true
          });

        if (error) throw error;
        
        setIsSaved(true);
        showBlessing(language === 'he' ? 'חזק וברוך!' : 'Chazak u\'Baruch!');
        success(content[language].saveToggle);
      } else {
        // Remove from database - find by matching content
        const { error } = await supabase
          .from('saved_sources')
          .delete()
          .eq('user_id', user.id)
          .eq('source_title', webhookSource.title)
          .eq('topic_selected', topicSelected);

        if (error) throw error;
        
        setIsSaved(false);
        success("Removed from saved");
      }
    } catch (error: any) {
      console.error('Error toggling save:', error);
    } finally {
      setIsTogglingSave(false);
    }
  };

  const handleSave = async () => {
    // Legacy save function - now just calls the toggle
    handleToggleSave();
  };

  const handleMarkLearned = async () => {
    if (!currentSessionId || !webhookSource) return;
    
    // Update session status in localStorage
    const sessionKey = `webhook_session_${currentSessionId}`;
    const sessionData = JSON.parse(localStorage.getItem(sessionKey) || '{}');
    sessionData.status = 'learned';
    sessionData.updated_at = new Date().toISOString();
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    
    success(content[language].learnedButton);
  };

  const handleCalendar = () => {
    if (!webhookSource) return;
    
    const title = language === 'he' ? webhookSource.title_he : webhookSource.title;
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

  if (showLoading) {
    return (
      <SourceLoadingState
        message={content[language].loading}
        variant="detailed"
      />
    );
  }

  if (webhookError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 flex items-center justify-center">
        <Card className="p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-4">Error Loading Source</h2>
          <p className="text-muted-foreground mb-4">
            Failed to load your Torah source. Please try again.
          </p>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (!webhookSource) {
    return (
      <SourceLoadingState
        message={content[language].loading}
        variant="detailed"
      />
    );
  }

  const title = language === 'he' ? webhookSource.title_he : webhookSource.title;
  const excerpt = webhookSource.excerpt;
  const reflectionPrompt = webhookSource.reflection_prompt;

  return (
    <MotionWrapper type="fadeUp" className="min-h-screen bg-gradient-parchment p-4">
      <StaggeredContainer className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <MotionWrapper type="scale" delay={0.1}>
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {content[language].title}
            </h1>
            <p className="text-muted-foreground">{content[language].subtitle}</p>
          </div>
        </MotionWrapper>

        {/* Webhook Source Display */}
        <MotionWrapper type="fadeUp" delay={0.2}>
          <Card className="p-6 shadow-divine border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">{title}</h2>
                <p className="text-sm text-muted-foreground mb-4">{webhookSource.source_range}</p>
              </div>
              
              {/* Save Toggle Button */}
              <ScaleOnTap>
                <Button
                  variant={isSaved ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggleSave}
                  disabled={isTogglingSave}
                  className="flex items-center gap-2 min-w-[100px] transition-all duration-200"
                >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4" />
                    {content[language].savedIndicator}
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-4 w-4" />
                    {content[language].saveToggle}
                  </>
                )}
                </Button>
              </ScaleOnTap>
            </div>
            
            {excerpt && (
              <MotionWrapper type="fadeUp" delay={0.3}>
                <div className="bg-gradient-to-r from-secondary/20 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
                  <ScrollIcon className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm leading-relaxed text-foreground">{excerpt}</p>
                </div>
              </MotionWrapper>
            )}
            
            {webhookSource.commentaries.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">{content[language].commentariesLabel}</h3>
                <div className="flex flex-wrap gap-2">
                  {webhookSource.commentaries.map((commentary, index) => (
                    <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {commentary}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {webhookSource.sefaria_link && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(webhookSource.sefaria_link, '_blank')}
                className="w-full sm:w-auto"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {content[language].sefariaLink}
              </Button>
            )}
            </div>
          </Card>
        </MotionWrapper>

        {/* Reflection Prompt */}
        <MotionWrapper type="fadeUp" delay={0.4}>
          <Card className="p-6 shadow-gentle border-accent/20 bg-gradient-to-r from-accent/5 to-secondary/10">
            <h3 className="font-semibold mb-2 text-primary">{content[language].reflectionPromptLabel}</h3>
            <p className="text-muted-foreground italic leading-relaxed">{reflectionPrompt}</p>
          </Card>
        </MotionWrapper>

        {/* Action Buttons */}
        <MotionWrapper type="fadeUp" delay={0.5}>
          <Card className="p-6 space-y-4 shadow-blessed border-primary/10">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              onClick={handleSkip}
              variant="outline"
              disabled={webhookLoading}
            >
              <SkipForward className="h-4 w-4 mr-2" />
              {content[language].skipButton}
            </Button>
            
            <Button
              onClick={handleSave}
              variant="outline"
              disabled={webhookLoading}
            >
              <Heart className="h-4 w-4 mr-2" />
              {content[language].saveButton}
            </Button>
            
            <Button
              onClick={handleMarkLearned}
              variant="outline"
              disabled={webhookLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {content[language].learnedButton}
            </Button>
            
            <Button
              onClick={handleCalendar}
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {content[language].calendarButton}
            </Button>
            </div>

            <Button
              onClick={handleReflection}
              className="w-full"
              disabled={webhookLoading}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {content[language].reflectionButton}
            </Button>
          </Card>
        </MotionWrapper>

        {/* Social Sharing */}
        <MotionWrapper type="fadeUp" delay={0.6}>
          <SocialSharing
            language={language}
            source={{
              title: title,
              text: excerpt || '',
              sefariaLink: webhookSource.sefaria_link
            }}
          />
        </MotionWrapper>
      </StaggeredContainer>
    </MotionWrapper>
  );
};