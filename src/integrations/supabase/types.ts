export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json
          id: string
          ip_address: unknown | null
          resource: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json
          id?: string
          ip_address?: unknown | null
          resource: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json
          id?: string
          ip_address?: unknown | null
          resource?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          error_code: string | null
          error_message: string | null
          event_data: Json
          event_type: string
          id: string
          latency_ms: number | null
          request_id: string | null
          scope: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          event_data?: Json
          event_type: string
          id?: string
          latency_ms?: number | null
          request_id?: string | null
          scope?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          latency_ms?: number | null
          request_id?: string | null
          scope?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      learning_sessions: {
        Row: {
          created_at: string | null
          id: string
          source_id: string | null
          status: string | null
          time_selected: number
          topic_selected: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          source_id?: string | null
          status?: string | null
          time_selected: number
          topic_selected: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          source_id?: string | null
          status?: string | null
          time_selected?: number
          topic_selected?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reflections: {
        Row: {
          created_at: string | null
          id: string
          note: string
          session_id: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          note: string
          session_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          note?: string
          session_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reflections_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "learning_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_sources: {
        Row: {
          created_at: string
          id: string
          is_saved: boolean
          saved_at: string
          sefaria_link: string | null
          source_excerpt: string | null
          source_excerpt_he: string | null
          source_id: string | null
          source_title: string
          source_title_he: string | null
          time_selected: number
          topic_selected: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_saved?: boolean
          saved_at?: string
          sefaria_link?: string | null
          source_excerpt?: string | null
          source_excerpt_he?: string | null
          source_id?: string | null
          source_title: string
          source_title_he?: string | null
          time_selected: number
          topic_selected: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_saved?: boolean
          saved_at?: string
          sefaria_link?: string | null
          source_excerpt?: string | null
          source_excerpt_he?: string | null
          source_id?: string | null
          source_title?: string
          source_title_he?: string | null
          time_selected?: number
          topic_selected?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          category: string
          commentaries: string[] | null
          created_at: string | null
          difficulty_level: string | null
          end_ref: string
          estimated_time: number
          id: string
          language_preference: string | null
          learning_objectives: string[] | null
          max_time: number | null
          min_time: number | null
          prerequisites: string[] | null
          published: boolean | null
          reflection_prompt: string
          reflection_prompt_he: string
          sefaria_link: string
          source_type: string | null
          start_ref: string
          subcategory: string | null
          text_excerpt: string | null
          text_excerpt_he: string | null
          title: string
          title_he: string
          updated_at: string | null
        }
        Insert: {
          category: string
          commentaries?: string[] | null
          created_at?: string | null
          difficulty_level?: string | null
          end_ref: string
          estimated_time?: number
          id?: string
          language_preference?: string | null
          learning_objectives?: string[] | null
          max_time?: number | null
          min_time?: number | null
          prerequisites?: string[] | null
          published?: boolean | null
          reflection_prompt: string
          reflection_prompt_he: string
          sefaria_link: string
          source_type?: string | null
          start_ref: string
          subcategory?: string | null
          text_excerpt?: string | null
          text_excerpt_he?: string | null
          title: string
          title_he: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          commentaries?: string[] | null
          created_at?: string | null
          difficulty_level?: string | null
          end_ref?: string
          estimated_time?: number
          id?: string
          language_preference?: string | null
          learning_objectives?: string[] | null
          max_time?: number | null
          min_time?: number | null
          prerequisites?: string[] | null
          published?: boolean | null
          reflection_prompt?: string
          reflection_prompt_he?: string
          sefaria_link?: string
          source_type?: string | null
          start_ref?: string
          subcategory?: string | null
          text_excerpt?: string | null
          text_excerpt_he?: string | null
          title?: string
          title_he?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      test_runs: {
        Row: {
          admin_user_id: string
          created_at: string
          error_details: string | null
          execution_time_ms: number
          id: string
          logs: Json
          passed: boolean
          payload_snippet: Json | null
          suite_name: string
          test_case: string
          test_config: Json
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          error_details?: string | null
          execution_time_ms: number
          id?: string
          logs?: Json
          passed: boolean
          payload_snippet?: Json | null
          suite_name: string
          test_case: string
          test_config?: Json
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          error_details?: string | null
          execution_time_ms?: number
          id?: string
          logs?: Json
          passed?: boolean
          payload_snippet?: Json | null
          suite_name?: string
          test_case?: string
          test_config?: Json
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          calendar_synced: boolean | null
          created_at: string | null
          daily_goal: number | null
          dark_mode: boolean | null
          email: string
          id: string
          learning_preferences: Json | null
          name: string
          preferred_language: string | null
          reminder_time: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          calendar_synced?: boolean | null
          created_at?: string | null
          daily_goal?: number | null
          dark_mode?: boolean | null
          email: string
          id?: string
          learning_preferences?: Json | null
          name: string
          preferred_language?: string | null
          reminder_time?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          calendar_synced?: boolean | null
          created_at?: string | null
          daily_goal?: number | null
          dark_mode?: boolean | null
          email?: string
          id?: string
          learning_preferences?: Json | null
          name?: string
          preferred_language?: string | null
          reminder_time?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_admin_action: {
        Args: {
          p_action: string
          p_resource: string
          p_details?: Json
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
