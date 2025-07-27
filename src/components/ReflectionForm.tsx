import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Language } from "./LanguageToggle";
import { ArrowLeft, Save, Sparkles } from "lucide-react";

import type { SourceEntry } from "../data/sources";

interface ReflectionFormProps {
  language: Language;
  source: SourceEntry;
  onBack: () => void;
  onSave: (reflection: string, tags: string[]) => void;
}

const content = {
  en: {
    title: "Write Your Reflection",
    subtitle: "Engage deeply with the Torah source",
    placeholder: "Share your thoughts, insights, questions, or personal connections to this teaching...",
    tagsLabel: "How does this source feel to you? (Optional)",
    tags: ["Inspiring", "Challenging", "Ethical", "Emotional", "Practical", "Philosophical"],
    saveButton: "Save Reflection",
    backButton: "Back",
    characterCount: "characters"
  },
  he: {
    title: "כתוב את ההרהור שלך",
    subtitle: "התעמק במקור התורני",
    placeholder: "שתף את המחשבות, התובנות, השאלות או הקשרים האישיים שלך ללימוד הזה...",
    tagsLabel: "איך המקור הזה מרגיש לך? (רשות)",
    tags: ["מעורר השראה", "מאתגר", "אתי", "רגשי", "מעשי", "פילוסופי"],
    saveButton: "שמור הרהור",
    backButton: "חזור",
    characterCount: "תווים"
  }
};

export const ReflectionForm = ({ language, source, onBack, onSave }: ReflectionFormProps) => {
  const [reflection, setReflection] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const t = content[language];
  const isHebrew = language === 'he';

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSave = () => {
    if (reflection.trim()) {
      onSave(reflection, selectedTags);
    }
  };

  return (
    <div className={`min-h-screen gradient-subtle p-4 pb-20 ${isHebrew ? 'hebrew' : ''}`}>
      <div className="max-w-4xl mx-auto py-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backButton}
          </Button>
          <div className="text-center flex-1 mx-4">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-sm text-muted-foreground max-w-md mx-auto truncate">
              {source.title}
            </div>
          </div>
          <div className="w-16" /> {/* Spacer for balance */}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t.title}
          </h1>
          <p className="text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* Reflection Form */}
        <Card className="learning-card gradient-warm">
          <div className="space-y-6">
            {/* Textarea */}
            <div>
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder={t.placeholder}
                className={`min-h-[200px] resize-none bg-background/50 border-border/50 ${
                  isHebrew ? 'text-right' : 'text-left'
                }`}
                dir={isHebrew ? 'rtl' : 'ltr'}
              />
              <div className="text-right mt-2 text-sm text-muted-foreground">
                {reflection.length} {t.characterCount}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                {t.tagsLabel}
              </h3>
              <div className="flex flex-wrap gap-2">
                {t.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer transition-smooth ${
                      selectedTags.includes(tag)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-primary/10 hover:text-primary hover:border-primary"
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="text-center pt-4">
              <Button
                onClick={handleSave}
                disabled={!reflection.trim()}
                className="btn-spiritual px-8"
              >
                <Save className="h-4 w-4 mr-2" />
                {t.saveButton}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};