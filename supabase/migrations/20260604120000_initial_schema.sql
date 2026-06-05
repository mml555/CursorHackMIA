-- =============================================================================
-- Business Banter — initial schema
-- Run in Supabase SQL Editor (or via supabase db push)
-- =============================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums (bracket labels match UI copy; store snake_case in DB)
-- -----------------------------------------------------------------------------

create type public.revenue_bracket as enum (
  'under_100k',
  '100k_500k',
  '500k_1m',
  '1m_5m',
  '5m_10m',
  '10m_plus',
  'prefer_not_to_say'
);

create type public.company_size_bracket as enum (
  'solo',           -- 1
  '2_10',
  '11_50',
  '51_200',
  '201_500',
  '500_plus'
);

create type public.service_value_bracket as enum (
  'under_1k',
  '1k_5k',
  '5k_15k',
  '15k_50k',
  '50k_plus',
  'prefer_not_to_say'
);

-- -----------------------------------------------------------------------------
-- profiles — one row per auth user (contact / identity)
-- -----------------------------------------------------------------------------

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  first_name    text not null,
  last_name     text not null,
  phone         text not null,
  email         text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint profiles_first_name_len check (char_length(trim(first_name)) >= 1),
  constraint profiles_last_name_len  check (char_length(trim(last_name)) >= 1),
  constraint profiles_phone_len      check (char_length(trim(phone)) >= 7),
  constraint profiles_email_format   check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

comment on table public.profiles is 'Account holder contact info; id matches auth.users';
comment on column public.profiles.phone is 'E.164 recommended in app layer; stored as text';

create index profiles_email_idx on public.profiles (lower(email));

-- -----------------------------------------------------------------------------
-- businesses — one primary business per owner for MVP
-- -----------------------------------------------------------------------------

create table public.businesses (
  id                          uuid primary key default gen_random_uuid(),
  owner_id                    uuid not null references public.profiles (id) on delete cascade,
  business_name               text not null,
  industry                    text not null,
  location                    text not null,  -- general: e.g. "Austin, TX" or "UK — Remote"
  revenue_bracket             public.revenue_bracket not null,
  company_size                public.company_size_bracket not null,
  estimated_service_value     public.service_value_bracket not null,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  constraint businesses_name_len     check (char_length(trim(business_name)) >= 2),
  constraint businesses_industry_len check (char_length(trim(industry)) >= 2),
  constraint businesses_location_len check (char_length(trim(location)) >= 2)
);

comment on table public.businesses is 'Business profile for barter; MVP: one business per user';
comment on column public.businesses.location is 'General geography, not full street address';
comment on column public.businesses.estimated_service_value is
  'Typical $ value of services this business would exchange in a partnership';

-- MVP: one business per owner (remove this unique index later if multi-business is allowed)
create unique index businesses_one_per_owner_idx on public.businesses (owner_id);

create index businesses_industry_idx on public.businesses (industry);
create index businesses_location_idx on public.businesses (location);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Auto-create profile on sign-up (email from auth; names filled in onboarding/sign-up)
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;

-- profiles: own row only
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- businesses: own rows only
create policy "businesses_select_own"
  on public.businesses for select
  using (auth.uid() = owner_id);

create policy "businesses_insert_own"
  on public.businesses for insert
  with check (auth.uid() = owner_id);

create policy "businesses_update_own"
  on public.businesses for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "businesses_delete_own"
  on public.businesses for delete
  using (auth.uid() = owner_id);

-- -----------------------------------------------------------------------------
-- Helper for middleware: “has this user completed business onboarding?”
-- -----------------------------------------------------------------------------

create or replace function public.user_has_business()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.businesses b
    where b.owner_id = auth.uid()
  );
$$;

grant execute on function public.user_has_business() to authenticated;

-- Optional: expose a single read view for dashboard (own data only via RLS on base tables)
-- create view public.my_business_summary as ...
