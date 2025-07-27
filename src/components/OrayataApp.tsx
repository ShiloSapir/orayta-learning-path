import { useState, useEffect } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { TimeSelection } from "./TimeSelection";
import { TopicSelection } from "./TopicSelection";
import { SourceRecommendation } from "./SourceRecommendation";
import { ReflectionForm } from "./ReflectionForm";
import { LearningJournal } from "./LearningJournal";
import { ProfileSettings } from "./ProfileSettings";
import { Language } from "./LanguageToggle";
import { DarkModeToggle } from "./DarkModeToggle";
import { BottomNav } from "./BottomNav";

type AppStep =
  | 'welcome'
  | 'time'
  | 'topic'
  | 'source'
  | 'reflection'
  | 'journal'
  | 'profile';

export const OrayataApp = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('welcome');
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<string>("");

  // Load persisted settings on mount
  useEffect(() => {
    const storedLang = localStorage.getItem('orayta_lang');
    const storedDark = localStorage.getItem('orayta_dark');
    if (storedLang === 'he' || storedLang === 'en') {
      setLanguage(storedLang);
    }
    if (storedDark === 'true') {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('orayta_dark', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('orayta_lang', language);
  }, [language]);

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
      case 'journal':
        setCurrentStep('welcome');
        break;
      case 'profile':
        setCurrentStep('welcome');
        break;
    }
  };

  const handleReflection = (sourceTitle: string) => {
    setCurrentSource(sourceTitle);
    setCurrentStep('reflection');
  };

  const handleJournal = () => {
    setCurrentStep('journal');
  };

  const handleOpenProfile = () => {
    setCurrentStep('profile');
  };

  const handleToggleDark = (value: boolean) => {
    setDarkMode(value);
  };

  const handleSaveReflection = (reflection: string, tags: string[]) => {
    console.log('Saving reflection:', { reflection, tags, source: currentSource });
    // This would save to database with Supabase
    setCurrentStep('welcome');
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
          onJournal={handleJournal}
          onProfile={handleOpenProfile}
          darkMode={darkMode}
          onToggleDark={handleToggleDark}
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
          onReflection={() => handleReflection(`${selectedTopic} Source`)}
        />
      )}

      {currentStep === 'reflection' && (
        <ReflectionForm
          language={language}
          sourceTitle={currentSource}
          onBack={goToPrevStep}
          onSave={handleSaveReflection}
        />
      )}

      {currentStep === 'journal' && (
        <LearningJournal
          language={language}
          onBack={() => setCurrentStep('welcome')}
        />
      )}

      {currentStep === 'profile' && (
        <ProfileSettings
          language={language}
          darkMode={darkMode}
          onLanguageChange={setLanguage}
          onToggleDark={handleToggleDark}
          onBack={goToPrevStep}
        />
      )}
      <BottomNav
        onHome={() => setCurrentStep('welcome')}
        onJournal={handleJournal}
        onProfile={handleOpenProfile}
      />
    </div>
  );
};
