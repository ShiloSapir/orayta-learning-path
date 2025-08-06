import { useEffect, useCallback, useRef } from "react";
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

  const sentRequestRef = useRef<string | null>(null);

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
  }, [profile, actions]);

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

  const sendToMake = useCallback(async (timeSelected: number, topicSelected: string, languageSelected: string, selectedSource?: string) => {
    const requestKey = `${timeSelected}-${topicSelected}-${languageSelected}`;
    
    // Prevent duplicate requests
    if (sentRequestRef.current === requestKey) {
      return;
    }
    
    sentRequestRef.current = requestKey;
    
    try {
      const response = await fetch(
        'https://hook.eu2.make.com/yph8frq3ykdvsqjjbz0zxym2ihrjnv1j',
        {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            time_selected: timeSelected,
            topic_selected: topicSelected,
            language_selected: languageSelected,
            selected_source: selectedSource,
            user_id: user?.id,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      // Store the webhook response to override Supabase data when processed
      if (response.ok) {
        localStorage.setItem('webhook_processed_source', JSON.stringify({
          timeSelected,
          topicSelected,
          languageSelected,
          selectedSource,
          timestamp: new Date().toISOString()
        }));
      }

    } catch (error) {
      // Silently handle fetch errors - no user notification needed
    }
  }, [user]);

  useEffect(() => {
    if (currentStep === 'source' && selectedTime && selectedTopic && currentSource) {
      sendToMake(selectedTime, selectedTopic, selectedLanguage, currentSource);
    }
  }, [currentStep, selectedTime, selectedTopic, selectedLanguage, currentSource, sendToMake]);

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
      />

      {/* Offline Support */}
      <OfflineIndicator />
    </div>
  );
};
