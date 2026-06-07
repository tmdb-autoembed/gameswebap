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
      assets: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          folder: string | null
          id: string
          thumb_url: string | null
          user_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          folder?: string | null
          id?: string
          thumb_url?: string | null
          user_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          folder?: string | null
          id?: string
          thumb_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          icon: string | null
          id: string
          kind: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          icon?: string | null
          id?: string
          kind: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          icon?: string | null
          id?: string
          kind?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_id: string
          comments_count: number
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          feeling: string | null
          game_id: string | null
          id: string
          images: Json | null
          is_pinned: boolean
          likes: number
          links: Json | null
          location: string | null
          reactions: Json | null
          shares: number
          slug: string | null
          status: string
          title: string | null
          type: string
          updated_at: string
          views: number
          visibility: string
        }
        Insert: {
          author_id: string
          comments_count?: number
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          feeling?: string | null
          game_id?: string | null
          id?: string
          images?: Json | null
          is_pinned?: boolean
          likes?: number
          links?: Json | null
          location?: string | null
          reactions?: Json | null
          shares?: number
          slug?: string | null
          status?: string
          title?: string | null
          type?: string
          updated_at?: string
          views?: number
          visibility?: string
        }
        Update: {
          author_id?: string
          comments_count?: number
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          feeling?: string | null
          game_id?: string | null
          id?: string
          images?: Json | null
          is_pinned?: boolean
          likes?: number
          links?: Json | null
          location?: string | null
          reactions?: Json | null
          shares?: number
          slug?: string | null
          status?: string
          title?: string | null
          type?: string
          updated_at?: string
          views?: number
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          cover: string | null
          display_name: string | null
          followers: number
          following: number
          id: string
          joined_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          cover?: string | null
          display_name?: string | null
          followers?: number
          following?: number
          id?: string
          joined_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          cover?: string | null
          display_name?: string | null
          followers?: number
          following?: number
          id?: string
          joined_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      game_categories: {
        Row: {
          category_id: string
          post_id: string
        }
        Insert: {
          category_id: string
          post_id: string
        }
        Update: {
          category_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      game_requests: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: string
          title: string
          user_id: string | null
          votes: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title: string
          user_id?: string | null
          votes?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title?: string
          user_id?: string | null
          votes?: number
        }
        Relationships: []
      }
      game_screenshots: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          post_id: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          post_id: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          post_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_screenshots_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          color: string
          enabled: boolean
          href: string
          icon: string
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          color?: string
          enabled?: boolean
          href: string
          icon?: string
          id?: string
          label: string
          sort_order?: number
        }
        Update: {
          color?: string
          enabled?: boolean
          href?: string
          icon?: string
          id?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          target_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          target_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          target_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      poll_options: {
        Row: {
          id: string
          option_text: string
          poll_id: string
          sort_order: number
          votes: number
        }
        Insert: {
          id?: string
          option_text: string
          poll_id: string
          sort_order?: number
          votes?: number
        }
        Update: {
          id?: string
          option_text?: string
          poll_id?: string
          sort_order?: number
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          poll_option_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_option_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_option_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_option_id_fkey"
            columns: ["poll_option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          community_post_id: string
          id: string
          question: string
        }
        Insert: {
          community_post_id: string
          id?: string
          question: string
        }
        Update: {
          community_post_id?: string
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_community_post_id_fkey"
            columns: ["community_post_id"]
            isOneToOne: true
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_id: string
          community_post_id: string
          content: string
          created_at: string
          id: string
          likes: number
          parent_id: string | null
        }
        Insert: {
          author_id: string
          community_post_id: string
          content: string
          created_at?: string
          id?: string
          likes?: number
          parent_id?: string | null
        }
        Update: {
          author_id?: string
          community_post_id?: string
          content?: string
          created_at?: string
          id?: string
          likes?: number
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_community_post_id_fkey"
            columns: ["community_post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          community_post_id: string
          created_at: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          community_post_id: string
          created_at?: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          community_post_id?: string
          created_at?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_community_post_id_fkey"
            columns: ["community_post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          backdrop_url: string | null
          banner_image: string | null
          category_id: string | null
          content_type: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          developer: string | null
          discord_url: string | null
          dislikes: number | null
          download_count: number | null
          download_links: Json | null
          download_url: string | null
          file_size: string | null
          genres: string[]
          genres_text: string | null
          id: string
          important_notes: string | null
          installation_guide: string | null
          is_featured: boolean | null
          is_latest: boolean | null
          kind: string
          likes: number | null
          platform: string | null
          product_subtitle: string | null
          published_text: string | null
          publisher: string | null
          ram_required: string | null
          rating: number | null
          raw_html: string | null
          recommend_percent: number | null
          requirements: Json
          reviews: number | null
          size: string | null
          slug: string
          source_url: string | null
          status: string
          subtitle: string | null
          system_requirements: Json | null
          title: string
          updated_at: string
          version: string | null
          year: number | null
        }
        Insert: {
          backdrop_url?: string | null
          banner_image?: string | null
          category_id?: string | null
          content_type?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          developer?: string | null
          discord_url?: string | null
          dislikes?: number | null
          download_count?: number | null
          download_links?: Json | null
          download_url?: string | null
          file_size?: string | null
          genres?: string[]
          genres_text?: string | null
          id?: string
          important_notes?: string | null
          installation_guide?: string | null
          is_featured?: boolean | null
          is_latest?: boolean | null
          kind?: string
          likes?: number | null
          platform?: string | null
          product_subtitle?: string | null
          published_text?: string | null
          publisher?: string | null
          ram_required?: string | null
          rating?: number | null
          raw_html?: string | null
          recommend_percent?: number | null
          requirements?: Json
          reviews?: number | null
          size?: string | null
          slug: string
          source_url?: string | null
          status?: string
          subtitle?: string | null
          system_requirements?: Json | null
          title: string
          updated_at?: string
          version?: string | null
          year?: number | null
        }
        Update: {
          backdrop_url?: string | null
          banner_image?: string | null
          category_id?: string | null
          content_type?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          developer?: string | null
          discord_url?: string | null
          dislikes?: number | null
          download_count?: number | null
          download_links?: Json | null
          download_url?: string | null
          file_size?: string | null
          genres?: string[]
          genres_text?: string | null
          id?: string
          important_notes?: string | null
          installation_guide?: string | null
          is_featured?: boolean | null
          is_latest?: boolean | null
          kind?: string
          likes?: number | null
          platform?: string | null
          product_subtitle?: string | null
          published_text?: string | null
          publisher?: string | null
          ram_required?: string | null
          rating?: number | null
          raw_html?: string | null
          recommend_percent?: number | null
          requirements?: Json
          reviews?: number | null
          size?: string | null
          slug?: string
          source_url?: string | null
          status?: string
          subtitle?: string | null
          system_requirements?: Json | null
          title?: string
          updated_at?: string
          version?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          community_post_id: string
          created_at: string
          id: string
          reason: string
          reporter_id: string
          status: string
        }
        Insert: {
          community_post_id: string
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          status?: string
        }
        Update: {
          community_post_id?: string
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_community_post_id_fkey"
            columns: ["community_post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string
          comment: string | null
          created_at: string
          id: string
          post_id: string
          rating: number
          status: string
          user_id: string | null
        }
        Insert: {
          author_name: string
          comment?: string | null
          created_at?: string
          id?: string
          post_id: string
          rating: number
          status?: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          comment?: string | null
          created_at?: string
          id?: string
          post_id?: string
          rating?: number
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          content: string | null
          cover_image: string | null
          created_at: string
          id: string
          is_published: boolean
          slug: string
          template: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          cover_image?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          slug: string
          template?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          cover_image?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          slug?: string
          template?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          author_id: string
          background: string | null
          created_at: string
          expires_at: string
          id: string
          image_url: string | null
          text: string | null
          video_url: string | null
          views: number
        }
        Insert: {
          author_id: string
          background?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string | null
          text?: string | null
          video_url?: string | null
          views?: number
        }
        Update: {
          author_id?: string
          background?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string | null
          text?: string | null
          video_url?: string | null
          views?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      bump_community_counter: {
        Args: { _col: string; _delta: number; _post: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
