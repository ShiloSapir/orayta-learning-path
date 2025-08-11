import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface SaveButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}

export const SaveButton = ({ onClick, disabled, label }: SaveButtonProps) => (
  <Button
    onClick={onClick}
    variant="outline"
    disabled={disabled}
    className="touch-button"
  >
    <Heart className="h-4 w-4 mr-2" />
    <span className="mobile-text-sm">{label}</span>
  </Button>
);

export default SaveButton;
