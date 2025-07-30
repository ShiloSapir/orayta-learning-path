import { useEffect } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { TimeSelection } from "./TimeSelection";
import { TopicSelection } from "./TopicSelection";
import { SourceRecommendation } from "./SourceRecommendation";
import { ReflectionForm } from "./ReflectionForm";
import { Suspense, lazy } from "react";
const LearningJournal = lazy(() => import("./LearningJournal"));
const ProfileSettings = lazy(() => import("./ProfileSettings"));
import { Language } from "./LanguageToggle";
import { DarkModeToggle } from "./DarkModeToggle";
import { useAppContext } from "../context/AppContext";
import { BottomNav } from "./BottomNav";
import type { SourceEntry } from "../data/sources";

type AppStep =
  | "welcome"
  | "time"
  | "topic"
  | "source"
  | "reflection"
  | "journal"
  | "profile";

interface LearningSession {
  id: string;
  title: string;
  topic: string;
  date: string;
  duration: number;
  status: "learned" | "saved" | "reflected";
  reflection?: string;
  tags?: string[];
  sefariaLink: string;
}

export const OrayataApp = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>("welcome");
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<SourceEntry | null>(null);
  const [{ language, darkMode }, dispatch] = useAppContext();

  const recordSession = (session: LearningSession) => {
    const existing = JSON.parse(
      localStorage.getItem("orayta_sessions") || "[]"
    ) as LearningSession[];
    existing.push(session);
    localStorage.setItem("orayta_sessions", JSON.stringify(existing));
  };

  const handleStartLearning = () => {
    setCurrentStep("time");
=======
import { SourceRecommendationV2 } from "./SourceRecommendationV2";
import { ReflectionFormV2 } from "./ReflectionFormV2";
import { LearningJournal } from "./LearningJournal";
import { ProfileSettings } from "./ProfileSettings";
import { LearningStreaks } from "./LearningStreaks";
import { EnhancedLearningDashboard } from "./EnhancedLearningDashboard";
import { AdvancedSearchAndDiscovery } from "./AdvancedSearchAndDiscovery";
import { NavigationHeader } from "./NavigationHeader";
import { OfflineIndicator } from "./OfflineIndicator";
import { BottomNav } from "./BottomNav";
import { LoadingSpinner } from "./LoadingSpinner";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

export const OrayataApp = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useUserProfile(user);
  const { state, actions } = useAppContext();
  const { currentStep, language, selectedTime, selectedTopic, currentSource } = state;

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
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

  const goToNextStep = () => {
    switch (currentStep) {
      case "time":
        setCurrentStep("topic");
        break;
      case "topic":
        setCurrentStep("source");
        break;
      case "source":
        setCurrentStep("reflection");
        break;
    }
  };

  const goToPrevStep = () => {
    switch (currentStep) {
      case "time":
        setCurrentStep("welcome");
        break;
      case "topic":
        setCurrentStep("time");
        break;
      case "source":
        setCurrentStep("topic");
        break;
      case "reflection":
        setCurrentStep("source");
        break;
      case "journal":
        setCurrentStep("welcome");
        break;
      case "profile":
        setCurrentStep("welcome");
        break;
    }
  };

  const handleReflection = (source: SourceEntry) => {
    setCurrentSource(source);
    setCurrentStep("reflection");
  };

  const handleJournal = () => {
    setCurrentStep("journal");
  };

  const handleOpenProfile = () => {
    setCurrentStep("profile");
  };

  const handleToggleDark = (value: boolean) => {
    dispatch({ type: "setDarkMode", payload: value });
  };

  const handleSaveReflection = (reflection: string, tags: string[]) => {
    if (!currentSource || !selectedTopic || !selectedTime) return;
    recordSession({
      id: crypto.randomUUID(),
      title: currentSource.title,
      topic: selectedTopic,
      date: new Date().toISOString(),
      duration: selectedTime,
      status: "reflected",
      reflection,
      tags,
      sefariaLink: currentSource.sefariaLink,
    });
    setCurrentStep("welcome");
=======
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

  const handleSaveReflection = () => {
    // Reset session and go to welcome
    actions.resetSession();
  };

  // Apply RTL direction to the entire app when Hebrew is selected
  const appDirection = language === "he" ? "rtl" : "ltr";

  return (
    <div dir={appDirection} className="font-inter">
      {currentStep === "welcome" && (
        <WelcomeScreen
          language={language}
          onLanguageChange={(lang) =>
            dispatch({ type: "setLanguage", payload: lang })
          }
          onStartLearning={handleStartLearning}
          onJournal={handleJournal}
          onProfile={handleOpenProfile}
          darkMode={darkMode}
          onToggleDark={handleToggleDark}
        />
      )}

      {currentStep === "time" && (
        <TimeSelection
          language={language}
          selectedTime={selectedTime}
          onTimeSelect={handleTimeSelect}
          onBack={goToPrevStep}
          onNext={goToNextStep}
        />
      )}

      {currentStep === "topic" && (
        <TopicSelection
          language={language}
          selectedTopic={selectedTopic}
          onTopicSelect={handleTopicSelect}
          onBack={goToPrevStep}
          onNext={goToNextStep}
        />
      )}

      {currentStep === "source" && selectedTime && selectedTopic && (
        <SourceRecommendation
          language={language}
          timeSelected={selectedTime}
          topicSelected={selectedTopic}
          onBack={goToPrevStep}
          onReflection={handleReflection}
          onSessionAction={(status, src) =>
            recordSession({
              id: crypto.randomUUID(),
              title: src.title,
              topic: selectedTopic,
              date: new Date().toISOString(),
              duration: selectedTime,
              status,
              sefariaLink: src.sefariaLink,
            })
          }
        />
      )}

      {currentStep === "reflection" && currentSource && (
        <ReflectionForm
          language={language}
          source={currentSource}
          onBack={goToPrevStep}
          onSave={handleSaveReflection}
        />
      )}

      {currentStep === "journal" && (
        <Suspense fallback={<div className="p-4">Loading...</div>}>
          <LearningJournal
            language={language}
            onBack={() => setCurrentStep("welcome")}
          />
        </Suspense>
      )}

      {currentStep === "profile" && (
        <Suspense fallback={<div className="p-4">Loading...</div>}>
          <ProfileSettings
            language={language}
            darkMode={darkMode}
            onLanguageChange={(lang) =>
              dispatch({ type: "setLanguage", payload: lang })
            }
            onToggleDark={handleToggleDark}
            onBack={goToPrevStep}
          />
        </Suspense>
      )}
      <BottomNav
        current={
          currentStep === "journal"
            ? "journal"
            : currentStep === "profile"
              ? "profile"
              : "home"
        }
        onHome={() => setCurrentStep("welcome")}
        onJournal={handleJournal}
        onProfile={handleOpenProfile}
      />
=======
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
              onAnalytics={handleAnalytics}
              onSearch={handleSearch}
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
            timeSelected={selectedTime}
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

        {currentStep === 'analytics' && (
          <EnhancedLearningDashboard
            language={language}
            onBack={() => actions.setStep('welcome')}
          />
        )}

        {currentStep === 'search' && (
          <AdvancedSearchAndDiscovery
            language={language}
            onBack={() => actions.setStep('welcome')}
          />
        )}
      </main>

      {/* Bottom Navigation - always visible */}
      <BottomNav
        onHome={() => actions.setStep('welcome')}
        onJournal={handleJournal}
        onProfile={handleOpenProfile}
        onAnalytics={handleAnalytics}
        onSearch={handleSearch}
      />

      {/* Offline Support */}
      <OfflineIndicator />
    </div>
  );
};
