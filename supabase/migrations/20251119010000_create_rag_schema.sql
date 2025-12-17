/*
  # Enable Vector Support and RAG Schema
  
  ## Overview
  Enables pgvector extension and creates tables/functions for storing and searching 
  text embeddings (RAG).
  
  ## Changes
  
  ### Extensions
  - `vector`: Enables vector similarity search.
  
  ### Tables
  - `document_embeddings`
    - `id`: UUID
    - `content`: Text content chunk
    - `embedding`: Vector(1536) (OpenAI Ada-2 compatible)
    - `metadata`: JSONB (links to project_id, contact_id, etc)
    - `created_at`: Timestamptz
    
  ### Functions
  - `match_documents`: RPC function to find similar documents
*/

-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table to store document chunks and their embeddings
CREATE TABLE IF NOT EXISTS document_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  content text, -- The text content that was embedded
  metadata jsonb, -- Metadata to link back to source (e.g. { "source": "project", "id": "..." })
  embedding vector(1536), -- OpenAI embeddings are 1536 dimensions
  created_at timestamptz DEFAULT now()
);

-- Create an index for faster similarity search
CREATE INDEX IF NOT EXISTS idx_document_embeddings_embedding ON document_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable RLS
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Members can query embeddings"
  ON document_embeddings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = document_embeddings.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_org_id uuid
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    document_embeddings.id,
    document_embeddings.content,
    document_embeddings.metadata,
    1 - (document_embeddings.embedding <=> query_embedding) as similarity
  from document_embeddings
  where 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  and document_embeddings.organization_id = filter_org_id
  order by document_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
