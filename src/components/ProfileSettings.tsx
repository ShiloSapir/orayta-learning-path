import { Button } from "@/components/ui/button";
import { Language, LanguageToggle } from "./LanguageToggle";
import { DarkModeToggle } from "./DarkModeToggle";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, User, LogOut } from "lucide-react";

interface ProfileSettingsProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onBack: () => void;
}

const content = {
  en: {
    title: "Profile Settings",
    subtitle: "Manage your preferences",
    backButton: "Back",
    languageLabel: "Language",
    themeLabel: "Dark Mode",
    signOutButton: "Sign Out"
  },
  he: {
    title: "הגדרות פרופיל",
    subtitle: "נהל את ההעדפות שלך",
    backButton: "חזור",
    languageLabel: "שפה",
    themeLabel: "מצב כהה",
    signOutButton: "התנתק"
  }
};

export const ProfileSettings = ({
  language,
  onLanguageChange,
  onBack
}: ProfileSettingsProps) => {
  const t = content[language];
  const isHebrew = language === "he";
  const { signOut, user } = useAuth();

  return (
    <div className={`min-h-screen bg-gradient-subtle p-4 pb-20 ${isHebrew ? "hebrew" : ""}`}>
      <div className="max-w-xl mx-auto py-8 animate-fade-in space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t.backButton}
          </Button>
          <User className="h-8 w-8 text-primary" />
          <div className="w-16" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between gap-4">
          <span className="font-medium">{t.languageLabel}</span>
          <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
        </div>

        {/* Dark Mode */}
        <div className="flex items-center justify-between gap-4">
          <span className="font-medium">{t.themeLabel}</span>
          <DarkModeToggle />
        </div>

        {/* User Info */}
        {user && (
          <div className="border-t pt-6">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t.signOutButton}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
