export type Role = "club_admin" | "coach" | "player" | "third_party_coach";
export type OnboardedVia = "qr" | "email";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";
export type CalendarProvider = "google" | "apple";

export interface Club {
  id: string;
  name: string;
  city: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  club_id: string | null;
  full_name: string | null;
  role: Role;
  onboarded_via: OnboardedVia | null;
  created_at: string;
}

export interface CoachApproval {
  id: string;
  club_id: string;
  coach_id: string;
  status: ApprovalStatus;
  requested_at: string;
  expires_at: string;
  decided_at: string | null;
  decided_by: string | null;
}

export interface Pitch {
  id: string;
  club_id: string;
  name: string;
  slots_per_day: number;
}

export interface Booking {
  id: string;
  pitch_id: string;
  booked_by: string;
  booking_date: string;
  slot_index: number;
  created_at: string;
}

export interface TrainingSuggestion {
  id: string;
  requested_by: string;
  club_id: string;
  pitch_size: string | null;
  age_group: string | null;
  league_level: string | null;
  player_count: number | null;
  focus_areas: string[] | null;
  suggestion: string | null;
  created_at: string;
}
