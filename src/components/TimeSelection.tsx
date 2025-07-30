import { Button } from "@/components/ui/button";
import { Language } from "./LanguageToggle";
import { Clock, ArrowLeft } from "lucide-react";

interface TimeSelectionProps {
  language: Language;
  selectedTime: number | null;
  onTimeSelect: (minutes: number) => void;
  onBack: () => void;
  onNext: () => void;
}

const content = {
  en: {
    title: "How much time do you have?",
    subtitle: "Choose your learning duration",
    backButton: "Back",
    nextButton: "Continue",
    minutes: "min"
  },
  he: {
    title: "כמה זמן יש לך?",
    subtitle: "בחר את משך הלימוד שלך",
    backButton: "חזור",
    nextButton: "המשך",
    minutes: "דק'"
  }
};

const timeOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

export const TimeSelection = ({ 
  language, 
  selectedTime, 
  onTimeSelect, 
  onBack, 
  onNext 
}: TimeSelectionProps) => {
  const t = content[language];
  const isHebrew = language === 'he';

  return (
    <div className={`min-h-screen gradient-subtle p-4 pb-20 ${isHebrew ? 'hebrew' : ''}`}>
=======
    <div className={`min-h-screen bg-gradient-subtle p-4 pb-20 ${isHebrew ? 'hebrew' : ''}`}>
      <div className="max-w-2xl mx-auto py-8 animate-fade-in">
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
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
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

        {/* Time Options */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-12">
          {timeOptions.map((minutes) => (
            <Button
              key={minutes}
              variant={selectedTime === minutes ? "default" : "outline"}
              onClick={() => onTimeSelect(minutes)}
              className={`
                h-16 text-lg font-medium transition-smooth
                ${selectedTime === minutes 
                  ? 'btn-spiritual animate-scale-in' 
                  : 'btn-gentle hover:scale-105'
                }
              `}
            >
              <div className="text-center">
                <div className="text-xl font-bold">{minutes}</div>
                <div className="text-xs opacity-80">{t.minutes}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={onNext}
            disabled={!selectedTime}
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