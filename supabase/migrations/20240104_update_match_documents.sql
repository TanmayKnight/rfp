
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_organization_id uuid -- Critical for multi-tenancy
)
returns table (
  id uuid,
  content_chunk text,
  source_filename text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    knowledge_base.id,
    knowledge_base.content_chunk,
    knowledge_base.source_filename,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  from knowledge_base
  where 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  and knowledge_base.organization_id = filter_organization_id -- Scoped search
  order by similarity desc
  limit match_count;
end;
$$;
