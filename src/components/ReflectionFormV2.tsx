import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Language } from "./LanguageToggle";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, X, Save, Loader2 } from "lucide-react";

interface ReflectionFormProps {
  language: Language;
  sessionId: string;
  onBack: () => void;
  onSave: () => void;
}

const content = {
  en: {
    title: "Write Your Reflection",
    subtitle: "Capture your thoughts and insights",
    backButton: "Back",
    reflectionLabel: "Your Reflection",
    reflectionPlaceholder: "What insights did you gain? How does this connect to your life?",
    tagsLabel: "Tags (optional)",
    tagsPlaceholder: "Add a tag...",
    addTagButton: "Add Tag",
    saveButton: "Save Reflection",
    saving: "Saving..."
  },
  he: {
    title: "כתוב את ההרהור שלך",
    subtitle: "תפוס את המחשבות והתובנות שלך",
    backButton: "חזור",
    reflectionLabel: "ההרהור שלך",
    reflectionPlaceholder: "אילו תובנות קיבלת? איך זה מתחבר לחיים שלך?",
    tagsLabel: "תגיות (אופציונלי)",
    tagsPlaceholder: "הוסף תגית...",
    addTagButton: "הוסף תגית",
    saveButton: "שמור הרהור",
    saving: "שומר..."
  }
};

export const ReflectionFormV2 = ({ 
  language, 
  sessionId, 
  onBack, 
  onSave 
}: ReflectionFormProps) => {
  const { createReflection } = useSupabaseData();
  const { success, error } = useToast();
  const [reflection, setReflection] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!reflection.trim()) {
      error("Please write a reflection before saving");
      return;
    }

    setLoading(true);
    
    try {
      const result = await createReflection(sessionId, reflection.trim(), tags);
      if (result) {
        success("Reflection saved successfully!");
        onSave();
      }
    } catch (err) {
      error("Failed to save reflection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 mobile-container">
      <div className="max-w-2xl mx-auto mobile-scroll safe-bottom" style={{ maxHeight: 'calc(100vh - env(safe-area-inset-bottom, 0px) - 80px)' }}>
        <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4" />
            {content[language].backButton}
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold">{content[language].title}</h1>
            <p className="text-muted-foreground">{content[language].subtitle}</p>
          </div>
          
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        {/* Reflection Form */}
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {content[language].reflectionLabel}
              </label>
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder={content[language].reflectionPlaceholder}
                className="min-h-[150px] resize-none"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {content[language].tagsLabel}
              </label>
              
              {/* Existing Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, index) => (
                    <Badge 
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add New Tag */}
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={content[language].tagsPlaceholder}
                  className="flex-1"
                  disabled={loading}
                />
                <Button
                  onClick={handleAddTag}
                  variant="outline"
                  size="sm"
                  disabled={!newTag.trim() || loading}
                >
                  <Plus className="h-4 w-4" />
                  {content[language].addTagButton}
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave}
            className="w-full"
            disabled={!reflection.trim() || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {content[language].saving}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {content[language].saveButton}
              </>
            )}
          </Button>
        </Card>
        </div>
      </div>
    </div>
  );
};
