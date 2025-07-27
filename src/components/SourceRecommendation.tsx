import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Language } from "./LanguageToggle";
import {
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Heart,
  Calendar,
  SkipForward,
  CheckCircle
} from "lucide-react";
import { useEffect, useState } from "react";

import sourcesByTopic, { SourceEntry } from "../data/sources";
interface SourceRecommendationProps {
  language: Language;
  timeSelected: number;
  topicSelected: string;
  onBack: () => void;
  onReflection: (source: SourceEntry) => void;
  onSessionAction?: (status: "saved" | "learned", source: SourceEntry) => void;
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
  time: number
): SourceEntry => {
  let topicKey = topic as keyof typeof sourcesByTopic;
  if (topicKey === 'surprise') {
    const keys = Object.keys(sourcesByTopic) as Array<keyof typeof sourcesByTopic>;
    topicKey = keys[Math.floor(Math.random() * keys.length)];
  }
  const options =
    sourcesByTopic[topicKey]?.[language] || sourcesByTopic.spiritual[language];
  const filtered = options.filter((s) => s.estimatedTime <= time);
  const chooseFrom = filtered.length ? filtered : options;
  return chooseFrom[Math.floor(Math.random() * chooseFrom.length)];
};

export const SourceRecommendation = ({
  language,
  timeSelected,
  topicSelected,
  onBack,
  onReflection
}: SourceRecommendationProps) => {
  const t = content[language];
  const [source, setSource] = useState<SourceEntry>(
    () => getSourceForTopic(topicSelected, language, timeSelected)
  );
  const isHebrew = language === 'he';

  // refresh source if topic, language or time changes
  useEffect(() => {
    setSource(getSourceForTopic(topicSelected, language, timeSelected));
  }, [topicSelected, language, timeSelected]);

  const handleSkip = () => {
    setSource(getSourceForTopic(topicSelected, language, timeSelected));
  };

  const handleCalendar = () => {
    const start = new Date();
    const end = new Date(start.getTime() + timeSelected * 60000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        source.title
      )}` +
      `&dates=${fmt(start)}/${fmt(end)}` +
      `&details=${encodeURIComponent(`${source.summary} ${source.sefariaLink}`)}`;
    window.open(url, "_blank");
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'skip':
        handleSkip();
        break;
      case 'calendar':
        handleCalendar();
        break;
      case 'reflection':
        onReflection(source);
        break;
      case 'save':
        onSessionAction?.('saved', source);
        break;
      case 'learned':
        onSessionAction?.('learned', source);
        break;
      default:
        break;
    }
  };

  return (
    <div className={`min-h-screen gradient-primary flex items-start justify-center p-4 pb-20 ${isHebrew ? 'hebrew' : ''}`}>
      <div className="w-full max-w-4xl mx-auto py-8 animate-fade-in bg-background/80 backdrop-blur-lg rounded-xl p-6 shadow-soft">
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
            className="flex items-center gap-2"
          >
            <SkipForward className="h-4 w-4" />
            {t.skipButton}
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
        <Card className="learning-card mb-8 gradient-warm">
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
            onClick={() => onReflection(source)}
            className="btn-spiritual flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            {t.reflectionButton}
          </Button>
        </div>
      </div>
    </div>
  );
};