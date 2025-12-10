/**
 * Database Type Definitions
 * 
 * TypeScript types for Supabase database tables specific to Keys Open Doors.
 * 
 * @module types/database
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Database schema for Keys Open Doors
 */
export interface Database {
  public: {
    Tables: {
      /**
       * Scraping job records
       */
      scraping_jobs: {
        Row: {
          id: string;
          organization_id: string;
          status: 'pending' | 'running' | 'completed' | 'failed';
          started_at: string | null;
          completed_at: string | null;
          deals_found: number;
          deals_new: number;
          error_message: string | null;
          config: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          status?: 'pending' | 'running' | 'completed' | 'failed';
          started_at?: string | null;
          completed_at?: string | null;
          deals_found?: number;
          deals_new?: number;
          error_message?: string | null;
          config?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          status?: 'pending' | 'running' | 'completed' | 'failed';
          started_at?: string | null;
          completed_at?: string | null;
          deals_found?: number;
          deals_new?: number;
          error_message?: string | null;
          config?: Json;
          created_at?: string;
        };
      };

      /**
       * Scraped deal records
       */
      scraped_deals: {
        Row: {
          id: string;
          organization_id: string;
          job_id: string | null;
          title: string;
          location: string;
          city: string;
          state: string;
          zip_code: string | null;
          price: number;
          arv: number;
          beds: number;
          baths: number;
          sqft: number;
          description: string | null;
          image_urls: string[];
          deal_url: string;
          deal_type: string;
          wholesaler: string | null;
          is_posted: boolean;
          posted_at: string | null;
          is_approved: boolean;
          approved_by: string | null;
          approved_at: string | null;
          scraped_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          job_id?: string | null;
          title: string;
          location: string;
          city: string;
          state: string;
          zip_code?: string | null;
          price: number;
          arv: number;
          beds?: number;
          baths?: number;
          sqft?: number;
          description?: string | null;
          image_urls?: string[];
          deal_url: string;
          deal_type?: string;
          wholesaler?: string | null;
          is_posted?: boolean;
          posted_at?: string | null;
          is_approved?: boolean;
          approved_by?: string | null;
          approved_at?: string | null;
          scraped_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          job_id?: string | null;
          title?: string;
          location?: string;
          city?: string;
          state?: string;
          zip_code?: string | null;
          price?: number;
          arv?: number;
          beds?: number;
          baths?: number;
          sqft?: number;
          description?: string | null;
          image_urls?: string[];
          deal_url?: string;
          deal_type?: string;
          wholesaler?: string | null;
          is_posted?: boolean;
          posted_at?: string | null;
          is_approved?: boolean;
          approved_by?: string | null;
          approved_at?: string | null;
          scraped_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      /**
       * Instagram post records
       */
      instagram_posts: {
        Row: {
          id: string;
          organization_id: string;
          deal_id: string;
          post_id: string;
          post_type: 'image' | 'carousel' | 'story';
          caption: string;
          image_urls: string[];
          status: 'scheduled' | 'posted' | 'failed';
          posted_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          deal_id: string;
          post_id?: string;
          post_type?: 'image' | 'carousel' | 'story';
          caption: string;
          image_urls?: string[];
          status?: 'scheduled' | 'posted' | 'failed';
          posted_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          deal_id?: string;
          post_id?: string;
          post_type?: 'image' | 'carousel' | 'story';
          caption?: string;
          image_urls?: string[];
          status?: 'scheduled' | 'posted' | 'failed';
          posted_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
      };

      /**
       * Post analytics/engagement data
       */
      post_analytics: {
        Row: {
          id: string;
          post_id: string;
          likes: number;
          comments: number;
          shares: number;
          saves: number;
          reach: number;
          impressions: number;
          engagement_rate: number;
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          likes?: number;
          comments?: number;
          shares?: number;
          saves?: number;
          reach?: number;
          impressions?: number;
          engagement_rate?: number;
          recorded_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          likes?: number;
          comments?: number;
          shares?: number;
          saves?: number;
          reach?: number;
          impressions?: number;
          engagement_rate?: number;
          recorded_at?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

