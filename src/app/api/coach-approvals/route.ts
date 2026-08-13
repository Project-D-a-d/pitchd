import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const decisionSchema = z.object({
  approval_id: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
});

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = decisionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Caller must be a club_admin of the same club as the approval row.
  // (Enforced primarily via RLS policy — add one for coach_approvals before production.)
  const { data, error } = await supabase
    .from("coach_approvals")
    .update({
      status: parsed.data.decision,
      decided_at: new Date().toISOString(),
      decided_by: user.id,
    })
    .eq("id", parsed.data.approval_id)
    .eq("status", "pending")
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Approval not found or already decided" }, { status: 404 });
  }

  return NextResponse.json({ approval: data });
}
