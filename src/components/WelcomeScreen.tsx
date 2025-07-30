import { Button } from "@/components/ui/button";
import { LanguageToggle, Language } from "./LanguageToggle";
import { DarkModeToggle } from "./DarkModeToggle";
import { BookOpen, Clock, Heart } from "lucide-react";

interface WelcomeScreenProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onStartLearning: () => void;
  onJournal: () => void;
  onProfile: () => void;
  darkMode: boolean;
  onToggleDark: (value: boolean) => void;
=======
  onAnalytics?: () => void;
  onSearch?: () => void;
}

const content = {
  en: {
    greeting: "Peace be upon you",
    title: "Orayta",
    subtitle: "Your Spiritual Torah Learning Companion",
    description: "Discover meaningful Torah sources tailored to your time and interests. Learn, reflect, and grow spiritually.",
    startButton: "Begin Your Journey",
    journalButton: "Learning Journal",
    profileButton: "Profile",
=======
    analyticsButton: "Analytics",
    searchButton: "Search",
    loginButton: "Login / Sign Up",
    features: [
      { icon: BookOpen, text: "Personalized Torah Sources" },
      { icon: Clock, text: "Fits Your Schedule" },
      { icon: Heart, text: "Spiritual Growth" }
    ],
    quote: "\"In every generation, each person must see themselves as if they personally came out of Egypt\" - Passover Haggadah"
  },
  he: {
    greeting: "שלום עליכם",
    title: "אורייתא",
    subtitle: "המדריך הרוחני שלך ללימוד תורה",
    description: "גלה מקורות תורה משמעותיים המותאמים לזמנך ולתחומי העניין שלך. למד, הרהר וצמח רוחנית.",
    startButton: "התחל את המסע שלך", 
    journalButton: "יומן הלימוד",
    profileButton: "פרופיל",
=======
    analyticsButton: "סטטיסטיקות",
    searchButton: "חיפוש",
    loginButton: "התחברות / הרשמה",
    features: [
      { icon: BookOpen, text: "מקורות תורה מותאמים אישית" },
      { icon: Clock, text: "מתאים ללוח הזמנים שלך" },
      { icon: Heart, text: "צמיחה רוחנית" }
    ],
    quote: "\"בכל דור ודור חייב אדם לראות את עצמו כאילו הוא יצא ממצרים\" - הגדה של פסח"
  }
};

export const WelcomeScreen = ({ language, onLanguageChange, onStartLearning, onJournal, onProfile, darkMode, onToggleDark }: WelcomeScreenProps) => {
=======
export const WelcomeScreen = ({ language, onLanguageChange, onStartLearning, onJournal, onProfile, onAnalytics, onSearch }: WelcomeScreenProps) => {
  const t = content[language];
  const isHebrew = language === 'he';

  return (
    <div className={`min-h-screen gradient-warm flex items-center justify-center p-4 pb-20 ${isHebrew ? 'hebrew' : ''}`}>
      <div className="w-full max-w-2xl text-center space-y-8 animate-fade-in bg-background/80 backdrop-blur-lg rounded-xl p-6 shadow-warm">
=======
    <div className={`min-h-screen bg-gradient-subtle flex items-center justify-center p-4 pb-20 ${isHebrew ? 'hebrew' : ''}`}>
      <div className="w-full max-w-2xl text-center space-y-8 animate-fade-in">
        {/* Header with Language Toggle */}
        <div className="flex justify-between items-center">
          <div className="w-20"></div> {/* Spacer */}
          <div className="text-sm text-muted-foreground font-medium">
            {t.greeting}
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
            <DarkModeToggle darkMode={darkMode} onToggle={onToggleDark} />
=======
            <DarkModeToggle />
          </div>
        </div>

        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold gradient-primary bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            {t.subtitle}
          </p>
        </div>

        {/* Description */}
        <p className="text-lg text-foreground/80 leading-relaxed max-w-lg mx-auto">
          {t.description}
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          {t.features.map((feature, index) => (
            <div 
              key={index}
              className="learning-card hover:scale-105 transition-smooth gradient-warm"
            >
              <feature.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="font-medium text-foreground">
                {feature.text}
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onStartLearning}
            size="lg"
            className="btn-spiritual text-lg px-8 py-4"
          >
            ✨ {t.startButton} ✨
          </Button>

          <Button
            onClick={onJournal}
            variant="outline"
            size="lg"
            className="btn-gentle text-lg px-8 py-4"
          >
            📚 {t.journalButton}
          </Button>

          <Button
            onClick={onProfile}
            variant="outline"
            size="lg"
            className="btn-gentle text-lg px-8 py-4"
          >
            ⚙️ {t.profileButton}
          </Button>
=======
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onStartLearning}
              size="lg"
              className="btn-spiritual text-lg px-8 py-4"
            >
              ✨ {t.startButton} ✨
            </Button>

            <Button
              onClick={onJournal}
              variant="outline"
              size="lg"
              className="btn-gentle text-lg px-8 py-4"
            >
              📚 {t.journalButton}
            </Button>

            <Button
              onClick={onProfile}
              variant="outline"
              size="lg"
              className="btn-gentle text-lg px-8 py-4"
            >
              ⚙️ {t.profileButton}
            </Button>
          </div>

          {/* Advanced Features */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {onAnalytics && (
              <Button
                onClick={onAnalytics}
                variant="outline"
                size="lg"
                className="btn-gentle text-lg px-8 py-4"
              >
                📊 {t.analyticsButton}
              </Button>
            )}

            {onSearch && (
              <Button
                onClick={onSearch}
                variant="outline"
                size="lg"
                className="btn-gentle text-lg px-8 py-4"
              >
                🔍 {t.searchButton}
              </Button>
            )}
          </div>
        </div>

        {/* Login Button */}
        <button 
          onClick={() => {
            window.location.href = '/auth';
          }}
          className="text-primary hover:text-primary/80 transition-smooth underline underline-offset-4"
        >
          {t.loginButton}
        </button>

        {/* Spiritual Quote */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground italic">
            {t.quote}
          </p>
        </div>
      </div>
    </div>
  );
};