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
      admin_bakebook_entries: {
        Row: {
          admin_notes: string | null
          admin_user_id: string
          created_at: string
          development_stage: string | null
          id: string
          is_canon: boolean | null
          is_favorite_base: boolean | null
          recipe_id: string
          refinement_log: Json | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          admin_user_id: string
          created_at?: string
          development_stage?: string | null
          id?: string
          is_canon?: boolean | null
          is_favorite_base?: boolean | null
          recipe_id: string
          refinement_log?: Json | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          admin_user_id?: string
          created_at?: string
          development_stage?: string | null
          id?: string
          is_canon?: boolean | null
          is_favorite_base?: boolean | null
          recipe_id?: string
          refinement_log?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_bakebook_entries_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: true
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_catalog: {
        Row: {
          brand: string | null
          canonical_key: string
          category: string | null
          created_at: string
          description: string | null
          display_order: number | null
          fallback_urls: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          price_estimate: string | null
          primary_url: string
          title: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          canonical_key: string
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          fallback_urls?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_estimate?: string | null
          primary_url: string
          title: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          canonical_key?: string
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          fallback_urls?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_estimate?: string | null
          primary_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_mentions: {
        Row: {
          canonical_key: string | null
          clicked: boolean | null
          clicked_at: string | null
          confidence: number | null
          created_at: string
          id: string
          shown_to_user: boolean | null
          source_id: string | null
          source_type: string
          user_id: string | null
        }
        Insert: {
          canonical_key?: string | null
          clicked?: boolean | null
          clicked_at?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          shown_to_user?: boolean | null
          source_id?: string | null
          source_type: string
          user_id?: string | null
        }
        Update: {
          canonical_key?: string | null
          clicked?: boolean | null
          clicked_at?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          shown_to_user?: boolean | null
          source_id?: string | null
          source_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_mentions_canonical_key_fkey"
            columns: ["canonical_key"]
            isOneToOne: false
            referencedRelation: "affiliate_catalog"
            referencedColumns: ["canonical_key"]
          },
        ]
      }
      bakebook_entries: {
        Row: {
          actual_active_minutes: number | null
          actual_passive_minutes: number | null
          attempt_number: number | null
          bake_time_minutes: number | null
          bakebook_id: string
          folder: string | null
          id: string
          is_archived: boolean | null
          last_made_date: string | null
          learned_tips: string[] | null
          notes: string | null
          pan_size: string | null
          recipe_id: string
          result_feedback: string | null
          saved_at: string
          share_with_admin: boolean | null
          stage_notes: Json | null
          user_modifications: Json | null
          user_rating: number | null
        }
        Insert: {
          actual_active_minutes?: number | null
          actual_passive_minutes?: number | null
          attempt_number?: number | null
          bake_time_minutes?: number | null
          bakebook_id: string
          folder?: string | null
          id?: string
          is_archived?: boolean | null
          last_made_date?: string | null
          learned_tips?: string[] | null
          notes?: string | null
          pan_size?: string | null
          recipe_id: string
          result_feedback?: string | null
          saved_at?: string
          share_with_admin?: boolean | null
          stage_notes?: Json | null
          user_modifications?: Json | null
          user_rating?: number | null
        }
        Update: {
          actual_active_minutes?: number | null
          actual_passive_minutes?: number | null
          attempt_number?: number | null
          bake_time_minutes?: number | null
          bakebook_id?: string
          folder?: string | null
          id?: string
          is_archived?: boolean | null
          last_made_date?: string | null
          learned_tips?: string[] | null
          notes?: string | null
          pan_size?: string | null
          recipe_id?: string
          result_feedback?: string | null
          saved_at?: string
          share_with_admin?: boolean | null
          stage_notes?: Json | null
          user_modifications?: Json | null
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bakebook_entries_bakebook_id_fkey"
            columns: ["bakebook_id"]
            isOneToOne: false
            referencedRelation: "user_bakebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakebook_entries_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      baking_tools: {
        Row: {
          affiliate_link: string | null
          brandia_pick: boolean | null
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
          why_she_loves_it: string | null
        }
        Insert: {
          affiliate_link?: string | null
          brandia_pick?: boolean | null
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
          why_she_loves_it?: string | null
        }
        Update: {
          affiliate_link?: string | null
          brandia_pick?: boolean | null
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
          why_she_loves_it?: string | null
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
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
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
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          message_count: number | null
          session_end: string | null
          session_start: string
          time_spent_seconds: number | null
          topics: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message_count?: number | null
          session_end?: string | null
          session_start?: string
          time_spent_seconds?: number | null
          topics?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message_count?: number | null
          session_end?: string | null
          session_start?: string
          time_spent_seconds?: number | null
          topics?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      coffee_clicks: {
        Row: {
          clicked_at: string
          id: string
          page_path: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          page_path?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          page_path?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      community_insights: {
        Row: {
          confidence_score: number | null
          created_at: string
          data: Json
          id: string
          insight_type: string
          recipe_id: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          data: Json
          id?: string
          insight_type: string
          recipe_id: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          data?: Json
          id?: string
          insight_type?: string
          recipe_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_insights_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
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
      gallery_photo_names: {
        Row: {
          created_at: string
          custom_name: string
          id: string
          photo_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_name: string
          id?: string
          photo_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_name?: string
          id?: string
          photo_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      inspiration_bullets: {
        Row: {
          created_at: string | null
          id: string
          is_approved: boolean | null
          source_id: string | null
          tags: string[] | null
          text: string
          tier: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          source_id?: string | null
          tags?: string[] | null
          text: string
          tier: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          source_id?: string | null
          tags?: string[] | null
          text?: string
          tier?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspiration_bullets_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "inspiration_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      inspiration_sources: {
        Row: {
          added_by: string | null
          admin_notes: string | null
          approved: boolean | null
          content_type: string | null
          created_at: string | null
          id: string
          takeaways: Json | null
          title: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          added_by?: string | null
          admin_notes?: string | null
          approved?: boolean | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          takeaways?: Json | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          added_by?: string | null
          admin_notes?: string | null
          approved?: boolean | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          takeaways?: Json | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page_path: string
          page_title: string | null
          referrer: string | null
          time_spent_seconds: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page_path: string
          page_title?: string | null
          referrer?: string | null
          time_spent_seconds?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          time_spent_seconds?: number | null
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
          profile_photo_scale: number | null
          profile_photo_x: number | null
          profile_photo_y: number | null
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
          profile_photo_scale?: number | null
          profile_photo_x?: number | null
          profile_photo_y?: number | null
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
          profile_photo_scale?: number | null
          profile_photo_x?: number | null
          profile_photo_y?: number | null
          story_text?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          continuous_voice_enabled: boolean | null
          created_at: string | null
          email: string | null
          id: string
          is_admin: boolean | null
          is_collaborator: boolean | null
          is_lifetime_patron: boolean | null
          updated_at: string | null
          voice_preference: string | null
        }
        Insert: {
          continuous_voice_enabled?: boolean | null
          created_at?: string | null
          email?: string | null
          id: string
          is_admin?: boolean | null
          is_collaborator?: boolean | null
          is_lifetime_patron?: boolean | null
          updated_at?: string | null
          voice_preference?: string | null
        }
        Update: {
          continuous_voice_enabled?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          is_collaborator?: boolean | null
          is_lifetime_patron?: boolean | null
          updated_at?: string | null
          voice_preference?: string | null
        }
        Relationships: []
      }
      promo_users: {
        Row: {
          display_name: string | null
          expires_at: string | null
          granted_at: string
          id: string
          notes: string | null
          promo_type: string
          user_id: string | null
        }
        Insert: {
          display_name?: string | null
          expires_at?: string | null
          granted_at?: string
          id?: string
          notes?: string | null
          promo_type?: string
          user_id?: string | null
        }
        Update: {
          display_name?: string | null
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
      recipe_versions: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          ingredients: Json | null
          instructions: string | null
          is_current: boolean | null
          notes: string | null
          recipe_id: string | null
          staging_json: Json | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          ingredients?: Json | null
          instructions?: string | null
          is_current?: boolean | null
          notes?: string | null
          recipe_id?: string | null
          staging_json?: Json | null
          version_number: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          ingredients?: Json | null
          instructions?: string | null
          is_current?: boolean | null
          notes?: string | null
          recipe_id?: string | null
          staging_json?: Json | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_versions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          assembly_instructions: string | null
          author_id: string | null
          base_name: string | null
          base_recipe_id: string | null
          brandia_pick: boolean | null
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          featured_position: number | null
          frosting_recipe_id: string | null
          id: string
          image_url: string | null
          ingredients: Json | null
          instructions: string | null
          is_base_recipe: boolean | null
          is_featured: boolean | null
          is_featured_base: boolean | null
          is_gluten_free: boolean | null
          is_public: boolean | null
          make_ahead: boolean | null
          make_ahead_window_days: number | null
          prep_active_minutes: number | null
          prep_passive_minutes: number | null
          recipe_type: Database["public"]["Enums"]["recipe_type"] | null
          recommended_freeze_days: number | null
          staging_json: Json | null
          tags: string[] | null
          thaw_time_hours: number | null
          title: string
          updated_at: string | null
          user_id: string | null
          variant_notes: string | null
          why_she_loves_it: string | null
        }
        Insert: {
          assembly_instructions?: string | null
          author_id?: string | null
          base_name?: string | null
          base_recipe_id?: string | null
          brandia_pick?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          featured_position?: number | null
          frosting_recipe_id?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: string | null
          is_base_recipe?: boolean | null
          is_featured?: boolean | null
          is_featured_base?: boolean | null
          is_gluten_free?: boolean | null
          is_public?: boolean | null
          make_ahead?: boolean | null
          make_ahead_window_days?: number | null
          prep_active_minutes?: number | null
          prep_passive_minutes?: number | null
          recipe_type?: Database["public"]["Enums"]["recipe_type"] | null
          recommended_freeze_days?: number | null
          staging_json?: Json | null
          tags?: string[] | null
          thaw_time_hours?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          variant_notes?: string | null
          why_she_loves_it?: string | null
        }
        Update: {
          assembly_instructions?: string | null
          author_id?: string | null
          base_name?: string | null
          base_recipe_id?: string | null
          brandia_pick?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          featured_position?: number | null
          frosting_recipe_id?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: string | null
          is_base_recipe?: boolean | null
          is_featured?: boolean | null
          is_featured_base?: boolean | null
          is_gluten_free?: boolean | null
          is_public?: boolean | null
          make_ahead?: boolean | null
          make_ahead_window_days?: number | null
          prep_active_minutes?: number | null
          prep_passive_minutes?: number | null
          recipe_type?: Database["public"]["Enums"]["recipe_type"] | null
          recommended_freeze_days?: number | null
          staging_json?: Json | null
          tags?: string[] | null
          thaw_time_hours?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          variant_notes?: string | null
          why_she_loves_it?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_base_recipe_id_fkey"
            columns: ["base_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_frosting_recipe_id_fkey"
            columns: ["frosting_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      sasha_training_notes: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string
          id: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category: string
          content: string
          created_at?: string
          id?: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          source_url?: string | null
          updated_at?: string
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
      user_bakebooks: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_mutes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          muted_until: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          muted_until: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          muted_until?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          experience_level: string | null
          goal_focus: string | null
          id: string
          onboarding_completed: boolean | null
          persona: string | null
          style_vibe: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          experience_level?: string | null
          goal_focus?: string | null
          id: string
          onboarding_completed?: boolean | null
          persona?: string | null
          style_vibe?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          experience_level?: string | null
          goal_focus?: string | null
          id?: string
          onboarding_completed?: boolean | null
          persona?: string | null
          style_vibe?: string | null
          updated_at?: string | null
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
      user_sessions: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          last_activity: string
          session_end: string | null
          session_start: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          last_activity?: string
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          last_activity?: string
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_wishlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wellness: {
        Row: {
          affiliate_link: string | null
          brandia_pick: boolean | null
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
          why_she_loves_it: string | null
        }
        Insert: {
          affiliate_link?: string | null
          brandia_pick?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
          why_she_loves_it?: string | null
        }
        Update: {
          affiliate_link?: string | null
          brandia_pick?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
          why_she_loves_it?: string | null
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          added_at: string
          affiliate_catalog_id: string | null
          display_order: number | null
          external_product_name: string | null
          external_product_url: string | null
          id: string
          notes: string | null
          priority: string | null
          wishlist_id: string
        }
        Insert: {
          added_at?: string
          affiliate_catalog_id?: string | null
          display_order?: number | null
          external_product_name?: string | null
          external_product_url?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          wishlist_id: string
        }
        Update: {
          added_at?: string
          affiliate_catalog_id?: string | null
          display_order?: number | null
          external_product_name?: string | null
          external_product_url?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_affiliate_catalog_id_fkey"
            columns: ["affiliate_catalog_id"]
            isOneToOne: false
            referencedRelation: "affiliate_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "user_wishlists"
            referencedColumns: ["id"]
          },
        ]
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
      get_user_activity_summary: {
        Args: { target_user_id: string }
        Returns: Json
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
      set_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "collaborator" | "paid" | "free"
      recipe_type: "complete" | "base_cake" | "frosting" | "variant"
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
      recipe_type: ["complete", "base_cake", "frosting", "variant"],
    },
  },
} as const
