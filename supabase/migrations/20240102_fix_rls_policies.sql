-- Fix RLS policies to allow Organization Creation
-- Run this in your Supabase SQL Editor

-- 1. Allow any authenticated user to create a new Organization
create policy "Authenticated users can create organizations"
on public.organizations
for insert
with check (
  auth.role() = 'authenticated'
);

-- 2. Allow users to add themselves as members (essential for the creator to become owner)
create policy "Users can add themselves to organizations"
on public.organization_members
for insert
with check (
  auth.uid() = user_id
);
