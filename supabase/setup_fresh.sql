-- ==============================================================================
-- RFP GENIUS: COMPLETE B2B DATABASE SETUP SCRIPT
-- RUN THIS IN THE SUPABASE SQL EDITOR OF YOUR NEW PROJECT
-- ==============================================================================

-- 1. ENABLE EXTENSIONS
create extension if not exists vector;

-- 2. CREATE TABLES

-- A. Organizations (Billing & Tenant Entity)
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  industry text,
  company_size text,
  website text,
  created_at timestamptz default now()
);

alter table public.organizations enable row level security;

-- B. Organization Members (Link Auth User to Org)
create table if not exists public.organization_members (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  unique(organization_id, user_id)
);

alter table public.organization_members enable row level security;

-- C. Invitations (For Team Growth)
create table if not exists public.invitations (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  token text not null unique,
  created_at timestamptz default now(),
  unique(organization_id, email)
);

alter table public.invitations enable row level security;

-- D. Public Profiles (Mirrors Auth Users)
create table if not exists public.users (
  id uuid not null references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text
);

alter table public.users enable row level security;

-- E. Knowledge Base (RAG Documents)
create table if not exists public.knowledge_base (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade,
  content_chunk text not null,
  embedding vector(1536),
  source_filename text,
  created_at timestamptz default now()
);

alter table public.knowledge_base enable row level security;
create index if not exists knowledge_base_embedding_idx on public.knowledge_base using hnsw (embedding vector_cosine_ops);

-- F. Projects (RFP Containers)
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade,
  rfp_name text not null,
  status text default 'uploading',
  original_file_url text,
  created_at timestamptz default now()
);

alter table public.projects enable row level security;

-- G. Project Questions (RFP Content)
create table if not exists public.project_questions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  question_text text not null,
  draft_answer text,
  confidence_score float,
  context_used jsonb,
  created_at timestamptz default now()
);

alter table public.project_questions enable row level security;


-- 3. TRIGGERS & FUNCTIONS

-- A. Auto-create Public User Profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;

-- B. Match Documents (Vector Search RPC)
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_organization_id uuid
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
    kb.id,
    kb.content_chunk,
    kb.source_filename,
    1 - (kb.embedding <=> query_embedding) as similarity
  from knowledge_base kb
  where 1 - (kb.embedding <=> query_embedding) > match_threshold
  and kb.organization_id = filter_organization_id -- CRITICAL: Scoped by Org
  order by similarity desc
  limit match_count;
end;
$$;


-- 4. RLS POLICIES

-- Organizations
create policy "Members can view their organizations" on public.organizations
  for select using (
    exists (select 1 from public.organization_members where organization_id = organizations.id and user_id = auth.uid())
  );

create policy "Owners can update organization" on public.organizations
  for update using (
    exists (select 1 from public.organization_members where organization_id = organizations.id and user_id = auth.uid() and role = 'owner')
  );

-- Members
create policy "Members can view team" on public.organization_members
  for select using (
    exists (select 1 from public.organization_members as om where om.organization_id = organization_members.organization_id and om.user_id = auth.uid())
  );

create policy "Users can see own membership" on public.organization_members
  for select using (auth.uid() = user_id);

-- Invitations
create policy "Owners/Admins can view invitations" on public.invitations
  for select using (
    exists (select 1 from public.organization_members where organization_id = invitations.organization_id and user_id = auth.uid() and role in ('owner', 'admin'))
  );

-- Projects
create policy "Org members can view projects" on public.projects
  for select using (
    exists (select 1 from public.organization_members where organization_id = projects.organization_id and user_id = auth.uid())
  );

create policy "Org members can create projects" on public.projects
  for insert with check (
    exists (select 1 from public.organization_members where organization_id = projects.organization_id and user_id = auth.uid())
  );

create policy "Org members can update projects" on public.projects
  for update using (
    exists (select 1 from public.organization_members where organization_id = projects.organization_id and user_id = auth.uid())
  );

-- Knowledge Base
create policy "Org members can view knowledge" on public.knowledge_base
  for select using (
    exists (select 1 from public.organization_members where organization_id = knowledge_base.organization_id and user_id = auth.uid())
  );

create policy "Org members can insert knowledge" on public.knowledge_base
  for insert with check (
    exists (select 1 from public.organization_members where organization_id = knowledge_base.organization_id and user_id = auth.uid())
  );

-- Project Questions
create policy "Org members access questions" on public.project_questions
  for all using (
    exists (
      select 1 from public.projects
      where id = project_questions.project_id
      and exists (
        select 1 from public.organization_members
        where organization_id = projects.organization_id
        and user_id = auth.uid()
      )
    )
  );

-- Users
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Org members can view team profiles" on public.users
  for select using (
    exists (
      select 1 from public.organization_members om1
      join public.organization_members om2 on om1.organization_id = om2.organization_id
      where om1.user_id = auth.uid() and om2.user_id = users.id
    )
  );
