import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

interface GenerationRequest {
  topic: string;
  timeMinutes: number;
  language: string;
  userContext?: {
    name?: string;
    learningHistory?: string[];
    preferences?: any;
    difficulty?: string;
  };
}

interface GeneratedSource {
  title: string;
  author: string;
  text: string;
  translation: string;
  commentary: string;
  reflection_prompts: string[];
  estimated_time: number;
  difficulty: string;
  tags: string[];
  sefaria_ref?: string;
  learning_objectives: string[];
  topic: string;
  language: string;
}

export const useGeminiAgent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<GeneratedSource | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateSource = useCallback(async (request: GenerationRequest): Promise<GeneratedSource | null> => {
    setIsGenerating(true);
    
    try {
      console.log('Generating Torah source with Gemini...', request);
      
      // Build user context from preferences and history
      const userContext = {
        name: user?.user_metadata?.name || user?.email,
        difficulty: request.userContext?.difficulty || 'intermediate',
        learningHistory: request.userContext?.learningHistory || [],
        preferences: request.userContext?.preferences || {}
      };

      const { data, error } = await supabase.functions.invoke('gemini-source-agent', {
        body: {
          topic: request.topic,
          timeMinutes: request.timeMinutes,
          language: request.language,
          userContext
        }
      });

      if (error) {
        console.error('Gemini agent function error:', error);
        throw new Error(error.message || 'Failed to generate source');
      }

      if (!data) {
        throw new Error('No data returned from Gemini agent');
      }

      // Validate the generated source
      if (!data.title || !data.translation || !data.commentary) {
        throw new Error('Generated source is missing required fields');
      }

      console.log('Successfully generated Torah source:', data.title);
      setLastGenerated(data);
      
      toast({
        title: "Torah Source Generated",
        description: `Created personalized source: "${data.title}"`,
      });

      return data;

    } catch (error) {
      console.error('Error generating source with Gemini:', error);
      
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Failed to generate Torah source',
        variant: "destructive",
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, toast]);

  const generateFallbackSource = useCallback(async (
    topic: string, 
    timeMinutes: number, 
    difficulty?: string
  ): Promise<GeneratedSource | null> => {
    // Try with a related topic if the original fails
    const relatedTopics = {
      'halacha': ['practical judaism', 'jewish law basics', 'everyday mitzvot'],
      'rambam': ['maimonides wisdom', 'jewish philosophy', 'medieval jewish thought'],
      'tanakh': ['biblical stories', 'torah wisdom', 'psalms'],
      'talmud': ['rabbinic wisdom', 'jewish ethics', 'talmudic stories'],
      'spiritual': ['jewish spirituality', 'character development', 'relationships'],
      'surprise': ['jewish wisdom', 'torah insights', 'jewish values']
    };

    const related = relatedTopics[topic.toLowerCase() as keyof typeof relatedTopics] || ['jewish learning'];
    const fallbackTopic = related[Math.floor(Math.random() * related.length)];

    console.log(`Trying fallback generation with topic: ${fallbackTopic}`);

    return generateSource({
      topic: fallbackTopic,
      timeMinutes,
      language: 'en',
      userContext: { difficulty }
    });
  }, [generateSource]);

  const getConversationHistory = useCallback(async (sessionId: string) => {
    // TODO: Implement when agent_conversations table is created
    console.log('Conversation history requested for session:', sessionId);
    return [];
  }, []);

  const saveConversationTurn = useCallback(async (
    sessionId: string,
    userMessage: string,
    agentResponse: GeneratedSource
  ) => {
    // TODO: Implement when agent_conversations table is created
    console.log('Saving conversation turn:', { sessionId, userMessage, agentResponse });
  }, []);

  return {
    generateSource,
    generateFallbackSource,
    getConversationHistory,
    saveConversationTurn,
    isGenerating,
    lastGenerated
  };
};