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
      about_photos: {
        Row: {
          caption: string
          created_at: string
          display_order: number
          id: string
          photo_url: string
          updated_at: string
        }
        Insert: {
          caption: string
          created_at?: string
          display_order?: number
          id?: string
          photo_url: string
          updated_at?: string
        }
        Update: {
          caption?: string
          created_at?: string
          display_order?: number
          id?: string
          photo_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      baking_tools: {
        Row: {
          affiliate_link: string | null
          brandia_take: string | null
          category: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          name: string
          price_range: string | null
          updated_at: string | null
        }
        Insert: {
          affiliate_link?: string | null
          brandia_take?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name: string
          price_range?: string | null
          updated_at?: string | null
        }
        Update: {
          affiliate_link?: string | null
          brandia_take?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name?: string
          price_range?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          display_order: number | null
          excerpt: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          published_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          display_order?: number | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          display_order?: number | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      favorite_bakers: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          instagram_handle: string | null
          is_featured: boolean | null
          name: string
          profile_image_url: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          instagram_handle?: string | null
          is_featured?: boolean | null
          name: string
          profile_image_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          instagram_handle?: string | null
          is_featured?: boolean | null
          name?: string
          profile_image_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profile_settings: {
        Row: {
          bio_text: string | null
          created_at: string | null
          hero_box_padding: number | null
          hero_box_padding_top: number | null
          hero_text: string | null
          id: string
          logo_size: number | null
          logo_top: number | null
          logo_x_desktop: number | null
          logo_x_mobile: number | null
          profile_image_url: string | null
          story_text: string | null
          updated_at: string | null
        }
        Insert: {
          bio_text?: string | null
          created_at?: string | null
          hero_box_padding?: number | null
          hero_box_padding_top?: number | null
          hero_text?: string | null
          id?: string
          logo_size?: number | null
          logo_top?: number | null
          logo_x_desktop?: number | null
          logo_x_mobile?: number | null
          profile_image_url?: string | null
          story_text?: string | null
          updated_at?: string | null
        }
        Update: {
          bio_text?: string | null
          created_at?: string | null
          hero_box_padding?: number | null
          hero_box_padding_top?: number | null
          hero_text?: string | null
          id?: string
          logo_size?: number | null
          logo_top?: number | null
          logo_x_desktop?: number | null
          logo_x_mobile?: number | null
          profile_image_url?: string | null
          story_text?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_admin: boolean | null
          is_collaborator: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          is_admin?: boolean | null
          is_collaborator?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          is_collaborator?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promo_users: {
        Row: {
          expires_at: string | null
          granted_at: string
          id: string
          notes: string | null
          promo_type: string
          user_id: string | null
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          id?: string
          notes?: string | null
          promo_type?: string
          user_id?: string | null
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          id?: string
          notes?: string | null
          promo_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      recipe_photos: {
        Row: {
          created_at: string
          id: string
          is_headline: boolean
          photo_url: string
          recipe_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_headline?: boolean
          photo_url: string
          recipe_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_headline?: boolean
          photo_url?: string
          recipe_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_photos_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ratings: {
        Row: {
          admin_reviewed: boolean
          created_at: string
          id: string
          is_approved: boolean
          rating: number
          recipe_id: string
          review_text: string
          updated_at: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          admin_reviewed?: boolean
          created_at?: string
          id?: string
          is_approved?: boolean
          rating: number
          recipe_id: string
          review_text: string
          updated_at?: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          admin_reviewed?: boolean
          created_at?: string
          id?: string
          is_approved?: boolean
          rating?: number
          recipe_id?: string
          review_text?: string
          updated_at?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ratings_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_tools: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_essential: boolean | null
          recipe_id: string
          tool_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_essential?: boolean | null
          recipe_id: string
          tool_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_essential?: boolean | null
          recipe_id?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tools_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "baking_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          author_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          featured_position: number | null
          id: string
          image_url: string | null
          ingredients: Json | null
          instructions: string | null
          is_featured: boolean | null
          is_gluten_free: boolean | null
          is_public: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          featured_position?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: string | null
          is_featured?: boolean | null
          is_gluten_free?: boolean | null
          is_public?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          featured_position?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: string | null
          is_featured?: boolean | null
          is_gluten_free?: boolean | null
          is_public?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      session_notes: {
        Row: {
          created_at: string
          id: string
          message: string
          role: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          role: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          role?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "tip_jar_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      support_clicks: {
        Row: {
          clicked_at: string
          id: string
          recipe_id: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          recipe_id?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          recipe_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_clicks_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      support_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          support_message: string | null
          thank_you_count: number
          updated_at: string
          venmo_display_name: string | null
          venmo_username: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          support_message?: string | null
          thank_you_count?: number
          updated_at?: string
          venmo_display_name?: string | null
          venmo_username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          support_message?: string | null
          thank_you_count?: number
          updated_at?: string
          venmo_display_name?: string | null
          venmo_username?: string | null
        }
        Relationships: []
      }
      temporary_access: {
        Row: {
          access_type: string
          created_at: string | null
          expires_at: string
          id: string
          payment_id: string | null
          user_id: string
        }
        Insert: {
          access_type?: string
          created_at?: string | null
          expires_at: string
          id?: string
          payment_id?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          payment_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tip_jar_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          payment_id: string | null
          session_duration_minutes: number
          session_start: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          payment_id?: string | null
          session_duration_minutes?: number
          session_start?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          payment_id?: string | null
          session_duration_minutes?: number
          session_start?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tool_clicks: {
        Row: {
          clicked_at: string | null
          id: string
          referrer_page: string | null
          tool_id: string
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          referrer_page?: string | null
          tool_id: string
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          id?: string
          referrer_page?: string | null
          tool_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_clicks_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "baking_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      get_recipe_rating_stats: {
        Args: { recipe_uuid: string }
        Returns: {
          average_rating: number
          five_star: number
          four_star: number
          one_star: number
          three_star: number
          total_ratings: number
          two_star: number
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_thank_you_count: { Args: never; Returns: undefined }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "collaborator" | "paid" | "free"
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
      app_role: ["admin", "collaborator", "paid", "free"],
    },
  },
} as const
