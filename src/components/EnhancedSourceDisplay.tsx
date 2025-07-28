import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Source } from "@/hooks/useSupabaseData";
import { Language } from "./LanguageToggle";
import { 
  ExternalLink, 
  MapPin, 
  Clock, 
  GraduationCap,
  BookOpen,
  Target,
  CheckCircle
} from "lucide-react";

interface EnhancedSourceDisplayProps {
  source: Source;
  language: Language;
  onSefariaClick: () => void;
}

const content = {
  en: {
    torahReference: "Torah Reference",
    from: "From",
    to: "to",
    studyHere: "Study from",
    category: "Category",
    difficulty: "Difficulty Level",
    estimatedTime: "Estimated Time",
    timeRange: "Time Range",
    objectives: "Learning Objectives",
    prerequisites: "Prerequisites",
    sourceType: "Source Type",
    openSefaria: "Open in Sefaria",
    minutes: "minutes",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    text_study: "Text Study",
    practical_halacha: "Practical Halacha",
    philosophical: "Philosophical",
    historical: "Historical",
    mystical: "Mystical"
  },
  he: {
    torahReference: "מקור תורני",
    from: "מ",
    to: "עד",
    studyHere: "למד מ",
    category: "קטגוריה",
    difficulty: "רמת קושי",
    estimatedTime: "זמן משוער",
    timeRange: "טווח זמן",
    objectives: "מטרות למידה",
    prerequisites: "דרישות קדם",
    sourceType: "סוג מקור",
    openSefaria: "פתח בספריא",
    minutes: "דקות",
    beginner: "מתחיל",
    intermediate: "בינוני",
    advanced: "מתקדם",
    text_study: "לימוד טקסט",
    practical_halacha: "הלכה למעשה",
    philosophical: "פילוסופי",
    historical: "היסטורי",
    mystical: "מיסטי"
  }
};

export const EnhancedSourceDisplay = ({ 
  source, 
  language, 
  onSefariaClick 
}: EnhancedSourceDisplayProps) => {
  const t = content[language];
  const title = language === 'he' ? source.title_he : source.title;
  const textExcerpt = language === 'he' ? source.text_excerpt_he : source.text_excerpt;

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getSourceTypeColor = (type?: string) => {
    switch (type) {
      case 'text_study': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'practical_halacha': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'philosophical': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'historical': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'mystical': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Title and Basic Info */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {source.category}
            </Badge>
            {source.subcategory && (
              <Badge variant="secondary">{source.subcategory}</Badge>
            )}
          </div>
        </div>

        {/* Torah Reference Section - Enhanced for exact location */}
        {(source.start_ref || source.end_ref) && (
          <div className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-primary">{t.torahReference}</h3>
            </div>
            <div className="space-y-2">
              {source.start_ref && source.end_ref ? (
                <p className="text-lg font-medium">
                  <span className="text-primary">{t.studyHere}:</span>{" "}
                  <span className="font-bold">{source.start_ref}</span>{" "}
                  <span className="text-muted-foreground">{t.to}</span>{" "}
                  <span className="font-bold">{source.end_ref}</span>
                </p>
              ) : (
                <p className="text-lg font-medium">
                  <span className="text-primary">{t.studyHere}:</span>{" "}
                  <span className="font-bold">{source.start_ref || source.end_ref}</span>
                </p>
              )}
              <Button 
                onClick={onSefariaClick}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                {t.openSefaria}
              </Button>
            </div>
          </div>
        )}

        {/* Text Excerpt */}
        {textExcerpt && (
          <div className="bg-secondary/30 rounded-lg p-4">
            <p className="leading-relaxed text-foreground/90 italic">
              "{textExcerpt}"
            </p>
          </div>
        )}
      </div>

      {/* Study Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Time Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{t.estimatedTime}</span>
          </div>
          <div className="space-y-2">
            <Badge variant="outline" className="text-sm">
              {source.estimated_time} {t.minutes}
            </Badge>
            {(source.min_time || source.max_time) && (
              <div className="text-sm text-muted-foreground">
                {t.timeRange}: {source.min_time || source.estimated_time - 5}-{source.max_time || source.estimated_time + 5} {t.minutes}
              </div>
            )}
          </div>
        </div>

        {/* Difficulty & Type */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{t.difficulty}</span>
          </div>
          <div className="space-y-2">
            {source.difficulty_level && (
              <Badge className={getDifficultyColor(source.difficulty_level)}>
                {t[source.difficulty_level as keyof typeof t] || source.difficulty_level}
              </Badge>
            )}
            {source.source_type && (
              <Badge className={getSourceTypeColor(source.source_type)}>
                {t[source.source_type as keyof typeof t] || source.source_type}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Learning Objectives */}
      {source.learning_objectives && source.learning_objectives.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{t.objectives}</span>
          </div>
          <ul className="space-y-1">
            {source.learning_objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prerequisites */}
      {source.prerequisites && source.prerequisites.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{t.prerequisites}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {source.prerequisites.map((prereq, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {prereq}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Commentaries */}
      {source.commentaries && source.commentaries.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Suggested Commentaries
          </h3>
          <div className="flex flex-wrap gap-2">
            {source.commentaries.map((commentary, index) => (
              <Badge key={index} variant="secondary">
                {commentary}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};