import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Validation schemas
const SourceSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  title_he: z.string().min(1, "Hebrew title is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  estimated_time: z.number().min(1, "Estimated time must be positive"),
  sefaria_link: z.string().url("Invalid URL"),
  text_excerpt: z.string().optional(),
  text_excerpt_he: z.string().optional(),
  reflection_prompt: z.string().min(1, "Reflection prompt is required"),
  reflection_prompt_he: z.string().min(1, "Hebrew reflection prompt is required"),
  published: z.boolean(),
  start_ref: z.string().min(1, "Start reference is required"),
  end_ref: z.string().min(1, "End reference is required"),
  commentaries: z.array(z.string()).optional(),
  // Enhanced fields
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  source_type: z.enum(['text_study', 'practical_halacha', 'philosophical', 'historical', 'mystical']).optional(),
  language_preference: z.enum(['english', 'hebrew', 'both']).optional(),
  min_time: z.number().min(5).optional(),
  max_time: z.number().max(60).optional(),
  learning_objectives: z.array(z.string()).optional(),
  ai_generated: z.boolean().optional()
});

const SessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  topic_selected: z.string().min(1, "Topic is required"),
  time_selected: z.number().min(1, "Time must be positive"),
  source_id: z.string().uuid().optional(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string()
});

const ReflectionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  session_id: z.string().uuid().optional(),
  note: z.string().min(1, "Reflection note is required"),
  tags: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string()
});

export interface Source {
  id: string;
  title: string;
  title_he: string;
  category: string;
  subcategory?: string;
  estimated_time: number;
  sefaria_link: string;
  text_excerpt?: string;
  text_excerpt_he?: string;
  reflection_prompt: string;
  reflection_prompt_he: string;
  published: boolean;
  start_ref: string;
  end_ref: string;
  commentaries?: string[];
  // Enhanced fields
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  source_type?: 'text_study' | 'practical_halacha' | 'philosophical' | 'historical' | 'mystical';
  language_preference?: 'english' | 'hebrew' | 'both';
  min_time?: number;
  max_time?: number;
  learning_objectives?: string[];
  prerequisites?: string[];
}

export interface LearningSession {
  id: string;
  user_id: string;
  topic_selected: string;
  time_selected: number;
  source_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  session_id?: string;
  note: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const useSupabaseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sources, setSources] = useState<Source[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    sources: { page: 1, hasMore: true, total: 0 },
    sessions: { page: 1, hasMore: true, total: 0 },
    reflections: { page: 1, hasMore: true, total: 0 }
  });

  const ITEMS_PER_PAGE = 20;

  // Fetch published sources with pagination and validation
  const fetchSources = useCallback(async (limit?: number, offset?: number) => {
    try {
      let query = supabase
        .from('sources')
        .select('*', { count: 'exact' })
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }
      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      
      // Validate and transform data
      const validatedSources = (data || []).map(source => {
        // Safely cast enum values to proper types
        const difficulty_level = (['beginner', 'intermediate', 'advanced'] as const).includes(source.difficulty_level as any) 
          ? source.difficulty_level as 'beginner' | 'intermediate' | 'advanced'
          : 'beginner';
        
        const source_type = (['text_study', 'practical_halacha', 'philosophical', 'historical', 'mystical'] as const).includes(source.source_type as any)
          ? source.source_type as 'text_study' | 'practical_halacha' | 'philosophical' | 'historical' | 'mystical'
          : 'text_study';
          
        const language_preference = (['english', 'hebrew', 'both'] as const).includes(source.language_preference as any)
          ? source.language_preference as 'english' | 'hebrew' | 'both'
          : 'both';

        return {
          ...source,
          difficulty_level,
          source_type,
          language_preference,
          min_time: source.min_time || Math.max(5, source.estimated_time - 5),
          max_time: source.max_time || Math.min(60, source.estimated_time + 10),
          learning_objectives: source.learning_objectives || [],
          ai_generated: !!(source as any).ai_generated
        } as Source;
      }).filter(source => {
        try {
          // Basic validation - just check required fields exist
          return source.id && source.title && source.category && source.published;
        } catch (error) {
          console.warn('Invalid source data:', source, error);
          return false;
        }
      });

      setSources(validatedSources);
      return { sources: validatedSources, total: count || 0 };
    } catch (error: any) {
      console.error('Error fetching sources:', error);
      toast({
        title: "Error loading sources",
        description: error.message || "Failed to load sources",
        variant: "destructive"
      });
      return { sources: [], total: 0 };
    }
  }, [toast]);

  // Fetch user's learning sessions with validation
  const fetchSessions = useCallback(async (limit?: number) => {
    if (!user) return { sessions: [], total: 0 };
    
    try {
      let query = supabase
        .from('learning_sessions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      
      // Validate and sanitize data
      const validatedSessions = (data || []).filter(session => {
        try {
          SessionSchema.parse(session);
          return true;
        } catch {
          console.warn('Invalid session data:', session);
          return false;
        }
      });

      setSessions(validatedSessions);
      return { sessions: validatedSessions, total: count || 0 };
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error loading sessions",
        description: error.message || "Failed to load sessions",
        variant: "destructive"
      });
      return { sessions: [], total: 0 };
    }
  }, [user, toast]);

  // Fetch user's reflections with validation
  const fetchReflections = useCallback(async (limit?: number) => {
    if (!user) return { reflections: [], total: 0 };
    
    try {
      let query = supabase
        .from('reflections')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      
      // Validate and sanitize data
      const validatedReflections = (data || []).filter(reflection => {
        try {
          ReflectionSchema.parse(reflection);
          return true;
        } catch {
          console.warn('Invalid reflection data:', reflection);
          return false;
        }
      });

      setReflections(validatedReflections);
      return { reflections: validatedReflections, total: count || 0 };
    } catch (error: any) {
      console.error('Error fetching reflections:', error);
      toast({
        title: "Error loading reflections",
        description: error.message || "Failed to load reflections",
        variant: "destructive"
      });
      return { reflections: [], total: 0 };
    }
  }, [user, toast]);

  // Create a new learning session with validation
  const createSession = useCallback(async (topicSelected: string, timeSelected: number, sourceId?: string) => {
    if (!user) return null;

    // Input validation
    if (!topicSelected.trim()) {
      toast({
        title: "Validation Error",
        description: "Topic selection is required",
        variant: "destructive"
      });
      return null;
    }

    if (timeSelected <= 0) {
      toast({
        title: "Validation Error", 
        description: "Time selection must be positive",
        variant: "destructive"
      });
      return null;
    }

    try {
      const sessionData = {
        user_id: user.id,
        topic_selected: topicSelected.trim(),
        time_selected: timeSelected,
        source_id: sourceId,
        status: 'recommended'
      };

      const { data, error } = await supabase
        .from('learning_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;
      
      // Validate returned data
      const validatedSession = SessionSchema.parse(data);
      
      setSessions(prev => [validatedSession as LearningSession, ...prev]);
      toast({
        title: "Session created",
        description: "Your learning session has been saved"
      });
      
      return validatedSession;
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast({
        title: "Error creating session",
        description: error.message || "Failed to create session",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast]);

  // Create a new reflection with validation
  const createReflection = useCallback(async (sessionId: string, note: string, tags: string[] = []) => {
    if (!user) return null;

    // Input validation and sanitization
    const sanitizedNote = note.trim();
    if (!sanitizedNote) {
      toast({
        title: "Validation Error",
        description: "Reflection note is required",
        variant: "destructive"
      });
      return null;
    }

    if (sanitizedNote.length > 5000) {
      toast({
        title: "Validation Error",
        description: "Reflection note is too long (max 5000 characters)",
        variant: "destructive"
      });
      return null;
    }

    // Sanitize tags
    const sanitizedTags = tags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length <= 50)
      .slice(0, 10); // Limit to 10 tags

    try {
      const reflectionData = {
        user_id: user.id,
        session_id: sessionId,
        note: sanitizedNote,
        tags: sanitizedTags
      };

      const { data, error } = await supabase
        .from('reflections')
        .insert(reflectionData)
        .select()
        .single();

      if (error) throw error;
      
      // Validate returned data
      const validatedReflection = ReflectionSchema.parse(data);
      
      setReflections(prev => [validatedReflection as Reflection, ...prev]);
      toast({
        title: "Reflection saved",
        description: "Your reflection has been recorded"
      });
      
      return validatedReflection;
    } catch (error: any) {
      console.error('Error saving reflection:', error);
      toast({
        title: "Error saving reflection",
        description: error.message || "Failed to save reflection",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast]);

  // Update session status
  const updateSessionStatus = async (sessionId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('learning_sessions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, status, updated_at: new Date().toISOString() } as LearningSession
            : session
        )
      );
    } catch (error: any) {
      toast({
        title: "Error updating session",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSources(ITEMS_PER_PAGE),
        fetchSessions(ITEMS_PER_PAGE),
        fetchReflections(ITEMS_PER_PAGE)
      ]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, fetchSources, fetchSessions, fetchReflections]);

  return {
    sources,
    sessions,
    reflections,
    pagination,
    loading,
    createSession,
    createReflection,
    updateSessionStatus,
    fetchSources,
    fetchSessions, 
    fetchReflections,
    refreshData: useCallback(() => {
      fetchSources(ITEMS_PER_PAGE);
      fetchSessions(ITEMS_PER_PAGE);
      fetchReflections(ITEMS_PER_PAGE);
    }, [fetchSources, fetchSessions, fetchReflections])
  };
};