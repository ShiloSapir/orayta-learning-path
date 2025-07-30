import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

interface GenerationRequest {
  topic: string;
  timeMinutes: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  language?: 'en' | 'he' | 'both';
  count?: number;
  saveToDatabase?: boolean;
}

interface GeneratedSource {
  id?: string;
  title: string;
  title_he: string;
  category: string;
  subcategory?: string;
  source_type: string;
  start_ref: string;
  end_ref: string;
  sefaria_link: string;
  text_excerpt: string;
  text_excerpt_he: string;
  reflection_prompt: string;
  reflection_prompt_he: string;
  estimated_time: number;
  min_time: number;
  max_time: number;
  difficulty_level: string;
  learning_objectives: string[];
  prerequisites: string[];
  commentaries: string[];
  language_preference: string;
  published?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useAISourceGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<GeneratedSource | null>(null);
  const { toast } = useToast();

  const generateSource = async (request: GenerationRequest): Promise<GeneratedSource | null> => {
    setIsGenerating(true);
    
    try {
      console.log('Generating AI source with request:', request);
      
      const { data, error } = await supabase.functions.invoke('ai-source-generator', {
        body: request
      });

      if (error) {
        console.error('Error calling AI source generator:', error);
        toast({
          title: "Generation Failed",
          description: "Failed to generate AI source. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (!data.success) {
        console.error('AI source generation failed:', data.error);
        toast({
          title: "Generation Failed", 
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
        return null;
      }

      const source = data.sources;

      if (!source.title || !source.title_he || !source.sefaria_link) {
        toast({
          title: "Generation Failed",
          description: "AI response was missing required fields.",
          variant: "destructive",
        });
        return null;
      }

      setLastGenerated(source);
      
      toast({
        title: "Source Generated",
        description: `Successfully generated "${source.title}"`,
      });

      return source;
    } catch (error) {
      console.error('Error in generateSource:', error);
      toast({
        title: "Generation Error",
        description: "An unexpected error occurred while generating the source.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const bulkGenerateSource = async (request: GenerationRequest): Promise<GeneratedSource[]> => {
    setIsGenerating(true);
    
    try {
      console.log('Bulk generating AI sources with request:', request);
      
      const { data, error } = await supabase.functions.invoke('ai-source-generator', {
        body: { ...request, saveToDatabase: true }
      });

      if (error) {
        console.error('Error in bulk generation:', error);
        toast({
          title: "Bulk Generation Failed",
          description: "Failed to bulk generate AI sources. Please try again.",
          variant: "destructive",
        });
        return [];
      }

      if (!data.success) {
        console.error('Bulk AI generation failed:', data.error);
        toast({
          title: "Bulk Generation Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
        return [];
      }

      const sources = Array.isArray(data.sources) ? data.sources : [data.sources];
      
      toast({
        title: "Bulk Generation Complete",
        description: `Successfully generated ${sources.length} sources`,
      });

      return sources;
    } catch (error) {
      console.error('Error in bulkGenerateSource:', error);
      toast({
        title: "Bulk Generation Error",
        description: "An unexpected error occurred during bulk generation.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackSource = async (
    topic: string, 
    timeMinutes: number, 
    difficulty: string = 'beginner'
  ): Promise<GeneratedSource | null> => {
    console.log('Generating fallback source for:', { topic, timeMinutes, difficulty });
    
    return generateSource({
      topic,
      timeMinutes,
      difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
      saveToDatabase: true,
    });
  };

  return {
    generateSource,
    bulkGenerateSource,
    generateFallbackSource,
    isGenerating,
    lastGenerated,
  };
};