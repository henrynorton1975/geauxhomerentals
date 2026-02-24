import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/applications - Get all applications (filterable)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const listing_id = searchParams.get("listing_id");

  let query = supabase.from("applications").select("*, listing:listings(address, city, state, zip, monthly_rent)").order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (listing_id) query = query.eq("listing_id", listing_id);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/applications - Submit a new application
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase.from("applications").insert(body).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
