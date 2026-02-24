import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const revalidate = 0;

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  under_review: "Under Review",
  approved: "Approved",
  denied: "Denied",
  lease_signed: "Lease Signed",
};

export default async function AdminApplications() {
  const { data: applications } = await supabase
    .from("applications")
    .select("id, full_name, email, phone, gross_monthly_income, desired_move_in, status, screening_questions, created_at, listing:listings(address, monthly_rent)")
    .order("created_at", { ascending: false });

  function hasFlags(screening: Record<string, { answer: boolean }>) {
    if (!screening) return false;
    return Object.entries(screening).some(([key, val]) => {
      if (key === "rent_on_first") return val.answer === false;
      return val.answer === true;
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Applications</h1>

      {!applications || applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No applications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app: Record<string, unknown>) => {
            const listing = app.listing as Record<string, unknown> | null;
            const screening = app.screening_questions as Record<string, { answer: boolean }>;
            const flagged = hasFlags(screening);

            return (
              <Link
                key={app.id as string}
                href={`/admin/applications/${app.id}`}
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{app.full_name as string}</h3>
                      <span className={`badge badge-${(app.status as string).replace(" ", "-")}`}>
                        {STATUS_LABELS[app.status as string] || app.status as string}
                      </span>
                      {flagged && (
                        <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                          <span className="flag-yes" /> Flags
                        </span>
                      )}
                    </div>
                    {listing && (
                      <p className="text-gray-500 text-sm mt-1">
                        Applied for: {listing.address as string} · ${Number(listing.monthly_rent).toLocaleString()}/mo
                      </p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>Income: ${Number(app.gross_monthly_income).toLocaleString()}/mo</span>
                      <span>Move-in: {new Date(app.desired_move_in as string).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(app.created_at as string).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
