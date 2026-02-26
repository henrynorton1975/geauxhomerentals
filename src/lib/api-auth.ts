import { NextRequest, NextResponse } from "next/server";

/**
 * Checks for a valid Bearer token in the Authorization header.
 * Returns null if authorized, or a 401 NextResponse if not.
 */
export function requireAuth(request: NextRequest): NextResponse | null {
  const secret = process.env.API_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "Server misconfiguration: API_SECRET_KEY not set" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: Bearer token required" },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);
  if (token !== secret) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid API key" },
      { status: 401 }
    );
  }

  return null;
}
