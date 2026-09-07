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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      obras: {
        Row: {
          created_at: string
          created_by: string
          id: string
          legacy_owner_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          legacy_owner_id?: string | null
          name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          legacy_owner_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      obra_members: {
        Row: {
          added_by: string | null
          created_at: string
          obra_id: string
          user_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          obra_id: string
          user_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          obra_id?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_admins: {
        Row: {
          added_by: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pavimentos: {
        Row: {
          created_at: string
          date: string
          obra_id: string
          id: string
          name: string
          responsible: string
          structural_piece: string
          supplier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          obra_id: string
          id?: string
          name: string
          responsible?: string
          structural_piece?: string
          supplier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          obra_id?: string
          id?: string
          name?: string
          responsible?: string
          structural_piece?: string
          supplier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trucks: {
        Row: {
          achieved_mpa: number
          arrival_date: string | null
          arrival_time: string
          calculist_approval: Database["public"]["Enums"]["calculist_approval"]
          cost_per_m3: number
          created_at: string
          departure_time_from_plant: string
          departure_time_from_site: string
          expected_mpa: number
          id: string
          invoice_number: string
          mpa_28d: number | null
          mpa_7d: number | null
          observation: string
          pavimento_id: string
          percent_diff: number
          predicted_mpa_28d: number | null
          prediction_index: number | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          slump: number
          slump_conformity: boolean
          slump_max: number
          slump_min: number
          status: Database["public"]["Enums"]["truck_status"]
          supplier: string
          unload_end_time: string
          unload_start_time: string
          updated_at: string
          user_id: string
          volume_m3: number
          water_added: number
        }
        Insert: {
          achieved_mpa?: number
          arrival_date?: string | null
          arrival_time?: string
          calculist_approval?: Database["public"]["Enums"]["calculist_approval"]
          cost_per_m3?: number
          created_at?: string
          departure_time_from_plant?: string
          departure_time_from_site?: string
          expected_mpa?: number
          id?: string
          invoice_number?: string
          mpa_28d?: number | null
          mpa_7d?: number | null
          observation?: string
          pavimento_id: string
          percent_diff?: number
          predicted_mpa_28d?: number | null
          prediction_index?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          slump?: number
          slump_conformity?: boolean
          slump_max?: number
          slump_min?: number
          status?: Database["public"]["Enums"]["truck_status"]
          supplier?: string
          unload_end_time?: string
          unload_start_time?: string
          updated_at?: string
          user_id: string
          volume_m3?: number
          water_added?: number
        }
        Update: {
          achieved_mpa?: number
          arrival_date?: string | null
          arrival_time?: string
          calculist_approval?: Database["public"]["Enums"]["calculist_approval"]
          cost_per_m3?: number
          created_at?: string
          departure_time_from_plant?: string
          departure_time_from_site?: string
          expected_mpa?: number
          id?: string
          invoice_number?: string
          mpa_28d?: number | null
          mpa_7d?: number | null
          observation?: string
          pavimento_id?: string
          percent_diff?: number
          predicted_mpa_28d?: number | null
          prediction_index?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          slump?: number
          slump_conformity?: boolean
          slump_max?: number
          slump_min?: number
          status?: Database["public"]["Enums"]["truck_status"]
          supplier?: string
          unload_end_time?: string
          unload_start_time?: string
          updated_at?: string
          user_id?: string
          volume_m3?: number
          water_added?: number
        }
        Relationships: []
      }
      test_specimens: {
        Row: {
          age: Database["public"]["Enums"]["specimen_age"]
          created_at: string
          id: string
          mpa_result: number
          rupture_date: string | null
          truck_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age: Database["public"]["Enums"]["specimen_age"]
          created_at?: string
          id?: string
          mpa_result?: number
          rupture_date?: string | null
          truck_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: Database["public"]["Enums"]["specimen_age"]
          created_at?: string
          id?: string
          mpa_result?: number
          rupture_date?: string | null
          truck_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_id_by_email_for_admin: {
        Args: {
          p_email: string
        }
        Returns: string | null
      }
      is_platform_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      add_obra_member_by_email: {
        Args: {
          p_email: string
          p_obra_id: string
        }
        Returns: string
      }
    }
    Enums: {
      calculist_approval: "approved" | "rejected" | "analyzing"
      risk_level: "low" | "medium" | "high"
      specimen_age: "12h" | "7d" | "28d"
      truck_status: "approved" | "rejected" | "above"
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
      calculist_approval: ["approved", "rejected", "analyzing"],
      risk_level: ["low", "medium", "high"],
      specimen_age: ["12h", "7d", "28d"],
      truck_status: ["approved", "rejected", "above"],
    },
  },
} as const
