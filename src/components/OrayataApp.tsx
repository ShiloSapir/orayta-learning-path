import { useEffect } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { TimeSelection } from "./TimeSelection";
import { TopicSelection } from "./TopicSelection";
import { SourceRecommendationV2 } from "./SourceRecommendationV2";
import { ReflectionFormV2 } from "./ReflectionFormV2";
import { LearningJournal } from "./LearningJournal";
import { ProfileSettings } from "./ProfileSettings";

import { EnhancedLearningDashboard } from "./EnhancedLearningDashboard";
import { AdvancedSearchAndDiscovery } from "./AdvancedSearchAndDiscovery";
import { NavigationHeader } from "./NavigationHeader";
import { OfflineIndicator } from "./OfflineIndicator";
import { BottomNav } from "./BottomNav";
import { SourceLoadingState } from "./SourceLoadingState";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

export const OrayataApp = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useUserProfile(user);
  const { state, actions } = useAppContext();
  const { currentStep, language: selectedLanguage, selectedTime, selectedTopic, currentSource } = state;

  // Show skeleton while checking authentication
  if (authLoading) {
    return <SourceLoadingState variant="minimal" />;
  }

  // Load persisted settings on mount
  useEffect(() => {
    // Load language preference from profile if available, otherwise from localStorage
    if (profile?.preferred_language && (profile.preferred_language === 'en' || profile.preferred_language === 'he')) {
      actions.setLanguage(profile.preferred_language);
    } else {
      const storedLang = localStorage.getItem('orayta_lang');
      if (storedLang === 'he' || storedLang === 'en') {
        actions.setLanguage(storedLang);
      }
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('orayta_lang', selectedLanguage);
  }, [selectedLanguage]);

  const handleStartLearning = () => {
    actions.setStep('time');
  };

  const handleTimeSelect = (minutes: number) => {
    actions.setTime(minutes);
  };

  const handleTopicSelect = (topic: string) => {
    actions.setTopic(topic);
  };

  const sendToMake = async (timeSelected: number, topicSelected: string, languageSelected: string) => {
    try {
      await fetch('https://hook.eu2.make.com/dv77hcqg67fn9hj4phbias2q7oj3btk2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          time_selected: timeSelected,
          topic_selected: topicSelected,
          language_selected: languageSelected,
          user_id: user?.id,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Failed to send data to Make:', error);
    }
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

  const handleAnalytics = () => {
    actions.setStep('analytics');
  };

  const handleSearch = () => {
    actions.setStep('search');
  };

  const handleAdmin = () => {
    window.location.assign('/admin');
  };

  const handleSaveReflection = () => {
    // Reset session and go to welcome
    actions.resetSession();
  };

  // Apply RTL direction to the entire app when Hebrew is selected
  const appDirection = selectedLanguage === 'he' ? 'rtl' : 'ltr';

  return (
    <div dir={appDirection} className="font-inter min-h-screen bg-background">
      {/* Show navigation header for learning flow */}
      {['time', 'topic', 'source', 'reflection'].includes(currentStep) && (
        <NavigationHeader />
      )}

      <main className="flex-1">
        {currentStep === 'welcome' && (
            <WelcomeScreen
              language={selectedLanguage}
              onLanguageChange={actions.setLanguage}
              onStartLearning={handleStartLearning}
              onJournal={handleJournal}
              onProfile={handleOpenProfile}
              onAnalytics={handleAnalytics}
              onSearch={handleSearch}
            />
        )}

        {currentStep === 'time' && (
          <TimeSelection
            language={selectedLanguage}
            selectedTime={selectedTime}
            onTimeSelect={handleTimeSelect}
            onBack={actions.goToPreviousStep}
            onNext={actions.goToNextStep}
          />
        )}

        {currentStep === 'topic' && (
          <TopicSelection
            language={selectedLanguage}
            selectedTopic={selectedTopic}
            timeSelected={selectedTime || 15}
            onTopicSelect={handleTopicSelect}
            onBack={actions.goToPreviousStep}
            onNext={actions.goToNextStep}
          />
        )}

        {currentStep === 'source' && selectedTime && selectedTopic && (
          <SourceRecommendationV2
            language={selectedLanguage}
            timeSelected={selectedTime}
            topicSelected={selectedTopic}
            onBack={actions.goToPreviousStep}
            onReflection={handleReflection}
          />
        )}

        {/* Send data to Make when both time and topic are selected and we reach source step */}
        {currentStep === 'source' && selectedTime && selectedTopic && (
          (() => {
            sendToMake(selectedTime, selectedTopic, selectedLanguage);
            return null;
          })()
        )}

        {currentStep === 'reflection' && currentSource && (
          <ReflectionFormV2
            language={selectedLanguage}
            sessionId={currentSource}
            onBack={actions.goToPreviousStep}
            onSave={handleSaveReflection}
          />
        )}

        {currentStep === 'journal' && (
          <LearningJournal
            language={selectedLanguage}
            onBack={() => actions.setStep('welcome')}
          />
        )}

        {currentStep === 'profile' && (
          <ProfileSettings
            language={selectedLanguage}
            onLanguageChange={actions.setLanguage}
            onBack={() => actions.setStep('welcome')}
          />
        )}

        {currentStep === 'analytics' && (
          <EnhancedLearningDashboard
            language={selectedLanguage}
            onBack={() => actions.setStep('welcome')}
          />
        )}

        {currentStep === 'search' && (
          <AdvancedSearchAndDiscovery
            language={selectedLanguage}
            onBack={() => actions.setStep('welcome')}
          />
        )}
      </main>

      {/* Bottom Navigation - always visible */}
      <BottomNav
        currentStep={currentStep}
        onHome={() => actions.setStep('welcome')}
        onJournal={handleJournal}
        onProfile={handleOpenProfile}
        onAnalytics={handleAnalytics}
        onSearch={handleSearch}
        onAdmin={profile?.role === 'admin' ? handleAdmin : undefined}
      />

      {/* Offline Support */}
      <OfflineIndicator />
    </div>
  );
};
