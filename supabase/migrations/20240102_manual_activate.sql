-- Manually activate the subscription since the webhook was missed
update public.organizations
set subscription_status = 'active';
