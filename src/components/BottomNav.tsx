import { Button } from "@/components/ui/button";
import { Home, BookOpen, Settings, BarChart3, Search, Sparkles } from "lucide-react";

interface BottomNavProps {
  onHome: () => void;
  onJournal: () => void;
  onProfile: () => void;
  onAnalytics?: () => void;
  onSearch?: () => void;
  onAdmin?: () => void;
}

export const BottomNav = ({ onHome, onJournal, onProfile, onAnalytics, onSearch, onAdmin }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-soft md:hidden">
      <div className="flex justify-around py-2">
        <Button variant="ghost" size="icon" aria-label="Home" onClick={onHome}>
          <Home className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Journal" onClick={onJournal}>
          <BookOpen className="h-5 w-5" />
        </Button>
        {onAnalytics && (
          <Button variant="ghost" size="icon" aria-label="Analytics" onClick={onAnalytics}>
            <BarChart3 className="h-5 w-5" />
          </Button>
        )}
        {onSearch && (
          <Button variant="ghost" size="icon" aria-label="Search" onClick={onSearch}>
            <Search className="h-5 w-5" />
          </Button>
        )}
        {onAdmin && (
          <Button variant="ghost" size="icon" aria-label="Admin" onClick={onAdmin}>
            <Sparkles className="h-5 w-5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" aria-label="Profile" onClick={onProfile}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
};
