import { Button } from "@/components/ui/button";
import { Language } from "./LanguageToggle";
import { Clock } from "lucide-react";

interface TimeSelectionProps {
  language: Language;
  selectedTime: number | null;
  onTimeSelect: (minutes: number) => void;
  onNext: () => void;
}

const content = {
  en: {
    title: "How much time do you have?",
    subtitle: "Choose your learning duration",
    backButton: "Back",
    nextButton: "Continue",
    minutes: "min",
    quote: '"For a mitzvah is a lamp, and the Torah is light." — Mishlei / Proverbs 6:23'
  },
  he: {
    title: "כמה זמן יש לך?",
    subtitle: "בחר את משך הלימוד שלך",
    backButton: "חזור",
    nextButton: "המשך",
    minutes: "דק'",
    quote: 'כִּי נֵר מִצְוָה וְתוֹרָה אוֹר — משלי ו׳:כ״ג'
  }
};

const timeOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

export const TimeSelection = ({ 
  language, 
  selectedTime, 
  onTimeSelect, 
  onNext
}: TimeSelectionProps) => {
  const t = content[language];
  const isHebrew = language === 'he';

  return (
    <div className={`min-h-screen bg-gradient-subtle mobile-container safe-bottom ${isHebrew ? 'hebrew' : ''}`}>
      <div className="max-w-2xl mx-auto py-6 sm:py-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
          </div>
        </div>

        {/* Title - Mobile Responsive */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {t.title}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* Time Options - Mobile-First Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {timeOptions.map((minutes) => (
            <Button
              key={minutes}
              variant={selectedTime === minutes ? "default" : "outline"}
              onClick={() => onTimeSelect(minutes)}
              className={`
                h-16 sm:h-18 text-base sm:text-lg font-medium transition-smooth touch-button
                ${selectedTime === minutes 
                  ? 'btn-spiritual animate-scale-in' 
                  : 'btn-gentle hover:scale-105'
                }
              `}
            >
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold">{minutes}</div>
                <div className="text-xs opacity-80">{t.minutes}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Continue Button - Mobile Optimized */}
        <div className="text-center">
          <Button
            onClick={onNext}
            disabled={!selectedTime}
            size="lg"
            className="btn-spiritual px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {t.nextButton}
          </Button>
        </div>

        {/* Inspirational Quote */}
        <div className="text-center mt-8 sm:mt-12 px-4">
          <p className="text-sm sm:text-base text-muted-foreground italic font-light leading-relaxed">
            {t.quote}
          </p>
        </div>
      </div>
    </div>
  );
};