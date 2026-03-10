"use client";

import { useState } from "react";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  under_review: "Under Review",
  approved: "Approved",
  denied: "Denied",
  lease_signed: "Lease Signed",
};

function hasFlags(screening: Record<string, { answer: boolean }>) {
  if (!screening) return false;
  return Object.entries(screening).some(([key, val]) => {
    if (key === "rent_on_first") return val.answer === false;
    return val.answer === true;
  });
}

interface Listing {
  id: string;
  address: string;
}

interface ApplicationsListProps {
  applications: Record<string, unknown>[];
  listings: Listing[];
}

export default function ApplicationsList({ applications, listings }: ApplicationsListProps) {
  const [selectedListing, setSelectedListing] = useState("");

  const active = applications.filter((app) => app.status !== "archived");
  const filtered = selectedListing
    ? active.filter((app) => app.listing_id === selectedListing)
    : active;

  return (
    <div>
      <div className="mb-6">
        <select
          value={selectedListing}
          onChange={(e) => setSelectedListing(e.target.value)}
          className="w-full md:w-auto min-w-[300px]"
        >
          <option value="">All Properties</option>
          {listings.map((l) => (
            <option key={l.id} value={l.id}>{l.address}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">
            {selectedListing ? "No applications for this property." : "No applications yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const listing = app.listing as Record<string, unknown> | null;
            const screening = app.screening_questions as Record<string, { answer: boolean }>;
            const flagged = hasFlags(screening);
            const lastEdited = app.last_edited_at as string | null;

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
                      {lastEdited && (
                        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          ✏️ Edited {new Date(lastEdited).toLocaleDateString()}
                        </span>
                      )}
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
