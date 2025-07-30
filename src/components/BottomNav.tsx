import { Button } from "@/components/ui/button";
import { Home, BookOpen, Settings, BarChart3, Search, Sparkles } from "lucide-react";

interface BottomNavProps {
  currentStep: string;
  onHome: () => void;
  onJournal: () => void;
  onProfile: () => void;
  onAnalytics?: () => void;
  onSearch?: () => void;
  onAdmin?: () => void;
}

export const BottomNav = ({ currentStep, onHome, onJournal, onProfile, onAnalytics, onSearch, onAdmin }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-soft md:hidden">
      <div className="flex justify-around py-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Home"
          onClick={onHome}
          className={`h-11 w-11 ${currentStep === 'welcome' ? 'text-primary' : ''}`}
        >
          <Home className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Journal"
          onClick={onJournal}
          className={`h-11 w-11 ${currentStep === 'journal' ? 'text-primary' : ''}`}
        >
          <BookOpen className="h-5 w-5" />
        </Button>
        {onAnalytics && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Analytics"
            onClick={onAnalytics}
            className={`h-11 w-11 ${currentStep === 'analytics' ? 'text-primary' : ''}`}
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
        )}
        {onSearch && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={onSearch}
            className={`h-11 w-11 ${currentStep === 'search' ? 'text-primary' : ''}`}
          >
            <Search className="h-5 w-5" />
          </Button>
        )}
        {onAdmin && (
          <Button variant="ghost" size="icon" aria-label="Admin" onClick={onAdmin} className="h-11 w-11">
            <Sparkles className="h-5 w-5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Profile"
          onClick={onProfile}
          className={`h-11 w-11 ${currentStep === 'profile' ? 'text-primary' : ''}`}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
};
