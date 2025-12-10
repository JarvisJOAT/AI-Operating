/**
 * Database Type Definitions
 * 
 * Auto-generated types for Supabase database schema.
 * These types provide type safety for database operations.
 * 
 * @module lib/database.types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // =============================================
      // COURSES
      // =============================================
      courses: {
        Row: {
          id: string
          organization_id: string | null
          title: string
          slug: string | null
          description: string | null
          short_description: string | null
          thumbnail_url: string | null
          preview_video_url: string | null
          category: string
          tags: string[]
          level: 'beginner' | 'intermediate' | 'advanced'
          price_type: 'free' | 'one_time' | 'subscription'
          price: number
          currency: string
          subscription_interval: 'monthly' | 'yearly' | 'weekly' | null
          duration_minutes: number | null
          lessons_count: number
          has_video: boolean
          has_pdf: boolean
          has_interactive: boolean
          status: 'draft' | 'published' | 'archived'
          is_featured: boolean
          requires_account: boolean
          enrollment_count: number
          average_rating: number
          rating_count: number
          instructor_name: string | null
          instructor_bio: string | null
          instructor_avatar_url: string | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          organization_id?: string | null
          title: string
          slug?: string | null
          description?: string | null
          short_description?: string | null
          thumbnail_url?: string | null
          preview_video_url?: string | null
          category: string
          tags?: string[]
          level?: 'beginner' | 'intermediate' | 'advanced'
          price_type: 'free' | 'one_time' | 'subscription'
          price?: number
          currency?: string
          subscription_interval?: 'monthly' | 'yearly' | 'weekly' | null
          duration_minutes?: number | null
          lessons_count?: number
          has_video?: boolean
          has_pdf?: boolean
          has_interactive?: boolean
          status?: 'draft' | 'published' | 'archived'
          is_featured?: boolean
          requires_account?: boolean
          enrollment_count?: number
          average_rating?: number
          rating_count?: number
          instructor_name?: string | null
          instructor_bio?: string | null
          instructor_avatar_url?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string | null
          title?: string
          slug?: string | null
          description?: string | null
          short_description?: string | null
          thumbnail_url?: string | null
          preview_video_url?: string | null
          category?: string
          tags?: string[]
          level?: 'beginner' | 'intermediate' | 'advanced'
          price_type?: 'free' | 'one_time' | 'subscription'
          price?: number
          currency?: string
          subscription_interval?: 'monthly' | 'yearly' | 'weekly' | null
          duration_minutes?: number | null
          lessons_count?: number
          has_video?: boolean
          has_pdf?: boolean
          has_interactive?: boolean
          status?: 'draft' | 'published' | 'archived'
          is_featured?: boolean
          requires_account?: boolean
          enrollment_count?: number
          average_rating?: number
          rating_count?: number
          instructor_name?: string | null
          instructor_bio?: string | null
          instructor_avatar_url?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      
      course_content: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          content_type: 'video' | 'pdf' | 'text' | 'quiz' | 'interactive' | 'resource'
          content_url: string | null
          content_body: string | null
          duration_minutes: number | null
          file_size_bytes: number | null
          module_name: string | null
          order_index: number
          is_preview: boolean
          is_downloadable: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          content_type: 'video' | 'pdf' | 'text' | 'quiz' | 'interactive' | 'resource'
          content_url?: string | null
          content_body?: string | null
          duration_minutes?: number | null
          file_size_bytes?: number | null
          module_name?: string | null
          order_index?: number
          is_preview?: boolean
          is_downloadable?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          content_type?: 'video' | 'pdf' | 'text' | 'quiz' | 'interactive' | 'resource'
          content_url?: string | null
          content_body?: string | null
          duration_minutes?: number | null
          file_size_bytes?: number | null
          module_name?: string | null
          order_index?: number
          is_preview?: boolean
          is_downloadable?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      
      course_enrollments: {
        Row: {
          id: string
          course_id: string
          user_id: string | null
          user_email: string | null
          enrollment_type: 'free' | 'purchased' | 'subscription' | 'gifted' | 'promotional'
          progress: Json
          is_completed: boolean
          completed_at: string | null
          certificate_issued: boolean
          certificate_url: string | null
          enrolled_at: string
          last_accessed_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id?: string | null
          user_email?: string | null
          enrollment_type: 'free' | 'purchased' | 'subscription' | 'gifted' | 'promotional'
          progress?: Json
          is_completed?: boolean
          completed_at?: string | null
          certificate_issued?: boolean
          certificate_url?: string | null
          enrolled_at?: string
          last_accessed_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string | null
          user_email?: string | null
          enrollment_type?: 'free' | 'purchased' | 'subscription' | 'gifted' | 'promotional'
          progress?: Json
          is_completed?: boolean
          completed_at?: string | null
          certificate_issued?: boolean
          certificate_url?: string | null
          enrolled_at?: string
          last_accessed_at?: string
        }
      }
      
      course_purchases: {
        Row: {
          id: string
          course_id: string
          enrollment_id: string | null
          user_id: string | null
          user_email: string
          payment_method: 'stripe' | 'paypal' | 'crypto' | 'manual' | 'promotional'
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed'
          amount_paid: number
          currency: string
          transaction_id: string | null
          payment_intent_id: string | null
          is_subscription: boolean
          subscription_id: string | null
          subscription_status: 'active' | 'cancelled' | 'past_due' | 'trialing' | null
          subscription_expires_at: string | null
          is_refunded: boolean
          refunded_at: string | null
          refund_amount: number | null
          refund_reason: string | null
          coupon_code: string | null
          discount_amount: number
          metadata: Json
          purchased_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          enrollment_id?: string | null
          user_id?: string | null
          user_email: string
          payment_method: 'stripe' | 'paypal' | 'crypto' | 'manual' | 'promotional'
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed'
          amount_paid: number
          currency?: string
          transaction_id?: string | null
          payment_intent_id?: string | null
          is_subscription?: boolean
          subscription_id?: string | null
          subscription_status?: 'active' | 'cancelled' | 'past_due' | 'trialing' | null
          subscription_expires_at?: string | null
          is_refunded?: boolean
          refunded_at?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          coupon_code?: string | null
          discount_amount?: number
          metadata?: Json
          purchased_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          enrollment_id?: string | null
          user_id?: string | null
          user_email?: string
          payment_method?: 'stripe' | 'paypal' | 'crypto' | 'manual' | 'promotional'
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed'
          amount_paid?: number
          currency?: string
          transaction_id?: string | null
          payment_intent_id?: string | null
          is_subscription?: boolean
          subscription_id?: string | null
          subscription_status?: 'active' | 'cancelled' | 'past_due' | 'trialing' | null
          subscription_expires_at?: string | null
          is_refunded?: boolean
          refunded_at?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          coupon_code?: string | null
          discount_amount?: number
          metadata?: Json
          purchased_at?: string
          updated_at?: string
        }
      }
      
      // =============================================
      // LANDING PAGES
      // =============================================
      landing_pages: {
        Row: {
          id: string
          organization_id: string
          slug: string | null
          title: string
          description: string | null
          logo_url: string | null
          background_image_url: string | null
          background_color: string
          accent_color: string
          theme_settings: Json
          is_active: boolean
          is_public: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          slug?: string | null
          title: string
          description?: string | null
          logo_url?: string | null
          background_image_url?: string | null
          background_color?: string
          accent_color?: string
          theme_settings?: Json
          is_active?: boolean
          is_public?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          slug?: string | null
          title?: string
          description?: string | null
          logo_url?: string | null
          background_image_url?: string | null
          background_color?: string
          accent_color?: string
          theme_settings?: Json
          is_active?: boolean
          is_public?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      
      landing_page_links: {
        Row: {
          id: string
          landing_page_id: string
          title: string
          url: string
          description: string | null
          icon: string | null
          icon_type: 'lucide' | 'url' | 'emoji'
          link_type: 'website' | 'social' | 'custom' | 'email' | 'phone'
          category: string | null
          is_featured: boolean
          is_active: boolean
          order_index: number
          custom_style: Json
          click_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          landing_page_id: string
          title: string
          url: string
          description?: string | null
          icon?: string | null
          icon_type?: 'lucide' | 'url' | 'emoji'
          link_type?: 'website' | 'social' | 'custom' | 'email' | 'phone'
          category?: string | null
          is_featured?: boolean
          is_active?: boolean
          order_index?: number
          custom_style?: Json
          click_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          landing_page_id?: string
          title?: string
          url?: string
          description?: string | null
          icon?: string | null
          icon_type?: 'lucide' | 'url' | 'emoji'
          link_type?: 'website' | 'social' | 'custom' | 'email' | 'phone'
          category?: string | null
          is_featured?: boolean
          is_active?: boolean
          order_index?: number
          custom_style?: Json
          click_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      
      landing_page_videos: {
        Row: {
          id: string
          landing_page_id: string
          title: string
          description: string | null
          video_url: string
          thumbnail_url: string | null
          video_type: 'youtube' | 'vimeo' | 'hosted' | 'embed'
          is_featured: boolean
          is_active: boolean
          order_index: number
          duration_seconds: number | null
          play_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          landing_page_id: string
          title: string
          description?: string | null
          video_url: string
          thumbnail_url?: string | null
          video_type?: 'youtube' | 'vimeo' | 'hosted' | 'embed'
          is_featured?: boolean
          is_active?: boolean
          order_index?: number
          duration_seconds?: number | null
          play_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          landing_page_id?: string
          title?: string
          description?: string | null
          video_url?: string
          thumbnail_url?: string | null
          video_type?: 'youtube' | 'vimeo' | 'hosted' | 'embed'
          is_featured?: boolean
          is_active?: boolean
          order_index?: number
          duration_seconds?: number | null
          play_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      
      landing_page_analytics: {
        Row: {
          id: string
          landing_page_id: string
          event_type: 'page_view' | 'link_click' | 'video_play' | 'video_complete' | 'social_click'
          link_id: string | null
          video_id: string | null
          visitor_id: string | null
          referrer: string | null
          user_agent: string | null
          country_code: string | null
          device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null
          metadata: Json
          timestamp: string
        }
        Insert: {
          id?: string
          landing_page_id: string
          event_type: 'page_view' | 'link_click' | 'video_play' | 'video_complete' | 'social_click'
          link_id?: string | null
          video_id?: string | null
          visitor_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          country_code?: string | null
          device_type?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null
          metadata?: Json
          timestamp?: string
        }
        Update: {
          id?: string
          landing_page_id?: string
          event_type?: 'page_view' | 'link_click' | 'video_play' | 'video_complete' | 'social_click'
          link_id?: string | null
          video_id?: string | null
          visitor_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          country_code?: string | null
          device_type?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null
          metadata?: Json
          timestamp?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_link_click: {
        Args: { p_link_id: string }
        Returns: void
      }
      increment_video_play: {
        Args: { p_video_id: string }
        Returns: void
      }
      increment_page_view: {
        Args: { p_page_id: string }
        Returns: void
      }
      update_course_stats: {
        Args: { p_course_id: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

