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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          content: string
          created_at: string
          id: string
          metadata: Json | null
          read_at: string | null
          signal_id: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: string
          user_id: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read_at?: string | null
          signal_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          type: string
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read_at?: string | null
          signal_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sectors: {
        Row: {
          aggregate_score: number | null
          constituent_count: number | null
          created_at: string
          id: string
          market_cap: number | null
          metadata: Json | null
          name: string
          performance_1d: number | null
          performance_1m: number | null
          performance_1w: number | null
          trend: string | null
          updated_at: string
        }
        Insert: {
          aggregate_score?: number | null
          constituent_count?: number | null
          created_at?: string
          id?: string
          market_cap?: number | null
          metadata?: Json | null
          name: string
          performance_1d?: number | null
          performance_1m?: number | null
          performance_1w?: number | null
          trend?: string | null
          updated_at?: string
        }
        Update: {
          aggregate_score?: number | null
          constituent_count?: number | null
          created_at?: string
          id?: string
          market_cap?: number | null
          metadata?: Json | null
          name?: string
          performance_1d?: number | null
          performance_1m?: number | null
          performance_1w?: number | null
          trend?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      signal_performance: {
        Row: {
          actual_direction: string | null
          confidence_at_entry: number
          created_at: string
          entry_price: number
          entry_time: string
          exit_price: number | null
          exit_time: string | null
          id: string
          metadata: Json | null
          predicted_direction: string | null
          return_percent: number | null
          signal_id: string
          symbol: string
          timeframe: string
          user_id: string | null
          was_accurate: boolean | null
        }
        Insert: {
          actual_direction?: string | null
          confidence_at_entry: number
          created_at?: string
          entry_price: number
          entry_time: string
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          metadata?: Json | null
          predicted_direction?: string | null
          return_percent?: number | null
          signal_id: string
          symbol: string
          timeframe: string
          user_id?: string | null
          was_accurate?: boolean | null
        }
        Update: {
          actual_direction?: string | null
          confidence_at_entry?: number
          created_at?: string
          entry_price?: number
          entry_time?: string
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          metadata?: Json | null
          predicted_direction?: string | null
          return_percent?: number | null
          signal_id?: string
          symbol?: string
          timeframe?: string
          user_id?: string | null
          was_accurate?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "signal_performance_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      signals: {
        Row: {
          company_name: string
          confidence: number
          created_at: string
          current_price: number
          id: string
          is_active: boolean | null
          metadata: Json | null
          price_change: number
          price_change_percent: number
          rank: Database["public"]["Enums"]["signal_rank"]
          sector: string
          sentiment: string | null
          sentiment_score: number | null
          signal_reasons: Json | null
          symbol: string
          technical_indicators: Json | null
          timeframe: string | null
          updated_at: string
          volume: number
          volume_change_percent: number | null
        }
        Insert: {
          company_name: string
          confidence: number
          created_at?: string
          current_price: number
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          price_change: number
          price_change_percent: number
          rank: Database["public"]["Enums"]["signal_rank"]
          sector: string
          sentiment?: string | null
          sentiment_score?: number | null
          signal_reasons?: Json | null
          symbol: string
          technical_indicators?: Json | null
          timeframe?: string | null
          updated_at?: string
          volume: number
          volume_change_percent?: number | null
        }
        Update: {
          company_name?: string
          confidence?: number
          created_at?: string
          current_price?: number
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          price_change?: number
          price_change_percent?: number
          rank?: Database["public"]["Enums"]["signal_rank"]
          sector?: string
          sentiment?: string | null
          sentiment_score?: number | null
          signal_reasons?: Json | null
          symbol?: string
          technical_indicators?: Json | null
          timeframe?: string | null
          updated_at?: string
          volume?: number
          volume_change_percent?: number | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          alert_settings: Json | null
          api_key: string | null
          created_at: string
          display_settings: Json | null
          id: string
          notification_channels: Json | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          alert_settings?: Json | null
          api_key?: string | null
          created_at?: string
          display_settings?: Json | null
          id?: string
          notification_channels?: Json | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          alert_settings?: Json | null
          api_key?: string | null
          created_at?: string
          display_settings?: Json | null
          id?: string
          notification_channels?: Json | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watchlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          sort_order: number | null
          symbols: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          sort_order?: number | null
          symbols?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          sort_order?: number | null
          symbols?: string[] | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "retail_trader" | "power_user" | "admin"
      notification_channel:
        | "system"
        | "telegram"
        | "discord"
        | "whatsapp"
        | "email"
        | "push"
      notification_status: "unread" | "read" | "archived"
      signal_rank: "top" | "medium" | "low"
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
      app_role: ["retail_trader", "power_user", "admin"],
      notification_channel: [
        "system",
        "telegram",
        "discord",
        "whatsapp",
        "email",
        "push",
      ],
      notification_status: ["unread", "read", "archived"],
      signal_rank: ["top", "medium", "low"],
    },
  },
} as const
