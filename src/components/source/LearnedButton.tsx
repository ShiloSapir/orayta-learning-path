import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface LearnedButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}

export const LearnedButton = ({ onClick, disabled, label }: LearnedButtonProps) => (
  <Button
    onClick={onClick}
    variant="outline"
    disabled={disabled}
    className="touch-button"
  >
    <CheckCircle className="h-4 w-4 mr-2" />
    <span className="mobile-text-sm">{label}</span>
  </Button>
);

export default LearnedButton;
