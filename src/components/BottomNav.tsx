import { Button } from "@/components/ui/button";
import { Home, BookOpen, Settings } from "lucide-react";

interface BottomNavProps {
  onHome: () => void;
  onJournal: () => void;
  onProfile: () => void;
}

export const BottomNav = ({ onHome, onJournal, onProfile }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-soft md:hidden">
      <div className="flex justify-around py-2">
        <Button variant="ghost" size="icon" aria-label="Home" onClick={onHome}>
          <Home className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Journal" onClick={onJournal}>
          <BookOpen className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Profile" onClick={onProfile}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
};
