import { Button } from "@/components/ui/button";
import { Language } from "./LanguageToggle";
import { 
  ArrowLeft, 
  Book, 
  Scale, 
  Scroll, 
  Users, 
  Heart, 
  Shuffle
} from "lucide-react";

interface TopicSelectionProps {
  language: Language;
  selectedTopic: string | null;
  onTopicSelect: (topic: string) => void;
  onBack: () => void;
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
  onTopicSelect, 
  onBack, 
  onNext 
}: TopicSelectionProps) => {
  const t = content[language];
  const isHebrew = language === 'he';

  return (
    <div className={`min-h-screen bg-gradient-subtle p-4 ${isHebrew ? 'hebrew' : ''}`}>
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
            <Book className="h-8 w-8 text-primary mx-auto mb-2" />
          </div>
          <div className="w-16"></div> {/* Spacer */}
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
            
            return (
              <Button
                key={key}
                variant="ghost"
                onClick={() => onTopicSelect(key)}
                className={`
                  h-auto p-0 transition-smooth
                  ${isSelected ? 'ring-2 ring-primary' : ''}
                `}
              >
                <div 
                  className={`
                    learning-card w-full text-left hover:scale-105 transition-smooth
                    ${isSelected 
                      ? 'bg-gradient-primary text-primary-foreground shadow-warm' 
                      : 'bg-gradient-warm hover:bg-gradient-subtle'
                    }
                  `}
                >
                  <Icon className={`h-8 w-8 mb-4 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                  <h3 className="font-bold text-lg mb-2">{topic.title}</h3>
                  <p className={`text-sm mb-3 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {topic.subtitle}
                  </p>
                  {topic.subcategories.length > 0 && (
                    <div className="space-y-1">
                      {topic.subcategories.map((sub, index) => (
                        <div 
                          key={index}
                          className={`text-xs px-2 py-1 rounded-md ${
                            isSelected 
                              ? 'bg-primary-foreground/20 text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {sub}
                        </div>
                      ))}
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