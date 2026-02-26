import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

// GET /api/applications/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAuth(request);
  if (authError) return authError;
  const { id } = await params;
  const { data, error } = await supabase
    .from("applications")
    .select("*, listing:listings(address, city, state, zip, monthly_rent)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Also get notes
  const { data: notes } = await supabase
    .from("application_notes")
    .select("*")
    .eq("application_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ ...data, notes: notes || [] });
}
