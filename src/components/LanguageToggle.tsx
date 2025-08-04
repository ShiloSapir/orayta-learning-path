import React from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export type Language = 'en' | 'he';

interface LanguageToggleProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageToggle = ({ language, onLanguageChange }: LanguageToggleProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onLanguageChange(language === 'en' ? 'he' : 'en')}
      className="flex items-center gap-2 btn-gentle"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">
        {language === 'en' ? 'עברית' : 'English'}
      </span>
    </Button>
  );
};