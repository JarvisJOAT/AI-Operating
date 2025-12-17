/*
  # Enhance Projects Schema
  
  ## Overview
  Adds budget, priority, and custom_fields to the projects table to support
  richer project data required by the frontend.
  
  ## Changes
  
  ### `projects`
  - Add `budget` (numeric)
  - Add `priority` (text) - default 'medium'
  - Add `custom_fields` (jsonb) - default '{}'
*/

DO $$ 
BEGIN 
    -- Add budget column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'budget') THEN
        ALTER TABLE projects ADD COLUMN budget numeric(15,2);
    END IF;

    -- Add priority column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'priority') THEN
        ALTER TABLE projects ADD COLUMN priority text DEFAULT 'medium';
    END IF;

    -- Add custom_fields column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'custom_fields') THEN
        ALTER TABLE projects ADD COLUMN custom_fields jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;
