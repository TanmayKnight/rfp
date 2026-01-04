-- Force all organizations to be inactive so they must subscribe
update public.organizations
set subscription_status = 'inactive';

-- Change the default for future organizations
alter table public.organizations 
alter column subscription_status set default 'inactive';
