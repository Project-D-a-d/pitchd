import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  club_id: z.string().uuid(),
  pitch_size: z.string(),
  age_group: z.string(),
  league_level: z.string(),
  player_count: z.number().int().positive(),
  focus_areas: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: "AI training suggestions not configured" }, { status: 503 });
  }

  const prompt = `Design a football training session for a ${input.age_group} team at ${input.league_level} level, ${input.player_count} players, on a ${input.pitch_size} pitch. Focus areas: ${input.focus_areas.join(", ")}. Give a structured warm-up, main block, and cool-down.`;

  const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!aiRes.ok) {
    return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
  }
  const aiData = await aiRes.json();
  const suggestionText = aiData.content?.find((c: any) => c.type === "text")?.text ?? "";

  const { data, error } = await supabase
    .from("training_suggestions")
    .insert({
      requested_by: user.id,
      club_id: input.club_id,
      pitch_size: input.pitch_size,
      age_group: input.age_group,
      league_level: input.league_level,
      player_count: input.player_count,
      focus_areas: input.focus_areas,
      suggestion: suggestionText,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suggestion: data }, { status: 201 });
}
