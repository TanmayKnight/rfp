-- Add new columns to organizations table
do $$
begin
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'organizations' and column_name = 'industry') then
        alter table public.organizations add column industry text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'organizations' and column_name = 'company_size') then
        alter table public.organizations add column company_size text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'organizations' and column_name = 'website') then
        alter table public.organizations add column website text;
    end if;
end $$;
