import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

  // Fetch published sources
  const fetchSources = async () => {
    try {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSources(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading sources",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Fetch user's learning sessions
  const fetchSessions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading sessions",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Fetch user's reflections
  const fetchReflections = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReflections(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading reflections",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Create a new learning session
  const createSession = async (topicSelected: string, timeSelected: number, sourceId?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          topic_selected: topicSelected,
          time_selected: timeSelected,
          source_id: sourceId,
          status: 'recommended'
        })
        .select()
        .single();

      if (error) throw error;
      
      setSessions(prev => [data, ...prev]);
      toast({
        title: "Session created",
        description: "Your learning session has been saved"
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating session",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  // Create a new reflection
  const createReflection = async (sessionId: string, note: string, tags: string[] = []) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('reflections')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          note,
          tags
        })
        .select()
        .single();

      if (error) throw error;
      
      setReflections(prev => [data, ...prev]);
      toast({
        title: "Reflection saved",
        description: "Your reflection has been recorded"
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error saving reflection",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

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
            ? { ...session, status, updated_at: new Date().toISOString() }
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSources(),
        fetchSessions(),
        fetchReflections()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    sources,
    sessions,
    reflections,
    loading,
    createSession,
    createReflection,
    updateSessionStatus,
    refreshData: () => {
      fetchSources();
      fetchSessions();
      fetchReflections();
    }
  };
};