import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface CalendarButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export const CalendarButton = ({ onClick, label, disabled, className }: CalendarButtonProps) => (
  <Button
    onClick={onClick}
    variant="outline"
    disabled={disabled}
    className={`touch-button ${className ?? ''}`}
  >
    <Calendar className="h-4 w-4 mr-2" />
    <span className="mobile-text-sm">{label}</span>
  </Button>
);

export default CalendarButton;
