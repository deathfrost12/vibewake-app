// Generic database types for universal mobile app template
// Includes basic auth and common app structures

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // User profiles (extends Supabase auth.users)
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          username: string | null;
          bio: string | null;
          website: string | null;
          location: string | null;
          plan: 'free' | 'premium';
          is_active: boolean;
          preferences: Json | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          username?: string | null;
          bio?: string | null;
          website?: string | null;
          location?: string | null;
          plan?: 'free' | 'premium';
          is_active?: boolean;
          preferences?: Json | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          username?: string | null;
          bio?: string | null;
          website?: string | null;
          location?: string | null;
          plan?: 'free' | 'premium';
          is_active?: boolean;
          preferences?: Json | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Generic posts/content
      posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          excerpt: string | null;
          status: 'draft' | 'published' | 'archived';
          category_id: string | null;
          author_id: string;
          featured_image: string | null;
          tags: string[] | null;
          metadata: Json | null;
          view_count: number;
          like_count: number;
          share_count: number;
          is_featured: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          excerpt?: string | null;
          status?: 'draft' | 'published' | 'archived';
          category_id?: string | null;
          author_id: string;
          featured_image?: string | null;
          tags?: string[] | null;
          metadata?: Json | null;
          view_count?: number;
          like_count?: number;
          share_count?: number;
          is_featured?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          excerpt?: string | null;
          status?: 'draft' | 'published' | 'archived';
          category_id?: string | null;
          author_id?: string;
          featured_image?: string | null;
          tags?: string[] | null;
          metadata?: Json | null;
          view_count?: number;
          like_count?: number;
          share_count?: number;
          is_featured?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Categories for organizing content
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          slug: string;
          icon: string | null;
          color: string | null;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
          post_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          slug: string;
          icon?: string | null;
          color?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          post_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          slug?: string;
          icon?: string | null;
          color?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          post_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // User notifications
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'error';
          data: Json | null;
          is_read: boolean;
          action_url: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          data?: Json | null;
          is_read?: boolean;
          action_url?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          data?: Json | null;
          is_read?: boolean;
          action_url?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
      };

      // User sessions for analytics
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          device_info: Json | null;
          started_at: string;
          ended_at: string | null;
          duration_seconds: number | null;
          actions_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_info?: Json | null;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          actions_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_info?: Json | null;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          actions_count?: number;
          created_at?: string;
        };
      };

      // App settings and configurations
      app_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };

    Views: {
      // View for posts with author information
      posts_with_author: {
        Row: {
          id: string;
          title: string;
          content: string;
          excerpt: string | null;
          status: 'draft' | 'published' | 'archived';
          category_id: string | null;
          category_name: string | null;
          author_id: string;
          author_name: string | null;
          author_avatar: string | null;
          featured_image: string | null;
          tags: string[] | null;
          view_count: number;
          like_count: number;
          share_count: number;
          is_featured: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };

      // View for user statistics
      user_stats: {
        Row: {
          user_id: string;
          total_posts: number;
          published_posts: number;
          draft_posts: number;
          total_views: number;
          total_likes: number;
          total_shares: number;
          last_post_at: string | null;
          created_at: string;
        };
      };
    };

    Functions: {
      // Function to get user by email
      get_user_by_email: {
        Args: {
          email: string;
        };
        Returns: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: 'free' | 'premium';
          created_at: string;
        }[];
      };

      // Function to increment post view count
      increment_post_views: {
        Args: {
          post_id: string;
        };
        Returns: {
          id: string;
          view_count: number;
        };
      };

      // Function to get popular posts
      get_popular_posts: {
        Args: {
          limit_count: number;
        };
        Returns: {
          id: string;
          title: string;
          excerpt: string | null;
          view_count: number;
          like_count: number;
          author_name: string | null;
          category_name: string | null;
          published_at: string | null;
        }[];
      };
    };

    Enums: {
      user_plan: 'free' | 'premium';
      post_status: 'draft' | 'published' | 'archived';
      notification_type: 'info' | 'success' | 'warning' | 'error';
    };
  };
}

// Type helpers for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];

export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert =
  Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate =
  Database['public']['Tables']['categories']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert =
  Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate =
  Database['public']['Tables']['notifications']['Update'];

export type UserSession = Database['public']['Tables']['user_sessions']['Row'];
export type UserSessionInsert =
  Database['public']['Tables']['user_sessions']['Insert'];
export type UserSessionUpdate =
  Database['public']['Tables']['user_sessions']['Update'];

export type AppSetting = Database['public']['Tables']['app_settings']['Row'];
export type AppSettingInsert =
  Database['public']['Tables']['app_settings']['Insert'];
export type AppSettingUpdate =
  Database['public']['Tables']['app_settings']['Update'];

// View types
export type PostWithAuthor =
  Database['public']['Views']['posts_with_author']['Row'];
export type UserStats = Database['public']['Views']['user_stats']['Row'];

// Common filter types
export type PostStatus = Database['public']['Enums']['post_status'];
export type UserPlan = Database['public']['Enums']['user_plan'];
export type NotificationType = Database['public']['Enums']['notification_type'];
