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

// Mock sources organized by category
const sourcesByTopic = {
  "Halacha": {
    en: {
      title: "Shulchan Aruch Orach Chaim 1:1 – Morning Awakening",
      startRef: "Shulchan Aruch OC 1:1",
      endRef: "1:1",
      summary: "The very first law in the Shulchan Aruch teaches about waking up with strength and determination to serve God.",
      text: "One should strengthen himself like a lion to get up in the morning to serve his Creator, so that he should wake up the dawn.",
      commentaries: ["Mishna Berura", "Kaf HaChaim", "Aruch HaShulchan"],
      reflectionPrompt: "How can you apply this teaching about morning determination to your daily spiritual practice?",
      sefariaLink: "https://www.sefaria.org/Shulchan_Arukh%2C_Orach_Chayim.1.1"
    },
    he: {
      title: "שולחן ערוך אורח חיים א:א – התעוררות הבוקר",
      startRef: "שולחן ערוך או״ח א:א",
      endRef: "א:א",
      summary: "החוק הראשון בשולחן ערוך מלמד על התעוררות בכוח ובנחישות לעבוד את ה'.",
      text: "יתגבר כארי לעמוד בבוקר לעבודת בוראו, שיהא הוא מעורר השחר.",
      commentaries: ["משנה ברורה", "כף החיים", "ערוך השולחן"],
      reflectionPrompt: "איך אתה יכול ליישם את הלימוד הזה על נחישות בוקר בתרגול הרוחני היומי שלך?",
      sefariaLink: "https://www.sefaria.org/Shulchan_Arukh%2C_Orach_Chayim.1.1"
    }
  },
  "Rambam": {
    en: {
      title: "Mishneh Torah Hilchot Teshuva 7:3 – The Nature of Return",
      startRef: "Hilchot Teshuva 7:3",
      endRef: "7:3",
      summary: "Rambam explains how repentance transforms a person's very essence and relationship with God.",
      text: "How great is repentance! Yesterday this person was separated from God... and today he cleaves to the Divine Presence.",
      commentaries: ["Lechem Mishneh", "Kesef Mishneh", "Radbaz"],
      reflectionPrompt: "Reflect on a time when you experienced genuine transformation. What does this teach about human potential?",
      sefariaLink: "https://www.sefaria.org/Mishneh_Torah%2C_Repentance.7.3"
    },
    he: {
      title: "משנה תורה הלכות תשובה ז:ג – טבע התשובה",
      startRef: "הלכות תשובה ז:ג",
      endRef: "ז:ג",
      summary: "הרמב״ם מסביר איך תשובה משנה את מהותו של האדם ויחסו לה'.",
      text: "גדולה תשובה שאמש היה זה מובדל מה' אלוקי ישראל... והיום הוא דבוק בשכינה.",
      commentaries: ["לחם משנה", "כסף משנה", "רדב״ז"],
      reflectionPrompt: "הרהר על זמן שחווית שינוי אמיתי. מה זה מלמד על הפוטנציאל האנושי?",
      sefariaLink: "https://www.sefaria.org/Mishneh_Torah%2C_Repentance.7.3"
    }
  },
  "Ethics": {
    en: {
      title: "Pirkei Avot 2:13 – Who is Wise?",
      startRef: "Pirkei Avot 2:13",
      endRef: "2:13",
      summary: "This Mishnah explores the character traits that define true wisdom, strength, and honor.",
      text: "Who is wise? One who learns from every person. Who is mighty? One who conquers his inclination.",
      commentaries: ["Rambam", "Rashi", "Bartenura"],
      reflectionPrompt: "Think about someone you initially dismissed but later learned from. What does this teach about humility?",
      sefariaLink: "https://www.sefaria.org/Pirkei_Avot.2.13"
    },
    he: {
      title: "פרקי אבות ב:יג – איזהו חכם?",
      startRef: "פרקי אבות ב:יג",
      endRef: "ב:יג",
      summary: "משנה זו חוקרת את תכונות האופי המגדירות חכמה, גבורה וכבוד אמיתיים.",
      text: "איזהו חכם? הלומד מכל אדם. איזהו גבור? הכובש את יצרו.",
      commentaries: ["רמב״ם", "רש״י", "ברטנורא"],
      reflectionPrompt: "חשוב על מישהו שבתחילה התעלמת ממנו אבל אחר כך למדת ממנו. מה זה מלמד על ענווה?",
      sefariaLink: "https://www.sefaria.org/Pirkei_Avot.2.13"
    }
  }
};

const getSourceForTopic = (topic: string, language: Language) => {
  const topicKey = topic as keyof typeof sourcesByTopic;
  return sourcesByTopic[topicKey]?.[language] || sourcesByTopic["Ethics"][language];
};

export const SourceRecommendation = ({ 
  language, 
  timeSelected, 
  topicSelected, 
  onBack, 
  onReflection 
}: SourceRecommendationProps) => {
  const t = content[language];
  const source = getSourceForTopic(topicSelected, language);
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