import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Language } from "./LanguageToggle";


import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useAccessibilityAnnouncements } from "@/hooks/useAccessibility";
import { SocialSharing } from "./SocialSharing";
import { SourceLoadingState } from "./SourceLoadingState";
import { useMinimumLoading } from "@/hooks/useMinimumLoading";
import { useWebhookSource } from "@/hooks/useWebhookSource";
import { ExternalLink, SkipForward, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { MotionWrapper } from "@/components/MotionWrapper";
import { ScaleOnTap } from "@/components/ui/motion";
import { ScrollIcon } from "@/components/ui/torah-icons";
import { useSourceSession } from "@/hooks/useSourceSession";
import { SaveButton } from "@/components/source/SaveButton";
import { LearnedButton } from "@/components/source/LearnedButton";
import { CalendarButton } from "@/components/source/CalendarButton";
import { ReflectionButton } from "@/components/source/ReflectionButton";

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


  // Use webhook source instead of Supabase

  const { source: webhookSource, loading: webhookLoading, error: webhookError, refetch } = useWebhookSource(
    timeSelected,
    topicSelected,
    language
  );
  const showLoading = useMinimumLoading(webhookLoading);
  const { announce } = useAccessibilityAnnouncements();
  const {
    title,
    excerpt,
    reflectionPrompt,
    displayedCommentaries,
    currentSessionId,
    isSaved,
    isTogglingSave,
    handleToggleSave,
    handleMarkLearned,
    handleCalendar
  } = useSourceSession({
    source: webhookSource,
    topicSelected,
    timeSelected,
    language,
    content: {
      saveToggle: content[language].saveToggle,
      learnedButton: content[language].learnedButton,
      calendarButton: content[language].calendarButton
    }
  });

  // Set up keyboard navigation
  useKeyboardNavigation({
    shortcuts: [
      { key: 'ArrowLeft', action: onBack, description: 'Go back' },
      { key: 'Enter', action: () => webhookSource && handleReflection(), description: 'Write reflection' },
      { key: 's', action: () => webhookSource && handleToggleSave(), description: 'Save source' },
      { key: 'l', action: () => webhookSource && handleMarkLearned(), description: 'Mark as learned' },
      { key: 'n', action: () => webhookSource && handleSkip(), description: 'Skip source' }
    ]
  });
  const handleSkip = () => {
    if (!webhookSource) return;
    console.log('⏭️ Skipping webhook source:', webhookSource.title);
    announce(`Skipping to new source`);
    refetch();
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

  return (
    <div className="min-h-screen bg-gradient-parchment mobile-container">
      <div className="max-w-4xl mx-auto mobile-scroll" style={{ maxHeight: 'calc(100vh - env(safe-area-inset-bottom, 0px) - 80px)' }}>
        <div className="space-y-4 pb-20">
          {/* Header */}
          <MotionWrapper type="scale" delay={0.1}>
            <div className="text-center mobile-spacing-y">
                <h1 className="mobile-text-base font-bold gradient-primary bg-clip-text text-transparent sm:text-2xl">
                  {content[language].title}
                </h1>
              <p className="mobile-text-sm text-muted-foreground">{content[language].subtitle}</p>
            </div>
          </MotionWrapper>

          {/* Webhook Source Display */}
          <MotionWrapper type="fadeUp" delay={0.2}>
            <div className="content-card">
              <div className="space-y-4">
                <div className="mobile-flex-col items-start">
                  <div className="flex-1 space-y-2">
                    <h2 className="mobile-text-base font-semibold sm:text-xl">{title}</h2>
                    <p className="mobile-text-xs text-muted-foreground">{webhookSource.source_range}</p>
                  </div>
                  
                  {/* Save Toggle Button - Mobile Optimized */}
                  <ScaleOnTap>
                    <Button
                      variant={isSaved ? "default" : "outline"}
                      size="sm"
                      onClick={handleToggleSave}
                      disabled={isTogglingSave}
                      className="touch-button flex items-center gap-2 min-w-[120px] transition-all duration-200"
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="h-4 w-4" />
                          <span className="mobile-text-xs">{content[language].savedIndicator}</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="h-4 w-4" />
                          <span className="mobile-text-xs">{content[language].saveToggle}</span>
                        </>
                      )}
                    </Button>
                  </ScaleOnTap>
                </div>
                
                {excerpt && (
                  <MotionWrapper type="fadeUp" delay={0.3}>
                    <div className="bg-gradient-to-r from-secondary/20 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
                      <ScrollIcon className="h-6 w-6 text-primary mb-2" />
                      <p className="mobile-text-sm leading-relaxed text-foreground">{excerpt}</p>
                    </div>
                  </MotionWrapper>
                )}
                
                {displayedCommentaries.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="mobile-text-sm font-semibold">{content[language].commentariesLabel}</h3>
                    <div className="flex flex-wrap gap-2">
                      {displayedCommentaries.map((commentary, index) => (
                        <span key={index} className="mobile-text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
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
                    className="w-full touch-button"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span className="mobile-text-sm">{content[language].sefariaLink}</span>
                  </Button>
                )}
              </div>
            </div>
          </MotionWrapper>

          {reflectionPrompt && (
            <MotionWrapper type="fadeUp" delay={0.4}>
              <div className="content-card bg-gradient-to-r from-accent/5 to-secondary/10 border-accent/20">
                <h3 className="mobile-text-sm font-semibold text-primary">{content[language].reflectionPromptLabel}</h3>
                <p className="mobile-text-sm text-muted-foreground italic leading-relaxed">{reflectionPrompt}</p>
              </div>
            </MotionWrapper>
          )}

          {/* Action Buttons - Mobile Optimized */}
          <MotionWrapper type="fadeUp" delay={0.5}>
            <div className="content-card space-y-4 border-primary/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  disabled={webhookLoading}
                  className="touch-button"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  <span className="mobile-text-sm">{content[language].skipButton}</span>
                </Button>

                <SaveButton
                  onClick={handleToggleSave}
                  disabled={webhookLoading}
                  label={content[language].saveButton}
                />

                <LearnedButton
                  onClick={handleMarkLearned}
                  disabled={webhookLoading}
                  label={content[language].learnedButton}
                />

                <CalendarButton
                  onClick={handleCalendar}
                  label={content[language].calendarButton}
                  className="sm:col-span-2 lg:col-span-1"
                />
              </div>

              <ReflectionButton
                onClick={handleReflection}
                disabled={webhookLoading}
                label={content[language].reflectionButton}
              />
            </div>
          </MotionWrapper>

          {/* Social Sharing */}
          <MotionWrapper type="fadeUp" delay={0.6}>
            <SocialSharing
              language={language}
              source={{
                title: title || '',
                text: excerpt || '',
                sefariaLink: webhookSource.sefaria_link ?? ''
              }}
            />
          </MotionWrapper>
        </div>
      </div>
    </div>
  );
};