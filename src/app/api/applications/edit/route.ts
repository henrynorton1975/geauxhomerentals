import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/applications/edit?token=<UUID>
 * Validates an edit token and returns the application data.
 * Returns 404 if token is invalid or expired.
 * Returns 403 if application status is approved/denied/lease_signed.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const { data: app, error } = await supabase
    .from("applications")
    .select("*, listing:listings(address, city, state, zip, monthly_rent)")
    .eq("edit_token", token)
    .single();

  if (error || !app) {
    return NextResponse.json(
      { error: "Invalid or expired link. This edit link may not exist or has already been used." },
      { status: 404 }
    );
  }

  // Check token expiry
  if (!app.edit_token_expires_at || new Date(app.edit_token_expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This edit link has expired. Edit links are valid for 7 days from submission." },
      { status: 410 }
    );
  }

  // Only allow edits on new or pending/under_review applications
  const editableStatuses = ["new", "pending", "under_review"];
  if (!editableStatuses.includes(app.status)) {
    return NextResponse.json(
      { error: "This application has already been reviewed and can no longer be edited." },
      { status: 403 }
    );
  }

  // Return the application (strip edit_token for security)
  const { edit_token: _token, ...safeApp } = app;
  return NextResponse.json(safeApp);
}

/**
 * PUT /api/applications/edit?token=<UUID>
 * Updates the application with the provided data.
 * Validates token, extends expiry by 7 days, and sets last_edited_at.
 */
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  // Validate token first
  const { data: existing, error: lookupError } = await supabase
    .from("applications")
    .select("id, status, edit_token_expires_at")
    .eq("edit_token", token)
    .single();

  if (lookupError || !existing) {
    return NextResponse.json({ error: "Invalid edit token" }, { status: 404 });
  }

  if (!existing.edit_token_expires_at || new Date(existing.edit_token_expires_at) < new Date()) {
    return NextResponse.json({ error: "This edit link has expired" }, { status: 410 });
  }

  const editableStatuses = ["new", "pending", "under_review"];
  if (!editableStatuses.includes(existing.status)) {
    return NextResponse.json(
      { error: "This application can no longer be edited" },
      { status: 403 }
    );
  }

  const body = await request.json();

  // Fields that cannot be changed via edit (security & integrity)
  const {
    id: _id,
    edit_token: _et,
    edit_token_expires_at: _eta,
    status: _status,
    internal_notes: _notes,
    created_at: _created,
    updated_at: _updated,
    last_edited_at: _lea,
    listing_id: _lid,
    listing: _listing,
    ...allowedUpdates
  } = body;

  const updatePayload = {
    ...allowedUpdates,
    last_edited_at: new Date().toISOString(),
    edit_token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const { data, error } = await supabase
    .from("applications")
    .update(updatePayload)
    .eq("id", existing.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { edit_token: _t, ...safeData } = data;
  return NextResponse.json(safeData);
}
