import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Home, Clock, BookOpen, PenTool } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const stepIcons = {
  welcome: Home,
  time: Clock,
  topic: BookOpen,
  source: BookOpen,
  reflection: PenTool,
  journal: BookOpen,
  profile: Home
};

const stepTitles = {
  en: {
    welcome: 'Welcome',
    time: 'Time Selection',
    topic: 'Topic Selection', 
    source: 'Source Study',
    reflection: 'Reflection',
    journal: 'Learning Journal',
    profile: 'Profile Settings'
  },
  he: {
    welcome: 'ברוכים הבאים',
    time: 'בחירת זמן',
    topic: 'בחירת נושא',
    source: 'לימוד המקור',
    reflection: 'הרהור',
    journal: 'יומן לימוד',
    profile: 'הגדרות פרופיל'
  }
};

export function NavigationHeader() {
  const { state, actions } = useAppContext();
  const { currentStep, language } = state;
  const [progress, setProgress] = useState(0);
  
  const isHebrew = language === 'he';
  const titles = stepTitles[language];
  
  // Calculate progress based on learning flow steps
  const learningSteps = ['welcome', 'time', 'topic', 'source', 'reflection'];
  const currentStepIndex = learningSteps.indexOf(currentStep);
  
  useEffect(() => {
    if (currentStepIndex >= 0) {
      const progressPercentage = (currentStepIndex / (learningSteps.length - 1)) * 100;
      setProgress(progressPercentage);
    } else {
      setProgress(0);
    }
  }, [currentStepIndex]);

  const canGoBack = currentStepIndex > 0 || ['journal', 'profile'].includes(currentStep);
  const canGoForward = currentStepIndex >= 0 && currentStepIndex < learningSteps.length - 1;

  const handleBack = () => {
    if (currentStep === 'journal' || currentStep === 'profile') {
      actions.setStep('welcome');
    } else {
      actions.goToPreviousStep();
    }
  };

  const handleForward = () => {
    actions.goToNextStep();
  };

  const StepIcon = stepIcons[currentStep];

  return (
    <Card className="border-b rounded-none shadow-sm">
      <div className="flex items-center justify-between p-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={!canGoBack}
          className={`flex items-center gap-2 ${isHebrew ? 'flex-row-reverse' : ''}`}
          aria-label={isHebrew ? 'חזור' : 'Go back'}
        >
          <ChevronLeft className={`h-4 w-4 ${isHebrew ? 'rotate-180' : ''}`} />
          {isHebrew ? 'חזור' : 'Back'}
        </Button>

        {/* Current Step Info */}
        <div className="flex items-center gap-3 flex-1 max-w-md mx-4">
          <div className="flex items-center gap-2">
            <StepIcon className="h-5 w-5 text-primary" />
            <span className="font-medium text-sm md:text-base">
              {titles[currentStep]}
            </span>
          </div>
          
          {/* Progress Bar for Learning Flow */}
          {currentStepIndex >= 0 && (
            <div className="flex-1 min-w-0">
              <Progress 
                value={progress} 
                className="h-2"
                aria-label={`Progress: ${Math.round(progress)}%`}
              />
              <div className="text-xs text-muted-foreground mt-1 text-center">
                {currentStepIndex + 1} / {learningSteps.length}
              </div>
            </div>
          )}
        </div>

        {/* Forward Button */}
        <Button
          variant="ghost" 
          size="sm"
          onClick={handleForward}
          disabled={!canGoForward}
          className={`flex items-center gap-2 ${isHebrew ? 'flex-row-reverse' : ''}`}
          aria-label={isHebrew ? 'הבא' : 'Go forward'}
        >
          {isHebrew ? 'הבא' : 'Next'}
          <ChevronRight className={`h-4 w-4 ${isHebrew ? 'rotate-180' : ''}`} />
        </Button>
      </div>
    </Card>
  );
}