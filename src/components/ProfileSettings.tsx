import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { LanguageToggle, Language } from "./LanguageToggle";
import { DarkModeToggle } from "./DarkModeToggle";
import { ArrowLeft, User, LogOut, Sparkles } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { LoadingSpinner } from "./LoadingSpinner";
import { useState } from "react";

interface ProfileSettingsProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onBack: () => void;
}

const content = {
  en: {
    title: "Profile Settings",
    subtitle: "Manage your preferences",
    backButton: "Back",
    languageLabel: "Language", 
    themeLabel: "Dark Mode",
    signOutButton: "Sign Out",
    profile: "Profile",
    profileDescription: "Your account information",
    name: "Name",
    email: "Email",
    namePlaceholder: "Enter your name"
  },
  he: {
    title: "הגדרות פרופיל",
    subtitle: "נהל את ההעדפות שלך",
    backButton: "חזור",
    languageLabel: "שפה",
    themeLabel: "מצב כהה",
    signOutButton: "התנתק",
    profile: "פרופיל",
    profileDescription: "פרטי החשבון שלך",
    name: "שם",
    email: "אימייל",
    namePlaceholder: "הכנס את שמך"
  }
};

export const ProfileSettings = ({ language, onLanguageChange, onBack }: ProfileSettingsProps) => {
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useUserProfile(user);
  const [isUpdating, setIsUpdating] = useState(false);
  const t = content[language];

  const handleUpdateName = async (newName: string) => {
    if (!newName.trim()) return;
    
    setIsUpdating(true);
    await updateProfile({ name: newName.trim() });
    setIsUpdating(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
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

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t.profile}
            </CardTitle>
            <CardDescription>
              {t.profileDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                type="text"
                defaultValue={profile?.name || user?.email || ''}
                onBlur={(e) => handleUpdateName(e.target.value)}
                disabled={isUpdating}
                placeholder={t.namePlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <div className="flex items-center justify-between gap-4">
          <span className="font-medium">{t.languageLabel}</span>
          <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
        </div>

        {/* Theme */}
        <div className="flex items-center justify-between gap-4">
          <span className="font-medium">{t.themeLabel}</span>
          <DarkModeToggle />
        </div>
        {/* Admin Tools */}
        {profile?.role === 'admin' && (
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={() => window.location.assign('/admin')}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Admin Tools
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Sign Out */}

          
        
        <Separator />
        
        <Card>
          <CardContent className="pt-6">
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t.signOutButton}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};