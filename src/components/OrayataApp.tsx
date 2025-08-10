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
import { LanguageToggle } from "./LanguageToggle";
import { DarkModeToggle } from "./DarkModeToggle";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";


export const OrayataApp = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useUserProfile(user);
  const { state, actions, dispatch } = useAppContext();
  const { currentStep, language: selectedLanguage, selectedTime, selectedTopic, currentSource } = state;

  

  // Load persisted settings on mount
  useEffect(() => {
    // Load language preference from profile if available, otherwise from localStorage
    if (profile?.preferred_language && (profile.preferred_language === 'en' || profile.preferred_language === 'he')) {
      dispatch({ type: 'SET_LANGUAGE', payload: profile.preferred_language });
    } else {
      const storedLang = localStorage.getItem('orayta_lang');
      if (storedLang === 'he' || storedLang === 'en') {
        dispatch({ type: 'SET_LANGUAGE', payload: storedLang });
      }
    }
  }, [profile, dispatch]);

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

  // Removed old webhook logic - now handled directly in SourceRecommendationV2

  // Show skeleton while checking authentication
  if (authLoading) {
    return <SourceLoadingState variant="minimal" />;
  }

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
  const isHebrew = selectedLanguage === 'he';

  return (
    <div dir={appDirection} className="font-inter min-h-screen bg-background">
      {/* Global toggles - desktop only */}
      <div className={`fixed top-4 z-50 hidden md:flex items-center gap-2 ${isHebrew ? 'left-4' : 'right-4'}`}>
        <LanguageToggle language={selectedLanguage} onLanguageChange={actions.setLanguage} />
        <DarkModeToggle />
      </div>

      {/* Show navigation header for learning flow */}
      {['time', 'topic', 'source', 'reflection'].includes(currentStep) && (
        <NavigationHeader />
      )}

      <main className="flex-1">
        {currentStep === 'welcome' && (
            <WelcomeScreen
              language={selectedLanguage}
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
            onNext={actions.goToNextStep}
          />
        )}

        {currentStep === 'topic' && (
          <TopicSelection
            language={selectedLanguage}
            selectedTopic={selectedTopic}
            timeSelected={selectedTime || 15}
            onTopicSelect={handleTopicSelect}
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
        language={selectedLanguage}
        onLanguageChange={actions.setLanguage}
      />

      {/* Offline Support */}
      <OfflineIndicator />
    </div>
  );
};
