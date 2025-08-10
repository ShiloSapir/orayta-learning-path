import { Button } from "@/components/ui/button";
import { type Language } from "./LanguageToggle";
import { BookOpen, Clock, Heart } from "lucide-react";

interface WelcomeScreenProps {
  language: Language;
  onStartLearning: () => void;
  onJournal: () => void;
  onProfile: () => void;
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

export const WelcomeScreen = ({ language, onStartLearning, onJournal, onProfile, onAnalytics, onSearch }: WelcomeScreenProps) => {
  const t = content[language];
  const isHebrew = language === 'he';

  return (
    <div className={`min-h-screen bg-gradient-subtle flex items-center justify-center mobile-container safe-bottom ${isHebrew ? 'hebrew' : ''}`}>
      <div className="w-full max-w-2xl text-center mobile-spacing-y animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <div className="text-base sm:text-sm text-muted-foreground font-medium px-4 sm:px-0">
            {t.greeting}
          </div>
        </div>

        {/* Main Title - Mobile Responsive */}
        <div className="mobile-spacing-y">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-primary bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-lg mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Description - Mobile Readable */}
        <p className="mobile-content text-foreground/80">
          {t.description}
        </p>

        {/* Features - Mobile Grid */}
        <div className="mobile-grid my-8">
          {t.features.map((feature, index) => (
            <div 
              key={index}
              className="learning-card hover:scale-105 transition-smooth bg-gradient-warm text-center"
            >
              <feature.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="font-medium text-foreground text-sm sm:text-base">
                {feature.text}
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons - Mobile Stack */}
        <div className="mobile-spacing-y">
          <div className="mobile-stack">
            <Button
              onClick={onStartLearning}
              size="lg"
              className="btn-spiritual text-lg px-8 py-4 w-full sm:w-auto"
            >
              ✨ {t.startButton} ✨
            </Button>

            <Button
              onClick={onJournal}
              variant="outline"
              size="lg"
              className="btn-gentle text-lg px-8 py-4 w-full sm:w-auto"
            >
              📚 {t.journalButton}
            </Button>

            <Button
              onClick={onProfile}
              variant="outline"
              size="lg"
              className="btn-gentle text-lg px-8 py-4 w-full sm:w-auto"
            >
              ⚙️ {t.profileButton}
            </Button>
          </div>

          {/* Advanced Features - Mobile Stack */}
          <div className="mobile-stack">
            {onAnalytics && (
              <Button
                onClick={onAnalytics}
                variant="outline"
                size="lg"
                className="btn-gentle text-lg px-8 py-4 w-full sm:w-auto"
              >
                📊 {t.analyticsButton}
              </Button>
            )}

            {onSearch && (
              <Button
                onClick={onSearch}
                variant="outline"
                size="lg"
                className="btn-gentle text-lg px-8 py-4 w-full sm:w-auto"
              >
                🔍 {t.searchButton}
              </Button>
            )}
          </div>
        </div>

        {/* Login Button - Touch Friendly */}
        <button 
          onClick={() => {
            window.location.href = '/auth';
          }}
          className="text-primary hover:text-primary/80 transition-smooth underline underline-offset-4 text-lg py-2 px-4 rounded-lg touch-button"
        >
          {t.loginButton}
        </button>

        {/* Spiritual Quote - Mobile Readable */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-sm sm:text-base text-muted-foreground italic leading-relaxed">
            {t.quote}
          </p>
        </div>
      </div>
    </div>
  );
};