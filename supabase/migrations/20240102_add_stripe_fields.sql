-- Stripe Subscriptions Schema
-- Adds support for tracking organization subscriptions

-- 1. Add Stripe fields to Organizations
alter table public.organizations 
add column if not exists stripe_customer_id text,
add column if not exists stripe_subscription_id text,
add column if not exists subscription_status text default 'trialing', -- active, trialing, past_due, canceled, unpaid
add column if not exists subscription_price_id text;

-- 2. Create an index for faster lookups
create index if not exists idx_orgs_stripe_customer on public.organizations(stripe_customer_id);

-- 3. Update RLS to allow members to view their own subscription status
-- (Already covered by existing "Members can view their organizations" policy)
