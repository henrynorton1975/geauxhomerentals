import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

// GET /api/listings - Get all listings (filterable by status)
// ?public=true bypasses auth and returns only active listings
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isPublic = searchParams.get("public") === "true";

  if (!isPublic) {
    const authError = requireAuth(request);
    if (authError) return authError;
  }

  const status = searchParams.get("status");

  let query = supabase.from("listings").select("*").order("created_at", { ascending: false });

  if (isPublic) {
    query = query.eq("status", "active");
  } else if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

function generateSlug(address: string): string {
  return address
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// POST /api/listings - Create a new listing
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.address && !body.slug) {
    body.slug = generateSlug(body.address);
  }

  const { data, error } = await supabase.from("listings").insert(body).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
