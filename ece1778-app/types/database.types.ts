import { NotificationJson } from "./types"

export type Json =
  | string
  | number
  | boolean
  | null
  | string[]
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
      books: {
        Row: {
          authors: string[] | null
          avg_rating: number | null
          cover_image: string | null
          description: string | null
          genres: string[] | null
          id: number
          olid: string | null
          publish_year: string | null
          rating_count: number | null
          title: string
        }
        Insert: {
          authors?: string[] | null
          avg_rating?: number | null
          cover_image?: string | null
          description?: string | null
          genres?: string[] | null
          id?: number
          olid?: string | null
          publish_year?: string | null
          rating_count?: number | null
          title: string
        }
        Update: {
          authors?: string[] | null
          avg_rating?: number | null
          cover_image?: string | null
          description?: string | null
          genres?: string[] | null
          id?: number
          olid?: string | null
          publish_year?: string | null
          rating_count?: number | null
          title?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          id: number
          movie_list: number[] | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: number
          movie_list?: number[] | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: number
          movie_list?: number[] | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          friend_id: string
          id: string
          record_id: number
        }
        Insert: {
          friend_id: string
          id: string
          record_id?: number
        }
        Update: {
          friend_id?: string
          id?: string
          record_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      movies: {
        Row: {
          avg_rating: number | null
          cast_members: string[] | null
          description: string | null
          genres: string[] | null
          id: number
          poster_path: string | null
          rating_count: number | null
          release_date: string | null
          title: string
          tmdb_id: string | null
        }
        Insert: {
          avg_rating?: number | null
          cast_members?: string[] | null
          description?: string | null
          genres?: string[] | null
          id?: number
          poster_path?: string | null
          rating_count?: number | null
          release_date?: string | null
          title: string
          tmdb_id?: string | null
        }
        Update: {
          avg_rating?: number | null
          cast_members?: string[] | null
          description?: string | null
          genres?: string[] | null
          id?: number
          poster_path?: string | null
          rating_count?: number | null
          release_date?: string | null
          title?: string
          tmdb_id?: string | null
        }
        Relationships: []
      }
      notification: {
        Row: {
          body: string | null
          id: number
          user_id: string
        }
        Insert: {
          body?: string | null
          id?: number
          user_id: string[]
        }
        Update: {
          body?: string | null
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string
          friends: number
          full_name: string | null
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          email: string
          friends?: number
          full_name?: string | null
          id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          email?: string
          friends?: number
          full_name?: string | null
          id?: string
          username?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: number
          movie_id?: number
          book_id?: number
          rating: number | null
          review: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: number
          movie_id?: number
          book_id?: number
          rating?: number | null
          review?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: number
          movie_id?: number
          book_id?: number
          rating?: number | null
          review?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_books_id_fkey"
            columns: ["books_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          token: string | null
          user_id: string
        }
        Insert: {
          token?: string | null
          user_id: string
        }
        Update: {
          token?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webpayload: {
        Row: {
          id: number
          old_record: string | null
          record_id: string | null
          table: string
        }
        Insert: {
          id?: number
          old_record?: string | null
          record_id?: string | null
          table: string
        }
        Update: {
          id?: number
          old_record?: string | null
          record_id?: string | null
          table?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
