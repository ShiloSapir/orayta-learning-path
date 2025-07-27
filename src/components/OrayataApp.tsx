import { useEffect } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { TimeSelection } from "./TimeSelection";
import { TopicSelection } from "./TopicSelection";
import { SourceRecommendation } from "./SourceRecommendation";
import { ReflectionForm } from "./ReflectionForm";
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
  }, [actions]);

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

  const handleReflection = (sourceTitle: string) => {
    actions.setSource(sourceTitle);
    actions.setStep('reflection');
  };

  const handleJournal = () => {
    actions.setStep('journal');
  };

  const handleOpenProfile = () => {
    actions.setStep('profile');
  };

  const handleSaveReflection = (reflection: string, tags: string[]) => {
    // Add session to state
    actions.addSession({
      sourceTitle: currentSource,
      topic: selectedTopic || '',
      timeSpent: selectedTime || 0,
      reflection,
      tags,
      status: 'reflected'
    });
    
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
          <SourceRecommendation
            language={language}
            timeSelected={selectedTime}
            topicSelected={selectedTopic}
            onBack={actions.goToPreviousStep}
            onReflection={() => handleReflection(`${selectedTopic} Source`)}
          />
        )}

        {currentStep === 'reflection' && (
          <ReflectionForm
            language={language}
            sourceTitle={currentSource}
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
