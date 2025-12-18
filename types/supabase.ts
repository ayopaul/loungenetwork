// types/supabase.ts
// Database types for Supabase - mirrors the schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      stations: {
        Row: {
          id: string;
          name: string;
          stream_url: string;
        };
        Insert: {
          id: string;
          name: string;
          stream_url: string;
        };
        Update: {
          id?: string;
          name?: string;
          stream_url?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string | null;
          cover_image: string | null;
          published: boolean;
          station_id: string;
          category_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: string | null;
          cover_image?: string | null;
          published?: boolean;
          station_id: string;
          category_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string | null;
          cover_image?: string | null;
          published?: boolean;
          station_id?: string;
          category_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_station_id_fkey";
            columns: ["station_id"];
            referencedRelation: "stations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          visible: boolean;
          station_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          visible: boolean;
          station_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          visible?: boolean;
          station_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_station_id_fkey";
            columns: ["station_id"];
            referencedRelation: "stations";
            referencedColumns: ["id"];
          }
        ];
      };
      oaps: {
        Row: {
          id: string;
          name: string;
          slug: string;
          bio: string;
          photo_url: string;
          shows: string[];
          station_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          bio: string;
          photo_url: string;
          shows: string[];
          station_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          bio?: string;
          photo_url?: string;
          shows?: string[];
          station_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "oaps_station_id_fkey";
            columns: ["station_id"];
            referencedRelation: "stations";
            referencedColumns: ["id"];
          }
        ];
      };
      schedules: {
        Row: {
          id: string;
          show_title: string;
          slug: string;
          start_time: string;
          end_time: string;
          description: string;
          thumbnail_url: string;
          weekday: number;
          station_id: string;
        };
        Insert: {
          id?: string;
          show_title: string;
          slug: string;
          start_time: string;
          end_time: string;
          description: string;
          thumbnail_url: string;
          weekday: number;
          station_id: string;
        };
        Update: {
          id?: string;
          show_title?: string;
          slug?: string;
          start_time?: string;
          end_time?: string;
          description?: string;
          thumbnail_url?: string;
          weekday?: number;
          station_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "schedules_station_id_fkey";
            columns: ["station_id"];
            referencedRelation: "stations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenient type aliases
export type Station = Database['public']['Tables']['stations']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type OAP = Database['public']['Tables']['oaps']['Row'];
export type Schedule = Database['public']['Tables']['schedules']['Row'];

// Insert types
export type StationInsert = Database['public']['Tables']['stations']['Insert'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type OAPInsert = Database['public']['Tables']['oaps']['Insert'];
export type ScheduleInsert = Database['public']['Tables']['schedules']['Insert'];

// Update types
export type StationUpdate = Database['public']['Tables']['stations']['Update'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
export type OAPUpdate = Database['public']['Tables']['oaps']['Update'];
export type ScheduleUpdate = Database['public']['Tables']['schedules']['Update'];

// Types with relations (for API responses matching joined queries)
export type PostWithCategory = Post & {
  categories: Category | null;
};
