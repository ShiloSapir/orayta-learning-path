import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface ReflectionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}

export const ReflectionButton = ({ onClick, disabled, label }: ReflectionButtonProps) => (
  <Button
    onClick={onClick}
    className="w-full touch-button"
    disabled={disabled}
  >
    <BookOpen className="h-4 w-4 mr-2" />
    <span className="mobile-text-base">{label}</span>
  </Button>
);

export default ReflectionButton;
