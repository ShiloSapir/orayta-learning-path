import { useState } from "react";
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
  };

  const handleTimeSelect = (minutes: number) => {
    setSelectedTime(minutes);
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
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
    </div>
  );
};
