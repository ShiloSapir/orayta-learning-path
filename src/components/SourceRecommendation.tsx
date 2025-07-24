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

// Mock data - in real app this would come from Sefaria API
const mockSource = {
  en: {
    title: "Pirkei Avot 2:13 – Who is Wise?",
    startRef: "Pirkei Avot 2:13",
    endRef: "2:13",
    summary: "This Mishnah explores the character traits that define true wisdom, a rich person, and a person of honor. Rabbi Yehoshua teaches that wisdom comes from learning from every person.",
    text: "Who is wise? One who learns from every person, as it is stated: 'From all my teachers I have grown wise' (Psalms 119:99). Who is mighty? One who conquers his inclination, as it is stated: 'One who is slow to anger is better than a mighty person, and one who rules over his spirit than a conqueror of a city' (Proverbs 16:32).",
    commentaries: ["Rambam", "Rashi", "Bartenura"],
    reflectionPrompt: "Think about a recent situation where you could have learned something from someone you initially dismissed. What does this Mishnah teach about intellectual humility?",
    sefariaLink: "https://www.sefaria.org/Pirkei_Avot.2.13"
  },
  he: {
    title: "פרקי אבות ב:יג – איזהו חכם?",
    startRef: "פרקי אבות ב:יג",
    endRef: "ב:יג",
    summary: "משנה זו חוקרת את תכונות האופי המגדירות חכמה אמיתית, עושר ואדם מכובד. רבי יהושע מלמד שחכמה באה מלמידה מכל אדם.",
    text: "איזהו חכם? הלומד מכל אדם, שנאמר 'מכל מלמדי השכלתי' (תהלים קיט:צט). איזהו גבור? הכובש את יצרו, שנאמר 'טוב ארך אפים מגבור ומושל ברוחו מלוכד עיר' (משלי טז:לב).",
    commentaries: ["רמב״ם", "רש״י", "ברטנורא"],
    reflectionPrompt: "חשוב על מצב אחרון שבו יכולת ללמוד משהו ממישהו שבתחילה התעלמת ממנו. מה המשנה הזו מלמדת על ענווה אינטלקטואלית?",
    sefariaLink: "https://www.sefaria.org/Pirkei_Avot.2.13"
  }
};

export const SourceRecommendation = ({ 
  language, 
  timeSelected, 
  topicSelected, 
  onBack, 
  onReflection 
}: SourceRecommendationProps) => {
  const t = content[language];
  const source = mockSource[language];
  const isHebrew = language === 'he';

  const handleAction = (action: string) => {
    console.log(`Action: ${action}`);
    // In real app, these would trigger backend actions
    if (action === 'reflection') {
      onReflection();
    }
  };

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
      </div>
    </div>
  );
};