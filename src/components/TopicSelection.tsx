import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Language } from "./LanguageToggle";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSmartRecommendation } from "@/hooks/useSmartRecommendation";
import { 
  Book,
  Scale, 
  Scroll, 
  Users, 
  Heart, 
  Shuffle,
  Clock,
  TrendingUp
} from "lucide-react";

interface TopicSelectionProps {
  language: Language;
  selectedTopic: string | null;
  timeSelected: number;
  onTopicSelect: (topic: string) => void;
  onNext: () => void;
}

const content = {
  en: {
    title: "What would you like to learn?",
    subtitle: "Choose a topic that speaks to your soul",
    backButton: "Back",
    nextButton: "Start Learning",
    topics: {
      halacha: {
        title: "Halacha",
        subtitle: "Daily Jewish Law",
        subcategories: ["Shabbat", "Kashrut", "Daily Practice"]
      },
      rambam: {
        title: "Rambam",
        subtitle: "Maimonides' Wisdom",
        subcategories: ["Hilchot Deot", "Hilchot Teshuva"]
      },
      tanakh: {
        title: "Tanakh",
        subtitle: "Biblical Wisdom",
        subcategories: ["Weekly Portion", "Prophets", "Writings"]
      },
      talmud: {
        title: "Talmud",
        subtitle: "Rabbinic Discussion",
        subcategories: ["Pirkei Avot", "Short Sugyot"]
      },
      spiritual: {
        title: "Spiritual Growth",
        subtitle: "Inner Development",
        subcategories: ["Mussar", "Chassidut", "Jewish Thought"]
      },
      surprise: {
        title: "Surprise Me",
        subtitle: "Random Divine Selection",
        subcategories: []
      }
    }
  },
  he: {
    title: "מה תרצה ללמוד?",
    subtitle: "בחר נושא הדובר אל נשמתך",
    backButton: "חזור",
    nextButton: "התחל ללמוד",
    topics: {
      halacha: {
        title: "הלכה",
        subtitle: "דין יהודי יומיומי",
        subcategories: ["שבת", "כשרות", "עבודת היום"]
      },
      rambam: {
        title: "רמב״ם",
        subtitle: "חכמת הרמב״ם",
        subcategories: ["הלכות דעות", "הלכות תשובה"]
      },
      tanakh: {
        title: "תנ״ך",
        subtitle: "חכמת המקרא",
        subcategories: ["פרשת השבוע", "נביאים", "כתובים"]
      },
      talmud: {
        title: "תלמוד",
        subtitle: "דיון חכמים",
        subcategories: ["פרקי אבות", "סוגיות קצרות"]
      },
      spiritual: {
        title: "צמיחה רוחנית",
        subtitle: "פיתוח פנימי",
        subcategories: ["מוסר", "חסידות", "מחשבת ישראל"]
      },
      surprise: {
        title: "הפתע אותי",
        subtitle: "בחירה אלוהית אקראית",
        subcategories: []
      }
    }
  }
};

const topicIcons = {
  halacha: Scale,
  rambam: Book,
  tanakh: Scroll,
  talmud: Users,
  spiritual: Heart,
  surprise: Shuffle
};

export const TopicSelection = ({ 
  language, 
  selectedTopic, 
  timeSelected,
  onTopicSelect, 
  onNext
}: TopicSelectionProps) => {
  const t = content[language];
  const isHebrew = language === 'he';
  
  // Get source statistics for enhanced display
  const { sources } = useSupabaseData();
  const { getSourceStats } = useSmartRecommendation(sources, {
    timeSelected,
    topicSelected: selectedTopic || '',
    language
  });
  
  const sourceStats = getSourceStats();

  return (
    <div className={`min-h-screen bg-gradient-subtle p-4 pb-20 ${isHebrew ? 'hebrew' : ''}`}>
      <div className="max-w-4xl mx-auto py-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <Book className="h-8 w-8 text-primary mx-auto mb-2" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t.title}
          </h1>
          <p className="text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* Topic Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {Object.entries(t.topics).map(([key, topic]) => {
            const Icon = topicIcons[key as keyof typeof topicIcons];
            const isSelected = selectedTopic === key;
            const stats = sourceStats[key] || { total: 0, timeRanges: {}, difficulties: {} };
            
            // Calculate time range compatibility
            const compatibleSources = Object.entries(stats.timeRanges).reduce((sum, [range, count]) => {
              const [min, max] = range.split('-').map(r => parseInt(r.replace('min', '')));
              if (timeSelected >= min && timeSelected <= max) {
                return sum + (count as number);
              }
              return sum;
            }, 0);
            
            return (
              <Button
                key={key}
                variant="ghost"
                onClick={() => onTopicSelect(key)}
                className={`
                  h-auto p-0 transition-all duration-300 bg-transparent hover:bg-transparent
                  ${isSelected ? 'ring-2 ring-primary animate-scale-in' : 'hover:scale-105'}
                `}
              >
                <div 
                  className={`
                    learning-card w-full text-left transition-all duration-300
                    ${isSelected 
                      ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-warm border-primary border-2 scale-105' 
                      : 'bg-gradient-warm hover:bg-gradient-subtle border-transparent border-2 hover:shadow-lg'
                    }
                  `}
                >
                  {/* Header with icon and stats */}
                  <div className="flex items-start justify-between mb-3">
                    <Icon className={`h-8 w-8 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant={isSelected ? "secondary" : "outline"}
                        className={`text-xs ${isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : ''}`}
                      >
                        {stats.total} sources
                      </Badge>
                      {compatibleSources > 0 && (
                        <Badge 
                          variant={isSelected ? "secondary" : "outline"}
                          className={`text-xs ${isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-green-100 text-green-800'}`}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {compatibleSources} for {timeSelected}min
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2">{topic.title}</h3>
                  <p className={`text-sm mb-3 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {topic.subtitle}
                  </p>
                  
                  {/* Enhanced subcategories with progressive disclosure */}
                  {topic.subcategories.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {topic.subcategories.slice(0, isSelected ? topic.subcategories.length : 2).map((sub, index) => (
                          <div 
                            key={index}
                            className={`text-xs px-2 py-1 rounded-md transition-all duration-200 ${
                              isSelected 
                                ? 'bg-primary-foreground/20 text-primary-foreground' 
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {sub}
                          </div>
                        ))}
                        {!isSelected && topic.subcategories.length > 2 && (
                          <div className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                            +{topic.subcategories.length - 2} more
                          </div>
                        )}
                      </div>
                      
                      {/* Time availability indicator */}
                      {isSelected && Object.keys(stats.timeRanges).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-primary-foreground/20">
                          <div className="flex items-center gap-1 text-xs opacity-80">
                            <TrendingUp className="h-3 w-3" />
                            Available: {Object.entries(stats.timeRanges).map(([range, count]) => `${range} (${count})`).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={onNext}
            disabled={!selectedTopic}
            size="lg"
            className="btn-spiritual px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.nextButton}
          </Button>
        </div>
      </div>
    </div>
  );
};