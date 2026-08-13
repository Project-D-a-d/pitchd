# Pitchd

Football pitch booking and club management for amateur football clubs in Germany.

## Stack
- Next.js 14 (App Router) on Vercel
- Supabase (Frankfurt region) — Postgres + Auth
- Tailwind CSS
- Zod for API validation
- Claude API for AI-assisted training suggestions

## What's already built
- Full Supabase schema (`supabase/migrations/0001_init.sql`): clubs, profiles
  (roles: club_admin/coach/player/third_party_coach), coach approval workflow
  (48hr default expiry), pitches split into eighths, bookings with a unique
  constraint guarding double-booking, calendar_connections table, and
  training_suggestions table. Basic RLS policies included — tighten before
  production.
- Live API routes:
  - `GET /api/availability?pitch_id=&date=` — eighth-slot availability for a pitch/day
  - `POST /api/bookings` — book a slot (409 on conflict)
  - `PATCH /api/coach-approvals` — approve/reject a pending coach request
  - `POST /api/training-suggestions` — generates and stores an AI training plan via the Claude API
- Supabase client setup (browser + server + service-role), TypeScript types, Tailwind config, placeholder home page.

## Not yet built (priority order)
1. **Auth flow** — Supabase Auth, email + QR-code onboarding (`profiles.onboarded_via`)
2. **Booking UI** — grid of 8 slots per day per pitch
3. **Club admin dashboard** — manage coach approvals, seat packs
4. Google/Apple Calendar sync wiring (table exists, no OAuth flow yet)
5. Billing — Stripe or equivalent for subscriptions + AI suggestion add-on
6. Supabase `pg_cron` job to auto-expire pending coach approvals after 48 hours
7. Native iOS/Android app (post-MVP)

## Setup
1. `npm install`
2. Create a Supabase project (Frankfurt region), run `supabase/migrations/0001_init.sql` in the SQL editor
3. Copy `.env.example` to `.env.local` and fill in your Supabase URL/keys and `ANTHROPIC_API_KEY`
4. `npm run dev`

## Kickoff prompt for Claude Code

Paste this once you have the repo open in Claude Code:

> The schema and core API routes (availability, bookings, coach approvals,
> AI training suggestions) already exist — see README.md "Not yet built" for
> the priority list. Start by building the auth flow (Supabase Auth, email +
> QR-code onboarding per the profiles.onboarded_via field) and the pitch
> availability/booking UI as a grid of 8 slots per day per pitch. Match the
> existing code style (TypeScript, Zod validation on API routes, Tailwind
> for styling).
