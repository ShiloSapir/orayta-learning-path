import { Button } from "@/components/ui/button";
import { Home, BookOpen, BarChart3, Search, Sparkles, User, Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import type { Language } from "./LanguageToggle";

interface BottomNavProps {
  currentStep: string;
  onHome: () => void;
  onJournal: () => void;
  onProfile: () => void;
  onAnalytics?: () => void;
  onSearch?: () => void;
  onAdmin?: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const BottomNav = ({
  currentStep,
  onHome,
  onJournal,
  onProfile,
  onAnalytics,
  onSearch,
  onAdmin,
  language,
  onLanguageChange,
}: BottomNavProps) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
      <nav className="fixed bottom-0 left-0 right-0 bg-background/98 backdrop-blur-lg border-t border-border shadow-soft md:hidden z-50">
        <div className="safe-area-inset-bottom">
          <div className="flex justify-around py-3 px-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Home"
              onClick={onHome}
              className={`h-14 w-16 flex flex-col gap-1 rounded-xl touch-button transition-all duration-200 ${
                currentStep === 'welcome' 
                  ? 'text-primary bg-primary/15 shadow-lg scale-105' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Journal"
              onClick={onJournal}
              className={`h-14 w-16 flex flex-col gap-1 rounded-xl touch-button transition-all duration-200 ${
                currentStep === 'journal' 
                  ? 'text-primary bg-primary/15 shadow-lg scale-105' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-medium">Journal</span>
            </Button>
            {onAnalytics && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Analytics"
                onClick={onAnalytics}
                className={`h-14 w-16 flex flex-col gap-1 rounded-xl touch-button transition-all duration-200 ${
                  currentStep === 'analytics' 
                    ? 'text-primary bg-primary/15 shadow-lg scale-105' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs font-medium">Stats</span>
              </Button>
            )}
            {onSearch && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                onClick={onSearch}
                className={`h-14 w-16 flex flex-col gap-1 rounded-xl touch-button transition-all duration-200 ${
                  currentStep === 'search' 
                    ? 'text-primary bg-primary/15 shadow-lg scale-105' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <Search className="h-5 w-5" />
                <span className="text-xs font-medium">Search</span>
              </Button>
            )}
            {onAdmin && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Admin"
                onClick={onAdmin}
                className="h-14 w-16 flex flex-col gap-1 rounded-xl touch-button transition-all duration-200 hover:bg-muted/50"
              >
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-medium">Admin</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Profile"
              onClick={onProfile}
              className={`h-14 w-16 flex flex-col gap-1 rounded-xl touch-button transition-all duration-200 ${
                currentStep === 'profile'
                  ? 'text-primary bg-primary/15 shadow-lg scale-105'
                  : 'hover:bg-muted/50'
              }`}
            >
              <User className="h-5 w-5" />
              <span className="text-xs font-medium">Profile</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle language"
              onClick={() => onLanguageChange(language === 'en' ? 'he' : 'en')}
              className={`h-14 w-16 flex flex-col gap-1 rounded-xl touch-button transition-all duration-200 ${
                language === 'he' ? 'text-primary bg-primary/15 shadow-lg scale-105' : 'hover:bg-muted/50'
              }`}
            >
              <Globe className="h-5 w-5" />
              <span className="text-xs font-medium">Lang</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`h-14 w-16 flex flex-col gap-1 rounded-xl touch-button transition-all duration-200 ${
                isDark ? 'text-primary bg-primary/15 shadow-lg scale-105' : 'hover:bg-muted/50'
              }`}
            >
              {isDark ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span className="text-xs font-medium">Theme</span>
            </Button>
          </div>
        </div>
      </nav>
  );
};
