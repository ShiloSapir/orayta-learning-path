import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Settings } from "lucide-react";

type NavItem = "home" | "journal" | "profile";

interface BottomNavProps {
  current: NavItem;
  onHome: () => void;
  onJournal: () => void;
  onProfile: () => void;
}

export const BottomNav = memo(
  ({ current, onHome, onJournal, onProfile }: BottomNavProps) => {
    const activeClass = "text-primary";

    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur border-t border-border shadow-soft md:hidden">
        <div className="flex justify-around py-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Home"
            onClick={onHome}
            aria-current={current === "home" ? "page" : undefined}
          >
            <Home
              className={`h-5 w-5 ${current === "home" ? activeClass : ""}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Journal"
            onClick={onJournal}
            aria-current={current === "journal" ? "page" : undefined}
          >
            <BookOpen
              className={`h-5 w-5 ${current === "journal" ? activeClass : ""}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Profile"
            onClick={onProfile}
            aria-current={current === "profile" ? "page" : undefined}
          >
            <Settings
              className={`h-5 w-5 ${current === "profile" ? activeClass : ""}`}
            />
          </Button>
        </div>
      </nav>
    );
  },
);
=======
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Settings, BarChart3, Search } from "lucide-react";

interface BottomNavProps {
  onHome: () => void;
  onJournal: () => void;
  onProfile: () => void;
  onAnalytics?: () => void;
  onSearch?: () => void;
}

export const BottomNav = ({ onHome, onJournal, onProfile, onAnalytics, onSearch }: BottomNavProps) => {
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
        <Button variant="ghost" size="icon" aria-label="Profile" onClick={onProfile}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
};
