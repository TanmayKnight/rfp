-- Transactional Organization Creation Function
-- Fixes the "Chicken and Egg" RLS issue where you can't see the Org you just created.

create or replace function public.create_organization_v2(
  org_name text,
  org_industry text,
  org_size text,
  org_website text
)
returns uuid
language plpgsql
security definer -- Runs with admin privileges to bypass RLS during creation
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  -- 1. Create Organization
  insert into public.organizations (name, industry, company_size, website)
  values (org_name, org_industry, org_size, org_website)
  returning id into new_org_id;

  -- 2. Add Creator as Owner
  insert into public.organization_members (organization_id, user_id, role)
  values (new_org_id, auth.uid(), 'owner');

  return new_org_id;
end;
$$;
