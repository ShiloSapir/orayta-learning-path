import { useState, useEffect } from "react";
import type { SourceEntry } from "@/data/sources";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Language } from "./LanguageToggle";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useAccessibilityAnnouncements } from "@/hooks/useAccessibility";
import { useMinimumLoading } from "@/hooks/useMinimumLoading";
import { SocialSharing } from "./SocialSharing";
import { 
  ArrowLeft, 
  ExternalLink, 
  BookOpen, 
  Heart, 
  Calendar,
  SkipForward,
  CheckCircle
} from "lucide-react";

interface SourceRecommendationProps {
  language: Language;
  timeSelected: number;
  topicSelected: string;
  onBack: () => void;
  onReflection: () => void;
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
    sefariaLink: "Open in Sefaria"
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
    sefariaLink: "פתח בספריא"
  }
};

const getSourceForTopic = (
  topic: string,
  language: Language,
  sourcesData: Record<string, Record<Language, SourceEntry[]>>
): SourceEntry | null => {
  let topicKey = topic as keyof typeof sourcesData;
  if (topicKey === "surprise") {
    const keys = Object.keys(
      sourcesData
    ) as Array<keyof typeof sourcesData>;
    topicKey = keys[Math.floor(Math.random() * keys.length)];
  }

  const options = sourcesData[topicKey]?.[language];
  if (!options || options.length === 0) {
    return null;
  }
  return options[Math.floor(Math.random() * options.length)];
};

export const SourceRecommendation = ({
  language,
  timeSelected,
  topicSelected,
  onBack,
  onReflection
}: SourceRecommendationProps) => {
  const [sources, setSources] = useState<Record<string, Record<Language, SourceEntry[]>> | null>(null);
  const [currentSource, setCurrentSource] = useState<SourceEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const showGenerating = useMinimumLoading(isLoading);
  const [error, setError] = useState<string | null>(null);
  
  const t = content[language];
  const isHebrew = language === 'he';
  const toast = useToast();
  const { announce } = useAccessibilityAnnouncements();

  // Load source data lazily to keep initial bundle small.
  // This can be replaced with a backend request in the future.
  useEffect(() => {
    let mounted = true;
    import("@/data/sources")
      .then(mod => {
        if (mounted) setSources(mod.sourcesByTopic);
      })
      .catch(() => setError("Failed to load sources"));
    return () => {
      mounted = false;
    };
  }, []);

  // Keyboard shortcuts
  useKeyboardNavigation({
    shortcuts: [
      { key: 'Escape', action: onBack, description: 'Go back' },
      { key: 's', action: () => handleAction('skip'), description: 'Skip source' },
      { key: 'r', action: onReflection, description: 'Write reflection' },
      { key: 'c', action: () => handleAction('calendar'), description: 'Add to calendar' }
    ]
  });

  // Initialize source on component mount or when topic/language changes
  useEffect(() => {
    if (!sources) return;
    const source = getSourceForTopic(topicSelected, language, sources);
    if (source) {
      setCurrentSource(source);
      setError(null);
    } else {
      setCurrentSource(null);
      setError('No sources available for this topic');
    }
  }, [topicSelected, language, sources]);

  const generateNewSource = () => {
    if (!sources) return;
    setIsLoading(true);
    setError(null);

    try {
      // Get all sources for the current topic
      const topicSources = sources[topicSelected]?.[language];
      if (!topicSources || topicSources.length === 0) {
        throw new Error('No sources available for this topic');
      }

      // Filter out current source to ensure we get a different one
      const availableSources = topicSources.filter(source =>
        currentSource ? source.title !== currentSource.title : true
      );

      if (availableSources.length === 0) {
        // If no different sources available, keep current one
        setError('No alternative sources available');
        setIsLoading(false);
        return;
      }

      // Select random source from available ones
      const randomIndex = Math.floor(Math.random() * availableSources.length);
      const newSource = availableSources[randomIndex];

      setCurrentSource(newSource);
      setIsLoading(false);
      announce(`New source loaded: ${newSource.title}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate new source');
      setIsLoading(false);
      announce('Failed to load new source');
    }
  };

  const handleAction = (action: string) => {
    console.log(`Action: ${action}`);
    
    switch (action) {
      case 'skip':
        generateNewSource();
        announce('Generating new source');
        break;
      case 'save':
        // TODO: Implement save functionality with Supabase
        toast.info('Source saved for later study', {
          description: 'This feature requires Supabase integration'
        });
        break;
      case 'learned':
        // TODO: Implement learned functionality with Supabase
        toast.success('Source marked as learned', {
          description: 'This feature requires Supabase integration'
        });
        break;
      case 'calendar':
        // TODO: Implement calendar integration
        toast.info('Calendar integration coming soon', {
          description: 'This feature requires backend setup'
        });
        break;
      case 'reflection':
        onReflection();
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  // Show loading state if source is not yet loaded
  if (!currentSource && !error) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading source...</p>
        </div>
      </div>
    );
  }

  // Show error state if source failed to load
  if (error && !currentSource) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
            <Button variant="secondary" onClick={onBack}>Change Topic</Button>
          </div>
        </div>
      </div>
    );
  }

  const source = currentSource!;

  return (
    <div 
      className={`min-h-screen bg-gradient-subtle p-4 pb-20 ${isHebrew ? 'hebrew' : ''}`}
      id="main-content"
      role="main"
      aria-label={`Source recommendation for ${topicSelected}`}
    >
      <div className="max-w-4xl mx-auto py-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backButton}
          </Button>
          <div className="text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">
              {timeSelected} min • {topicSelected}
            </div>
          </div>
            <Button
              variant="ghost"
              onClick={() => handleAction('skip')}
              disabled={showGenerating}
              className="flex items-center gap-2"
            >
              {showGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <SkipForward className="h-4 w-4" />
              )}
              {showGenerating ? 'Loading...' : t.skipButton}
            </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t.title}
          </h1>
          <p className="text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* Source Card */}
        <Card className="learning-card mb-8 bg-gradient-warm">
          <div className="space-y-6">
            {/* Source Title */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {source.title}
              </h2>
              <div className="text-sm text-muted-foreground">
                {t.fromTo} {source.startRef} {t.to} {source.endRef}
              </div>
            </div>

            {/* Summary */}
            <div>
              <p className="text-foreground leading-relaxed">
                {source.summary}
              </p>
            </div>

            {/* Main Text */}
            <div className="bg-card/50 rounded-lg p-6 border border-border/50">
              <p className={`text-spiritual ${isHebrew ? 'text-hebrew' : ''}`}>
                {source.text}
              </p>
            </div>

            {/* Commentaries */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                {t.commentariesLabel}
              </h3>
              <div className="flex flex-wrap gap-2">
                {source.commentaries.map((commentary, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {commentary}
                  </span>
                ))}
              </div>
            </div>

            {/* Reflection Prompt */}
            <div className="bg-accent/20 rounded-lg p-4 border border-accent/30">
              <h3 className="font-semibold text-accent-foreground mb-2">
                {t.reflectionPromptLabel}
              </h3>
              <p className="text-accent-foreground/80 leading-relaxed">
                {source.reflectionPrompt}
              </p>
            </div>

            {/* Sefaria Link */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => window.open(source.sefariaLink, '_blank')}
                className="btn-gentle"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t.sefariaLink}
              </Button>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => handleAction('save')}
            className="btn-gentle flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            {t.saveButton}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleAction('learned')}
            className="btn-gentle flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {t.learnedButton}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleAction('calendar')}
            className="btn-gentle flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            {t.calendarButton}
          </Button>
          
          <Button
            onClick={onReflection}
            className="btn-spiritual flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            {t.reflectionButton}
          </Button>
        </div>

        {/* Social Sharing */}
        <div className="mt-8">
          <SocialSharing 
            language={language}
            source={{
              title: source.title,
              text: source.text,
              tags: source.commentaries,
              sefariaLink: source.sefariaLink
            }}
          />
        </div>
      </div>
    </div>
  );
};