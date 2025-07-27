import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

interface DarkModeToggleProps {
  darkMode: boolean;
  onToggle: (value: boolean) => void;
}

export const DarkModeToggle = ({ darkMode, onToggle }: DarkModeToggleProps) => {
  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4" />
      <Switch
        checked={darkMode}
        onCheckedChange={onToggle}
        aria-label="Toggle dark mode"
      />
      <Moon className="h-4 w-4" />
    </div>
  );
};
