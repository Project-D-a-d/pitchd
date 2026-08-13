-- Pitchd initial schema
-- Run in Supabase SQL editor (Frankfurt region project)

create extension if not exists "uuid-ossp";

-- Clubs
create table clubs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text,
  created_at timestamptz not null default now()
);

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  club_id uuid references clubs(id) on delete set null,
  full_name text,
  role text not null check (role in ('club_admin','coach','player','third_party_coach')),
  onboarded_via text check (onboarded_via in ('qr','email')),
  created_at timestamptz not null default now()
);

-- Coach approval workflow (48hr default expiry)
create table coach_approvals (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid not null references clubs(id) on delete cascade,
  coach_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected','expired')),
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '48 hours'),
  decided_at timestamptz,
  decided_by uuid references profiles(id)
);

-- Pitches, divided into eighths for granular scheduling
create table pitches (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid not null references clubs(id) on delete cascade,
  name text not null,
  slots_per_day int not null default 8
);

-- Bookings (one row per eighth-slot)
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  pitch_id uuid not null references pitches(id) on delete cascade,
  booked_by uuid not null references profiles(id),
  booking_date date not null,
  slot_index int not null check (slot_index >= 0 and slot_index < 8),
  created_at timestamptz not null default now(),
  unique (pitch_id, booking_date, slot_index)
);

-- Calendar sync (Google/Apple)
create table calendar_connections (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  provider text not null check (provider in ('google','apple')),
  external_calendar_id text,
  access_token text,
  refresh_token text,
  created_at timestamptz not null default now()
);

-- AI-assisted training suggestions
create table training_suggestions (
  id uuid primary key default uuid_generate_v4(),
  requested_by uuid not null references profiles(id),
  club_id uuid not null references clubs(id),
  pitch_size text,
  age_group text,
  league_level text,
  player_count int,
  focus_areas text[],
  suggestion text,
  created_at timestamptz not null default now()
);

-- Basic RLS (tighten before production)
alter table clubs enable row level security;
alter table profiles enable row level security;
alter table coach_approvals enable row level security;
alter table pitches enable row level security;
alter table bookings enable row level security;
alter table calendar_connections enable row level security;
alter table training_suggestions enable row level security;

create policy "profiles readable by same club" on profiles
  for select using (club_id in (select club_id from profiles where id = auth.uid()));

create policy "bookings readable by same club" on bookings
  for select using (
    pitch_id in (select id from pitches where club_id in
      (select club_id from profiles where id = auth.uid()))
  );

create policy "bookings insertable by authenticated club members" on bookings
  for insert with check (
    booked_by = auth.uid()
  );
