import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  learning_preferences: Record<string, unknown>; // JSONB field
  daily_goal: number | null;
  preferred_language: string | null;
  role: string | null;
  calendar_synced: boolean | null;
  dark_mode: boolean | null;
  reminder_time: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
        return;
      }

      setProfile(data ? {
        ...data,
        learning_preferences: (data.learning_preferences && typeof data.learning_preferences === 'object' && !Array.isArray(data.learning_preferences)) 
          ? data.learning_preferences as Record<string, unknown>
          : {}
      } : null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user, fetchProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return false;

    try {
      // Clean updates to match database schema
      const cleanUpdates: any = { ...updates };
      if (cleanUpdates.email === null) {
        delete cleanUpdates.email;
      }
      
      const { error } = await supabase
        .from('users')
        .update(cleanUpdates)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setProfile(prev => (prev ? { ...prev, ...updates } : null));

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
};