-- Insert test pitches
INSERT INTO pitches (id, club_id, name, location, slots_per_day)
VALUES
  ('pitch-1', 'club-1', 'Pitch A', 'Field 1', 12),
  ('pitch-2', 'club-1', 'Pitch B', 'Field 2', 12),
  ('pitch-3', 'club-1', 'Pitch C', 'Field 3', 12)
ON CONFLICT (id) DO NOTHING;

-- Insert test club
INSERT INTO clubs (id, name, location, subscription_tier)
VALUES
  ('club-1', 'Test Football Club', 'Berlin, Germany', 'professional')
ON CONFLICT (id) DO NOTHING;

-- Insert a test booking (so you can see how availability works)
-- This books slot 0 (08:00-09:00) on 2026-08-28 for pitch-1
INSERT INTO bookings (id, pitch_id, slot_number, booking_date, created_by, status)
VALUES
  (gen_random_uuid(), 'pitch-1', 0, '2026-08-28', (SELECT id FROM auth.users LIMIT 1), 'confirmed')
ON CONFLICT (pitch_id, slot_number, booking_date) DO NOTHING;
