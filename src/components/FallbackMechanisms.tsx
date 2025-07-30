import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Language } from "./LanguageToggle";
import { Source } from "@/hooks/useSupabaseData";
import { normalizeTopic } from "@/utils/normalizeTopic";
import { 
  AlertTriangle, 
  Clock, 
  BookOpen, 
  ArrowRight, 
  Lightbulb,
  Calendar,
  Star
} from "lucide-react";

interface FallbackMechanismsProps {
  language: Language;
  timeSelected: number;
  topicSelected: string;
  availableSources: Source[];
  onTopicChange: (topic: string) => void;
  onTimeChange: (time: number) => void;
  onBack: () => void;
}

const content = {
  en: {
    noExactMatch: "No Perfect Match Found",
    noExactMatchDesc: "We couldn't find sources that exactly match your criteria, but here are some alternatives:",
    relatedTopics: "Related Topics Available",
    alternativeTimes: "Try Different Time Slots",
    suggestedSources: "Suggested Alternatives",
    comingSoon: "Coming Soon",
    comingSoonDesc: "More sources for this topic are being prepared",
    adjustCriteria: "Adjust Your Selection",
    expandSearch: "Expand Search",
    minutes: "minutes",
    sources: "sources",
    source: "source",
    tryThis: "Try This",
    orTry: "Or try",
    timeRange: "Time Range",
    difficulty: "Difficulty",
    category: "Category",
    noSourcesTitle: "No Sources Available",
    noSourcesDesc: "Unfortunately, we don't have any sources for this combination yet.",
    suggestionsTitle: "Here's what you can do:",
    suggestion1: "Try a different topic",
    suggestion2: "Adjust your time selection",
    suggestion3: "Check back later for new content",
    backButton: "Go Back",
    expandButton: "Show More Options",
    notifyButton: "Notify When Ready"
  },
  he: {
    noExactMatch: "לא נמצא התאמה מושלמת",
    noExactMatchDesc: "לא מצאנו מקורות שמתאימים בדיוק לקריטריונים שלך, אבל הנה כמה חלופות:",
    relatedTopics: "נושאים קשורים זמינים",
    alternativeTimes: "נסה זמנים שונים",
    suggestedSources: "חלופות מוצעות",
    comingSoon: "בקרוב",
    comingSoonDesc: "מקורות נוספים לנושא זה בהכנה",
    adjustCriteria: "התאם את הבחירה שלך",
    expandSearch: "הרחב חיפוש",
    minutes: "דקות",
    sources: "מקורות",
    source: "מקור",
    tryThis: "נסה זה",
    orTry: "או נסה",
    timeRange: "טווח זמן",
    difficulty: "רמת קושי",
    category: "קטגוריה",
    noSourcesTitle: "אין מקורות זמינים",
    noSourcesDesc: "לצערנו, אין לנו מקורות לשילוב זה עדיין.",
    suggestionsTitle: "הנה מה שאתה יכול לעשות:",
    suggestion1: "נסה נושא אחר",
    suggestion2: "התאם את בחירת הזמן",
    suggestion3: "חזור מאוחר יותר לתוכן חדש",
    backButton: "חזור",
    expandButton: "הצג אפשרויות נוספות",
    notifyButton: "הודע כשמוכן"
  }
};

export const FallbackMechanisms = ({
  language,
  timeSelected,
  topicSelected,
  availableSources,
  onTopicChange,
  onTimeChange,
  onBack
}: FallbackMechanismsProps) => {
  const [expandedOptions, setExpandedOptions] = useState(false);
  const [notificationRequested, setNotificationRequested] = useState(false);

  const t = content[language];

  // Analyze available alternatives
  const getRelatedTopics = () => {
    const topicRelations: Record<string, string[]> = {
      halacha: ['rambam', 'talmud'],
      rambam: ['halacha', 'spiritual'],
      tanakh: ['spiritual', 'talmud'],
      talmud: ['halacha', 'tanakh'],
      spiritual: ['rambam', 'tanakh']
    };

    const normalized = normalizeTopic(topicSelected);
    const related = topicRelations[normalized] || [];

    return related
      .map(topic => {
        const count = availableSources.filter(s =>
          normalizeTopic(s.category) === topic && s.published
        ).length;
        return { topic, count };
      })
      .filter(item => item.count > 0);
  };

  const getAlternativeTimes = () => {
    const timeOptions = [10, 15, 20, 30, 45, 60];
    return timeOptions
      .filter(time => time !== timeSelected)
      .map(time => {
        const sourcesCount = availableSources.filter(s => 
          time >= (s.min_time || s.estimated_time - 5) &&
          time <= (s.max_time || s.estimated_time + 5) &&
          s.published
        ).length;
        return { time, count: sourcesCount };
      })
      .filter(item => item.count > 0)
      .sort((a, b) => Math.abs(a.time - timeSelected) - Math.abs(b.time - timeSelected))
      .slice(0, 3);
  };

  const getClosestSources = () => {
    const normalized = normalizeTopic(topicSelected);
    const related = getRelatedTopics().map(r => r.topic);

    return availableSources
      .filter(s => s.published)
      .map(source => {
        let score = 0;

        const cat = normalizeTopic(source.category);
        const sub = normalizeTopic(source.subcategory || '');

        if (cat === normalized || sub === normalized) {
          score += 10;
        } else if (related.includes(cat) || related.includes(sub)) {
          score += 5;
        }

        const timeDiff = Math.abs(source.estimated_time - timeSelected);
        score += Math.max(0, 5 - timeDiff / 5);

        return { source, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.source);
  };

  const handleNotifyRequest = () => {
    setNotificationRequested(true);
    // Here you would typically save the notification request to the database
  };

  const relatedTopics = getRelatedTopics();
  const alternativeTimes = getAlternativeTimes();
  const closestSources = getClosestSources();

  if (availableSources.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-6 space-y-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto" />
            <h2 className="text-2xl font-bold">{t.noSourcesTitle}</h2>
            <p className="text-muted-foreground">{t.noSourcesDesc}</p>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>{t.suggestionsTitle}</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>{t.suggestion1}</li>
                <li>{t.suggestion2}</li>
                <li>{t.suggestion3}</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onBack} variant="outline" className="flex-1">
              {t.backButton}
            </Button>
            <Button 
              onClick={handleNotifyRequest} 
              variant="outline"
              disabled={notificationRequested}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {notificationRequested ? "✓ Requested" : t.notifyButton}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-warning" />
            <h2 className="text-xl font-bold">{t.noExactMatch}</h2>
          </div>
          <p className="text-muted-foreground mb-4">{t.noExactMatchDesc}</p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {timeSelected} {t.minutes}
            </Badge>
            <Badge variant="outline">
              <BookOpen className="h-3 w-3 mr-1" />
              {topicSelected}
            </Badge>
          </div>
        </Card>

        {/* Related Topics */}
        {relatedTopics.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t.relatedTopics}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatedTopics.map(({ topic, count }) => (
                <Button
                  key={topic}
                  variant="outline"
                  onClick={() => onTopicChange(topic)}
                  className="justify-between h-auto p-4"
                >
                  <span className="capitalize">{topic}</span>
                  <Badge variant="secondary">
                    {count} {count === 1 ? t.source : t.sources}
                  </Badge>
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Alternative Times */}
        {alternativeTimes.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t.alternativeTimes}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {alternativeTimes.map(({ time, count }) => (
                <Button
                  key={time}
                  variant="outline"
                  onClick={() => onTimeChange(time)}
                  className="flex-col h-auto p-4 space-y-1"
                >
                  <span className="font-semibold">{time} {t.minutes}</span>
                  <Badge variant="secondary" className="text-xs">
                    {count} {count === 1 ? t.source : t.sources}
                  </Badge>
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Closest Sources */}
        {closestSources.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5" />
              {t.suggestedSources}
            </h3>
            <div className="space-y-4">
              {closestSources.slice(0, expandedOptions ? closestSources.length : 2).map((source) => (
                <div 
                  key={source.id}
                  className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">
                      {language === 'he' ? source.title_he : source.title}
                    </h4>
                    <Badge variant="outline">{source.estimated_time} {t.minutes}</Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{source.category}</Badge>
                    {source.difficulty_level && (
                      <Badge variant="outline">{source.difficulty_level}</Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        onTopicChange(source.category);
                        onTimeChange(source.estimated_time);
                      }}
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      {t.tryThis}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {closestSources.length > 2 && (
              <Button 
                variant="ghost" 
                onClick={() => setExpandedOptions(!expandedOptions)}
                className="w-full mt-4"
              >
                {expandedOptions ? "Show Less" : t.expandButton}
              </Button>
            )}
          </Card>
        )}

        {/* Coming Soon Notice */}
        <Card className="p-6 bg-primary/5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{t.comingSoon}</h3>
          </div>
          <p className="text-muted-foreground mb-4">{t.comingSoonDesc}</p>
          <Button 
            variant="outline" 
            onClick={handleNotifyRequest}
            disabled={notificationRequested}
          >
            {notificationRequested ? "✓ We'll notify you" : t.notifyButton}
          </Button>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button onClick={onBack} variant="outline" size="lg">
            {t.backButton}
          </Button>
        </div>
      </div>
    </div>
  );
};