/**
 * Database Type Definitions
 * 
 * TypeScript types for Food Truck database tables.
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

export interface Database {
  public: {
    Tables: {
      menu_categories: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      menu_items: {
        Row: {
          id: string;
          organization_id: string;
          category_id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          is_available: boolean;
          preparation_time: number; // minutes
          calories: number | null;
          allergens: string[];
          modifiers: Json; // available modifications
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          category_id: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          is_available?: boolean;
          preparation_time?: number;
          calories?: number | null;
          allergens?: string[];
          modifiers?: Json;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          is_available?: boolean;
          preparation_time?: number;
          calories?: number | null;
          allergens?: string[];
          modifiers?: Json;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      customers: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null; // linked auth user
          name: string;
          email: string | null;
          phone: string;
          preferences: Json;
          total_orders: number;
          total_spent: number;
          loyalty_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          name: string;
          email?: string | null;
          phone: string;
          preferences?: Json;
          total_orders?: number;
          total_spent?: number;
          loyalty_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string | null;
          name?: string;
          email?: string | null;
          phone?: string;
          preferences?: Json;
          total_orders?: number;
          total_spent?: number;
          loyalty_points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      orders: {
        Row: {
          id: string;
          organization_id: string;
          customer_id: string | null;
          order_number: string;
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          order_type: 'pickup' | 'delivery';
          items: Json; // order items with modifiers
          subtotal: number;
          tax: number;
          tip: number;
          discount: number;
          total: number;
          payment_method: 'cash' | 'card' | 'mobile' | 'crypto';
          payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
          payment_id: string | null;
          special_instructions: string | null;
          estimated_ready_at: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          source: 'web' | 'mobile' | 'voice' | 'walk_in';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          customer_id?: string | null;
          order_number?: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          order_type?: 'pickup' | 'delivery';
          items: Json;
          subtotal: number;
          tax?: number;
          tip?: number;
          discount?: number;
          total: number;
          payment_method?: 'cash' | 'card' | 'mobile' | 'crypto';
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed';
          payment_id?: string | null;
          special_instructions?: string | null;
          estimated_ready_at?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          source?: 'web' | 'mobile' | 'voice' | 'walk_in';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          customer_id?: string | null;
          order_number?: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          order_type?: 'pickup' | 'delivery';
          items?: Json;
          subtotal?: number;
          tax?: number;
          tip?: number;
          discount?: number;
          total?: number;
          payment_method?: 'cash' | 'card' | 'mobile' | 'crypto';
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed';
          payment_id?: string | null;
          special_instructions?: string | null;
          estimated_ready_at?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          source?: 'web' | 'mobile' | 'voice' | 'walk_in';
          created_at?: string;
          updated_at?: string;
        };
      };

      order_notifications: {
        Row: {
          id: string;
          order_id: string;
          type: 'sms' | 'email' | 'push';
          recipient: string;
          message: string;
          status: 'pending' | 'sent' | 'delivered' | 'failed';
          sent_at: string | null;
          delivered_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          type: 'sms' | 'email' | 'push';
          recipient: string;
          message: string;
          status?: 'pending' | 'sent' | 'delivered' | 'failed';
          sent_at?: string | null;
          delivered_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          type?: 'sms' | 'email' | 'push';
          recipient?: string;
          message?: string;
          status?: 'pending' | 'sent' | 'delivered' | 'failed';
          sent_at?: string | null;
          delivered_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
      };

      voice_calls: {
        Row: {
          id: string;
          organization_id: string;
          call_sid: string;
          caller_phone: string;
          status: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'transferred';
          transcript: Json[];
          order_id: string | null;
          duration_seconds: number | null;
          transferred_to: string | null;
          created_at: string;
          ended_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          call_sid: string;
          caller_phone: string;
          status?: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'transferred';
          transcript?: Json[];
          order_id?: string | null;
          duration_seconds?: number | null;
          transferred_to?: string | null;
          created_at?: string;
          ended_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          call_sid?: string;
          caller_phone?: string;
          status?: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'transferred';
          transcript?: Json[];
          order_id?: string | null;
          duration_seconds?: number | null;
          transferred_to?: string | null;
          created_at?: string;
          ended_at?: string | null;
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

