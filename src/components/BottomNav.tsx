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
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border shadow-soft md:hidden z-50">
      <div className="safe-area-inset-bottom">
        <div className="flex justify-around py-2 px-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Home"
            onClick={onHome}
            className={`h-12 w-12 flex flex-col gap-1 rounded-xl touch-button ${currentStep === 'welcome' ? 'text-primary bg-primary/10' : ''}`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Journal"
            onClick={onJournal}
            className={`h-12 w-12 flex flex-col gap-1 rounded-xl touch-button ${currentStep === 'journal' ? 'text-primary bg-primary/10' : ''}`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs">Journal</span>
          </Button>
          {onAnalytics && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Analytics"
              onClick={onAnalytics}
              className={`h-12 w-12 flex flex-col gap-1 rounded-xl touch-button ${currentStep === 'analytics' ? 'text-primary bg-primary/10' : ''}`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Stats</span>
            </Button>
          )}
          {onSearch && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={onSearch}
              className={`h-12 w-12 flex flex-col gap-1 rounded-xl touch-button ${currentStep === 'search' ? 'text-primary bg-primary/10' : ''}`}
            >
              <Search className="h-5 w-5" />
              <span className="text-xs">Search</span>
            </Button>
          )}
          {onAdmin && (
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Admin" 
              onClick={onAdmin} 
              className="h-12 w-12 flex flex-col gap-1 rounded-xl touch-button"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-xs">Admin</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Profile"
            onClick={onProfile}
            className={`h-12 w-12 flex flex-col gap-1 rounded-xl touch-button ${currentStep === 'profile' ? 'text-primary bg-primary/10' : ''}`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
