export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          confidence_score: number | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          insight_type: string
          is_archived: boolean
          query_text: string
          response_data: Json
          source_urls: string[] | null
          tags: string[] | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          insight_type: string
          is_archived?: boolean
          query_text: string
          response_data: Json
          source_urls?: string[] | null
          tags?: string[] | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_archived?: boolean
          query_text?: string
          response_data?: Json
          source_urls?: string[] | null
          tags?: string[] | null
        }
        Relationships: []
      }
      analytics: {
        Row: {
          collaboration: Json | null
          created_at: string
          cultural_data: Json | null
          id: string
          interactions: Json | null
          is_before_unload: boolean | null
          location: Json | null
          session_id: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
          viewport: Json | null
        }
        Insert: {
          collaboration?: Json | null
          created_at?: string
          cultural_data?: Json | null
          id?: string
          interactions?: Json | null
          is_before_unload?: boolean | null
          location?: Json | null
          session_id: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
          viewport?: Json | null
        }
        Update: {
          collaboration?: Json | null
          created_at?: string
          cultural_data?: Json | null
          id?: string
          interactions?: Json | null
          is_before_unload?: boolean | null
          location?: Json | null
          session_id?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
          viewport?: Json | null
        }
        Relationships: []
      }
      audit_ledger: {
        Row: {
          created_at: string
          hash: string
          id: string
          merkle_root: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          operation: string
          previous_hash: string | null
          record_id: string | null
          sequence_number: number
          table_name: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          hash: string
          id?: string
          merkle_root?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          previous_hash?: string | null
          record_id?: string | null
          sequence_number?: number
          table_name: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          hash?: string
          id?: string
          merkle_root?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          previous_hash?: string | null
          record_id?: string | null
          sequence_number?: number
          table_name?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      automation_jobs: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          description: string | null
          dry_run_enabled: boolean
          id: string
          is_enabled: boolean
          job_type: string
          last_run_at: string | null
          name: string
          next_run_at: string | null
          schedule_cron: string | null
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          dry_run_enabled?: boolean
          id?: string
          is_enabled?: boolean
          job_type: string
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          schedule_cron?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          dry_run_enabled?: boolean
          id?: string
          is_enabled?: boolean
          job_type?: string
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          schedule_cron?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          created_at: string
          created_by: string | null
          execution_id: string
          execution_time_ms: number | null
          id: string
          job_id: string | null
          log_level: string
          message: string
          metadata: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          execution_id?: string
          execution_time_ms?: number | null
          id?: string
          job_id?: string | null
          log_level?: string
          message: string
          metadata?: Json | null
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          execution_id?: string
          execution_time_ms?: number | null
          id?: string
          job_id?: string | null
          log_level?: string
          message?: string
          metadata?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "automation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      business_intelligence: {
        Row: {
          analysis_data: Json
          analysis_type: string
          created_at: string
          created_by: string | null
          id: string
          is_confidential: boolean
          key_findings: string[] | null
          priority_level: string | null
          recommendations: string[] | null
          target_entity: string
          updated_at: string
        }
        Insert: {
          analysis_data: Json
          analysis_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_confidential?: boolean
          key_findings?: string[] | null
          priority_level?: string | null
          recommendations?: string[] | null
          target_entity: string
          updated_at?: string
        }
        Update: {
          analysis_data?: Json
          analysis_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_confidential?: boolean
          key_findings?: string[] | null
          priority_level?: string | null
          recommendations?: string[] | null
          target_entity?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gmail_metadata: {
        Row: {
          classification: string | null
          created_at: string
          created_by: string | null
          has_attachments: boolean | null
          id: string
          labels: string[] | null
          lead_score: number | null
          message_id: string
          metadata: Json | null
          processed_at: string
          sender_email: string
          sender_name: string | null
          snippet: string | null
          subject: string | null
          thread_id: string | null
          timestamp: string
        }
        Insert: {
          classification?: string | null
          created_at?: string
          created_by?: string | null
          has_attachments?: boolean | null
          id?: string
          labels?: string[] | null
          lead_score?: number | null
          message_id: string
          metadata?: Json | null
          processed_at?: string
          sender_email: string
          sender_name?: string | null
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          timestamp: string
        }
        Update: {
          classification?: string | null
          created_at?: string
          created_by?: string | null
          has_attachments?: boolean | null
          id?: string
          labels?: string[] | null
          lead_score?: number | null
          message_id?: string
          metadata?: Json | null
          processed_at?: string
          sender_email?: string
          sender_name?: string | null
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          created_at: string
          errors: Json | null
          id: string
          is_before_unload: boolean | null
          navigation: Json | null
          page_load: Json | null
          resources: Json | null
          session_id: string
          timestamp: string
          vitals: Json | null
        }
        Insert: {
          created_at?: string
          errors?: Json | null
          id?: string
          is_before_unload?: boolean | null
          navigation?: Json | null
          page_load?: Json | null
          resources?: Json | null
          session_id: string
          timestamp?: string
          vitals?: Json | null
        }
        Update: {
          created_at?: string
          errors?: Json | null
          id?: string
          is_before_unload?: boolean | null
          navigation?: Json | null
          page_load?: Json | null
          resources?: Json | null
          session_id?: string
          timestamp?: string
          vitals?: Json | null
        }
        Relationships: []
      }
      privacy_consents: {
        Row: {
          consent_details: Json | null
          consent_given: boolean
          consent_type: string
          created_at: string
          expires_at: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_identifier: string
          withdrawn_at: string | null
        }
        Insert: {
          consent_details?: Json | null
          consent_given: boolean
          consent_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_identifier: string
          withdrawn_at?: string | null
        }
        Update: {
          consent_details?: Json | null
          consent_given?: boolean
          consent_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_identifier?: string
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_audit_hash: {
        Args: {
          _new_values: Json
          _old_values: Json
          _operation: string
          _previous_hash: string
          _record_id: string
          _sequence_number: number
          _table_name: string
          _timestamp: string
          _user_id: string
        }
        Returns: string
      }
      has_any_role: {
        Args: { _roles: Database["public"]["Enums"]["app_role"][] }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_first_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      insert_audit_log: {
        Args: {
          _metadata?: Json
          _new_values?: Json
          _old_values?: Json
          _operation: string
          _record_id: string
          _table_name: string
        }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
