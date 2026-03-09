import { supabase } from "@/lib/supabase";
import Link from "next/link";
import EditApplicationForm from "./EditApplicationForm";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function EditApplicationPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  // No token provided
  if (!token) {
    return <ErrorPage message="No edit link provided. Please check the link in your confirmation email." />;
  }

  // Look up the application by edit token
  const { data: app, error } = await supabase
    .from("applications")
    .select("*, listing:listings(address, city, state, zip, monthly_rent)")
    .eq("edit_token", token)
    .single();

  if (error || !app) {
    return (
      <ErrorPage
        title="Link Not Found"
        message="This edit link is invalid or doesn't exist. Please check the link in your confirmation email."
      />
    );
  }

  // Check expiry
  if (!app.edit_token_expires_at || new Date(app.edit_token_expires_at) < new Date()) {
    return (
      <ErrorPage
        title="Link Expired"
        message="This edit link has expired. Edit links are valid for 7 days from submission. If you need to make changes, please contact us directly."
      />
    );
  }

  // Check status — only allow edits on open applications
  const editableStatuses = ["new", "pending", "under_review"];
  if (!editableStatuses.includes(app.status)) {
    return (
      <ErrorPage
        title="Application Already Reviewed"
        message="Your application has already been reviewed and a decision has been made. If you have questions, please contact us directly."
      />
    );
  }

  const listing = app.listing as Record<string, string> | null;
  const listingAddress = listing
    ? `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`
    : null;

  // Strip the edit token before passing to client (security)
  const { edit_token: _t, ...safeApp } = app;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f7f4" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#1a1a1a" }} className="py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-xl">
            Geaux Home Rentals
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Your Application</h1>
          {listingAddress && (
            <p className="text-gray-500 mt-1">For: {listingAddress}</p>
          )}
          <p className="text-gray-500 text-sm mt-2">
            Applicant: <strong>{app.full_name}</strong> · Submitted {new Date(app.created_at).toLocaleDateString()}
          </p>
        </div>

        <EditApplicationForm application={safeApp} token={token} />
      </div>
    </div>
  );
}

function ErrorPage({
  title = "Link Invalid",
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f7f4" }}>
      <header style={{ backgroundColor: "#1a1a1a" }} className="py-4 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-white font-bold text-xl">
            Geaux Home Rentals
          </Link>
        </div>
      </header>
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold mb-3">{title}</h1>
        <p className="text-gray-500 leading-relaxed mb-8">{message}</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-lg text-white font-semibold"
          style={{ backgroundColor: "#D4A843" }}
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
