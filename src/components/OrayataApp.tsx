import { useEffect } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { TimeSelection } from "./TimeSelection";
import { TopicSelection } from "./TopicSelection";
import { SourceRecommendationV2 } from "./SourceRecommendationV2";
import { ReflectionFormV2 } from "./ReflectionFormV2";
import { LearningJournal } from "./LearningJournal";
import { ProfileSettings } from "./ProfileSettings";
import { NavigationHeader } from "./NavigationHeader";
import { OfflineIndicator } from "./OfflineIndicator";
import { BottomNav } from "./BottomNav";
import { useAppContext } from "@/context/AppContext";

export const OrayataApp = () => {
  const { state, actions } = useAppContext();
  const { currentStep, language, selectedTime, selectedTopic, currentSource } = state;

  // Load persisted settings on mount
  useEffect(() => {
    const storedLang = localStorage.getItem('orayta_lang');
    if (storedLang === 'he' || storedLang === 'en') {
      actions.setLanguage(storedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('orayta_lang', language);
  }, [language]);

  const handleStartLearning = () => {
    actions.setStep('time');
  };

  const handleTimeSelect = (minutes: number) => {
    actions.setTime(minutes);
  };

  const handleTopicSelect = (topic: string) => {
    actions.setTopic(topic);
  };

  const handleReflection = (sessionId: string) => {
    actions.setSource(sessionId);
    actions.setStep('reflection');
  };

  const handleJournal = () => {
    actions.setStep('journal');
  };

  const handleOpenProfile = () => {
    actions.setStep('profile');
  };

  const handleSaveReflection = () => {
    // Reset session and go to welcome
    actions.resetSession();
  };

  // Apply RTL direction to the entire app when Hebrew is selected
  const appDirection = language === 'he' ? 'rtl' : 'ltr';

  return (
    <div dir={appDirection} className="font-inter min-h-screen bg-background">
      {/* Show navigation header for learning flow */}
      {['time', 'topic', 'source', 'reflection'].includes(currentStep) && (
        <NavigationHeader />
      )}

      <main className="flex-1">
        {currentStep === 'welcome' && (
            <WelcomeScreen
              language={language}
              onLanguageChange={actions.setLanguage}
              onStartLearning={handleStartLearning}
              onJournal={handleJournal}
              onProfile={handleOpenProfile}
            />
        )}

        {currentStep === 'time' && (
          <TimeSelection
            language={language}
            selectedTime={selectedTime}
            onTimeSelect={handleTimeSelect}
            onBack={actions.goToPreviousStep}
            onNext={actions.goToNextStep}
          />
        )}

        {currentStep === 'topic' && (
          <TopicSelection
            language={language}
            selectedTopic={selectedTopic}
            onTopicSelect={handleTopicSelect}
            onBack={actions.goToPreviousStep}
            onNext={actions.goToNextStep}
          />
        )}

        {currentStep === 'source' && selectedTime && selectedTopic && (
          <SourceRecommendationV2
            language={language}
            timeSelected={selectedTime}
            topicSelected={selectedTopic}
            onBack={actions.goToPreviousStep}
            onReflection={handleReflection}
          />
        )}

        {currentStep === 'reflection' && currentSource && (
          <ReflectionFormV2
            language={language}
            sessionId={currentSource}
            onBack={actions.goToPreviousStep}
            onSave={handleSaveReflection}
          />
        )}

        {currentStep === 'journal' && (
          <LearningJournal
            language={language}
            onBack={() => actions.setStep('welcome')}
          />
        )}

        {currentStep === 'profile' && (
          <ProfileSettings
            language={language}
            onLanguageChange={actions.setLanguage}
            onBack={() => actions.setStep('welcome')}
          />
        )}
      </main>

      {/* Bottom Navigation - always visible */}
      <BottomNav
        onHome={() => actions.setStep('welcome')}
        onJournal={handleJournal}
        onProfile={handleOpenProfile}
      />

      {/* Offline Support */}
      <OfflineIndicator />
    </div>
  );
};
