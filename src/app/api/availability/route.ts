import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const querySchema = z.object({
  pitch_id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse({
    pitch_id: req.nextUrl.searchParams.get("pitch_id"),
    date: req.nextUrl.searchParams.get("date"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { pitch_id, date } = parsed.data;
  const supabase = createClient();

  const { data: pitch, error: pitchError } = await supabase
    .from("pitches")
    .select("slots_per_day")
    .eq("id", pitch_id)
    .single();
  if (pitchError || !pitch) {
    return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("slot_index")
    .eq("pitch_id", pitch_id)
    .eq("booking_date", date);
  if (bookingsError) {
    return NextResponse.json({ error: bookingsError.message }, { status: 500 });
  }

  const bookedSlots = new Set((bookings ?? []).map((b) => b.slot_index));
  const slots = Array.from({ length: pitch.slots_per_day }, (_, i) => ({
    slot_index: i,
    available: !bookedSlots.has(i),
  }));

  return NextResponse.json({ pitch_id, date, slots });
}
