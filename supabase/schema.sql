-- Enable vector extension
create extension if not exists vector;

-- 1. ORGANIZATIONS (Billing Entities)
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  industry text,
  company_size text,
  website text,
  created_at timestamptz default now()
);

alter table public.organizations enable row level security;

-- 2. ORGANIZATION MEMBERS (The Link between User and Org)
create table if not exists public.organization_members (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  unique(organization_id, user_id)
);

alter table public.organization_members enable row level security;

-- 3. INVITATIONS (For onboarding teammates)
create table if not exists public.invitations (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  token text not null unique, -- Used for the invite link
  created_at timestamptz default now(),
  unique(organization_id, email)
);

alter table public.invitations enable row level security;

-- 4. USERS (Profile Data)
create table if not exists public.users (
  id uuid not null references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text
);

alter table public.users enable row level security;

-- Auth Trigger to create user profile
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


-- 5. KNOWLEDGE BASE (Scoped to Organization)
create table if not exists public.knowledge_base (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade, -- NULLABLE initially for migration, but enforced later
  user_id uuid references public.users(id) on delete cascade, -- Deprecated in favor of org_id, kept for history
  content_chunk text not null,
  embedding vector(1536),
  source_filename text,
  created_at timestamptz default now()
);

-- Helper to add organization_id if missing
do $$
begin
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'knowledge_base' and column_name = 'organization_id') then
        alter table public.knowledge_base add column organization_id uuid references public.organizations(id) on delete cascade;
    end if;
end $$;

alter table public.knowledge_base enable row level security;

-- 6. PROJECTS (Scoped to Organization)
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade, -- Maintained as "Created By"
  rfp_name text not null,
  status text default 'uploading',
  original_file_url text,
  created_at timestamptz default now()
);

do $$
begin
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'projects' and column_name = 'organization_id') then
        alter table public.projects add column organization_id uuid references public.organizations(id) on delete cascade;
    end if;
end $$;

alter table public.projects enable row level security;

-- 7. QUESTIONS
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


-- === RLS POLICIES === --

-- ORGANIZATIONS
-- Members can view their own organizations
create policy "Members can view their organizations" on public.organizations
  for select using (
    exists (
      select 1 from public.organization_members
      where organization_id = organizations.id
      and user_id = auth.uid()
    )
  );
-- Only owners can update (simplification)
create policy "Owners can update organization" on public.organizations
  for update using (
    exists (
      select 1 from public.organization_members
      where organization_id = organizations.id
      and user_id = auth.uid()
      and role = 'owner'
    )
  );

-- MEMBERS
-- Members can view other members in the same org
create policy "Members can view team" on public.organization_members
  for select using (
    exists (
      select 1 from public.organization_members as om
      where om.organization_id = organization_members.organization_id
      and om.user_id = auth.uid()
    )
  );
-- Initial adoption policy: Users can see their own membership
create policy "Users can see own membership" on public.organization_members
  for select using (auth.uid() = user_id);

-- PROJECTS
-- Access if you are a member of the linked organization
create policy "Org members can view projects" on public.projects
  for select using (
    exists (
      select 1 from public.organization_members
      where organization_id = projects.organization_id
      and user_id = auth.uid()
    )
  );
create policy "Org members can create projects" on public.projects
  for insert with check (
    exists (
      select 1 from public.organization_members
      where organization_id = projects.organization_id
      and user_id = auth.uid()
    )
  );
create policy "Org members can update projects" on public.projects
  for update using (
    exists (
      select 1 from public.organization_members
      where organization_id = projects.organization_id
      and user_id = auth.uid()
    )
  );

-- KNOWLEDGE BASE
create policy "Org members can view knowledge" on public.knowledge_base
  for select using (
    exists (
      select 1 from public.organization_members
      where organization_id = knowledge_base.organization_id
      and user_id = auth.uid()
    )
  );
create policy "Org members can insert knowledge" on public.knowledge_base
  for insert with check (
    exists (
      select 1 from public.organization_members
      where organization_id = knowledge_base.organization_id
      and user_id = auth.uid()
    )
  );

-- QUESTIONS
-- Inherit access from project
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

-- INDEXES
do $$
begin
  if not exists (select 1 from pg_indexes where tablename = 'knowledge_base' and indexname = 'knowledge_base_embedding_idx') then
      create index knowledge_base_embedding_idx on public.knowledge_base using hnsw (embedding vector_cosine_ops);
  end if;
end $$;
