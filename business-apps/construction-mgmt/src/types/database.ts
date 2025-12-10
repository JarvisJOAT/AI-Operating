/**
 * Database Type Definitions
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
      construction_projects: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
          start_date: string | null;
          end_date: string | null;
          budget: number;
          spent: number;
          address: string | null;
          client_name: string | null;
          client_phone: string | null;
          client_email: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
          start_date?: string | null;
          end_date?: string | null;
          budget?: number;
          spent?: number;
          address?: string | null;
          client_name?: string | null;
          client_phone?: string | null;
          client_email?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
          start_date?: string | null;
          end_date?: string | null;
          budget?: number;
          spent?: number;
          address?: string | null;
          client_name?: string | null;
          client_phone?: string | null;
          client_email?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      project_tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: 'todo' | 'in_progress' | 'review' | 'done';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to: string | null;
          due_date: string | null;
          estimated_hours: number | null;
          actual_hours: number | null;
          order_index: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'review' | 'done';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to?: string | null;
          due_date?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          order_index?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'review' | 'done';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to?: string | null;
          due_date?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          order_index?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: 'owner' | 'manager' | 'member' | 'viewer';
          preferred_language: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role?: 'owner' | 'manager' | 'member' | 'viewer';
          preferred_language?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role?: 'owner' | 'manager' | 'member' | 'viewer';
          preferred_language?: string;
          created_at?: string;
        };
      };

      receipts: {
        Row: {
          id: string;
          project_id: string;
          file_url: string;
          file_type: 'image' | 'pdf';
          original_filename: string;
          ocr_status: 'pending' | 'processing' | 'completed' | 'failed';
          ocr_result: Json | null;
          vendor_name: string | null;
          amount: number | null;
          tax_amount: number | null;
          receipt_date: string | null;
          category: string | null;
          notes: string | null;
          uploaded_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          file_url: string;
          file_type: 'image' | 'pdf';
          original_filename: string;
          ocr_status?: 'pending' | 'processing' | 'completed' | 'failed';
          ocr_result?: Json | null;
          vendor_name?: string | null;
          amount?: number | null;
          tax_amount?: number | null;
          receipt_date?: string | null;
          category?: string | null;
          notes?: string | null;
          uploaded_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          file_url?: string;
          file_type?: 'image' | 'pdf';
          original_filename?: string;
          ocr_status?: 'pending' | 'processing' | 'completed' | 'failed';
          ocr_result?: Json | null;
          vendor_name?: string | null;
          amount?: number | null;
          tax_amount?: number | null;
          receipt_date?: string | null;
          category?: string | null;
          notes?: string | null;
          uploaded_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      expenses: {
        Row: {
          id: string;
          project_id: string;
          receipt_id: string | null;
          description: string;
          amount: number;
          category: string;
          expense_date: string;
          vendor_name: string | null;
          payment_method: string | null;
          is_approved: boolean;
          approved_by: string | null;
          approved_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          receipt_id?: string | null;
          description: string;
          amount: number;
          category: string;
          expense_date: string;
          vendor_name?: string | null;
          payment_method?: string | null;
          is_approved?: boolean;
          approved_by?: string | null;
          approved_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          receipt_id?: string | null;
          description?: string;
          amount?: number;
          category?: string;
          expense_date?: string;
          vendor_name?: string | null;
          payment_method?: string | null;
          is_approved?: boolean;
          approved_by?: string | null;
          approved_at?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      project_messages: {
        Row: {
          id: string;
          project_id: string;
          sender_id: string;
          content: string;
          original_language: string;
          translations: Json; // { lang_code: translated_text }
          reply_to: string | null;
          is_edited: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          sender_id: string;
          content: string;
          original_language?: string;
          translations?: Json;
          reply_to?: string | null;
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          sender_id?: string;
          content?: string;
          original_language?: string;
          translations?: Json;
          reply_to?: string | null;
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      document_versions: {
        Row: {
          id: string;
          document_id: string;
          version_number: number;
          file_url: string;
          file_size: number;
          changes_summary: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          version_number: number;
          file_url: string;
          file_size: number;
          changes_summary?: string | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          version_number?: number;
          file_url?: string;
          file_size?: number;
          changes_summary?: string | null;
          uploaded_by?: string;
          created_at?: string;
        };
      };

      project_documents: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          description: string | null;
          file_type: string;
          current_version: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          description?: string | null;
          file_type: string;
          current_version?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          description?: string | null;
          file_type?: string;
          current_version?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      translation_cache: {
        Row: {
          id: string;
          source_text_hash: string;
          source_language: string;
          target_language: string;
          translated_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_text_hash: string;
          source_language: string;
          target_language: string;
          translated_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_text_hash?: string;
          source_language?: string;
          target_language?: string;
          translated_text?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

