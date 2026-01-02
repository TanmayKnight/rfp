-- FIX INFINITE RECURSION IN RLS
-- The previous policy caused a loop. This script fixes it using a secure function.

-- 1. Drop the problematic recursive policy
drop policy if exists "Members can view team" on public.organization_members;

-- 2. Create a helper function to get your Organization IDs
-- "security definer" means this runs with admin privileges, avoiding the RLS loop.
create or replace function public.get_my_org_ids()
returns setof uuid
language sql
security definer
set search_path = public -- Best practice for security definers
stable
as $$
  select organization_id 
  from public.organization_members 
  where user_id = auth.uid();
$$;

-- 3. Create the new, safe policy
create policy "Members can view team" 
on public.organization_members
for select 
using (
  organization_id in (select public.get_my_org_ids())
);
