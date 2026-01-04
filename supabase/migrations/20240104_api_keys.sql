-- Create a table for storing encrypted API keys
-- We will handle encryption in the application layer (Node.js) before insertion
-- This keeps the DB logic simple and portable

create type key_provider as enum ('openai', 'anthropic', 'google', 'azure');

create table if not exists api_keys (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  org_id uuid references organizations(id) on delete cascade not null,
  provider key_provider not null,
  key_hint text not null, -- The last 4 chars, e.g. "sk-...34a2" for UI display
  encrypted_key text not null, -- The actual key, AES-256 encrypted string
  is_active boolean default true not null,
  
  -- Ensure one active key per provider per org
  unique(org_id, provider)
);

-- RLS Policies
alter table api_keys enable row level security;

-- Users can view keys for their organization
create policy "Users can view their org's keys"
    on api_keys for select
    using (
        exists (
            select 1 from organization_members
            where organization_members.organization_id = api_keys.org_id
            and organization_members.user_id = auth.uid()
        )
    );

-- Only Admins/Owners can insert/update/delete keys
create policy "Admins can manage keys"
    on api_keys for all
    using (
        exists (
            select 1 from organization_members
            where organization_members.organization_id = api_keys.org_id
            and organization_members.user_id = auth.uid()
            and organization_members.role in ('owner', 'admin')
        )
    );
