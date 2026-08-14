-- Seat packs (subscription tiers)
create table seat_packs (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid not null references clubs(id) on delete cascade,
  name text not null,
  description text,
  coach_limit int not null,
  price_eur int not null, -- in cents (e.g., 3000 = €30)
  billing_period text not null default 'month' check (billing_period in ('month', 'year')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (club_id, name)
);

-- Club subscriptions (subscription records for coaches)
create table club_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid not null references clubs(id) on delete cascade,
  seat_pack_id uuid not null references seat_packs(id) on delete restrict,
  coach_id uuid not null references profiles(id) on delete cascade,
  stripe_subscription_id text unique,
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'unpaid')),
  current_period_start date,
  current_period_end date,
  cancel_at_period_end boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (club_id, coach_id) -- one active subscription per coach per club
);

-- Enable RLS
alter table seat_packs enable row level security;
alter table club_subscriptions enable row level security;

-- RLS Policies for seat_packs
create policy "seat_packs readable by club members" on seat_packs
  for select using (
    club_id in (select club_id from profiles where id = auth.uid())
  );

create policy "club_admin can create seat_packs" on seat_packs
  for insert with check (
    club_id in (select club_id from profiles where id = auth.uid() and role = 'club_admin')
  );

create policy "club_admin can update own seat_packs" on seat_packs
  for update using (
    club_id in (select club_id from profiles where id = auth.uid() and role = 'club_admin')
  );

-- RLS Policies for club_subscriptions
create policy "subscriptions readable by club members" on club_subscriptions
  for select using (
    club_id in (select club_id from profiles where id = auth.uid())
  );

create policy "coaches can create own subscriptions" on club_subscriptions
  for insert with check (
    coach_id = auth.uid()
  );
