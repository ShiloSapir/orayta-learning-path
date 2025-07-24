import { useState } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { TimeSelection } from "./TimeSelection";
import { TopicSelection } from "./TopicSelection";
import { SourceRecommendation } from "./SourceRecommendation";
import { Language } from "./LanguageToggle";

type AppStep = 'welcome' | 'time' | 'topic' | 'source' | 'reflection';

export const OrayataApp = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('welcome');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleStartLearning = () => {
    setCurrentStep('time');
  };

  const handleTimeSelect = (minutes: number) => {
    setSelectedTime(minutes);
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
  };

  const goToNextStep = () => {
    switch (currentStep) {
      case 'time':
        setCurrentStep('topic');
        break;
      case 'topic':
        setCurrentStep('source');
        break;
      case 'source':
        setCurrentStep('reflection');
        break;
    }
  };

  const goToPrevStep = () => {
    switch (currentStep) {
      case 'time':
        setCurrentStep('welcome');
        break;
      case 'topic':
        setCurrentStep('time');
        break;
      case 'source':
        setCurrentStep('topic');
        break;
      case 'reflection':
        setCurrentStep('source');
        break;
    }
  };

  const handleReflection = () => {
    setCurrentStep('reflection');
  };

  // Apply RTL direction to the entire app when Hebrew is selected
  const appDirection = language === 'he' ? 'rtl' : 'ltr';

  return (
    <div dir={appDirection} className="font-inter">
      {currentStep === 'welcome' && (
        <WelcomeScreen
          language={language}
          onLanguageChange={setLanguage}
          onStartLearning={handleStartLearning}
        />
      )}

      {currentStep === 'time' && (
        <TimeSelection
          language={language}
          selectedTime={selectedTime}
          onTimeSelect={handleTimeSelect}
          onBack={goToPrevStep}
          onNext={goToNextStep}
        />
      )}

      {currentStep === 'topic' && (
        <TopicSelection
          language={language}
          selectedTopic={selectedTopic}
          onTopicSelect={handleTopicSelect}
          onBack={goToPrevStep}
          onNext={goToNextStep}
        />
      )}

      {currentStep === 'source' && selectedTime && selectedTopic && (
        <SourceRecommendation
          language={language}
          timeSelected={selectedTime}
          topicSelected={selectedTopic}
          onBack={goToPrevStep}
          onReflection={handleReflection}
        />
      )}

      {currentStep === 'reflection' && (
        <div className={`min-h-screen bg-gradient-subtle p-4 flex items-center justify-center ${language === 'he' ? 'hebrew' : ''}`}>
          <div className="text-center space-y-6 animate-fade-in">
            <div className="text-6xl">📝</div>
            <h1 className="text-3xl font-bold text-foreground">
              {language === 'he' ? 'הרהור והתבוננות' : 'Reflection & Contemplation'}
            </h1>
            <p className="text-muted-foreground max-w-md">
              {language === 'he' 
                ? 'תכונה זו תתווסף בקרוב - מקום לכתיבת הרהורים אישיים על הלימוד שלך'
                : 'This feature is coming soon - a space for writing personal reflections on your learning'
              }
            </p>
            <button
              onClick={() => setCurrentStep('welcome')}
              className="btn-spiritual px-6 py-3 rounded-lg"
            >
              {language === 'he' ? 'חזור לבית' : 'Return Home'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};