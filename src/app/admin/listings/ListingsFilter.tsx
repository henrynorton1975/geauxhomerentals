"use client";

import { useState } from "react";
import Link from "next/link";
import { Listing } from "@/lib/types";
import ListingActions from "./ListingActions";

type Filter = "all" | "active" | "inactive";

export default function ListingsFilter({ listings }: { listings: Listing[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = {
    all: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    inactive: listings.filter((l) => l.status === "inactive").length,
  };

  const filtered = filter === "all" ? listings : listings.filter((l) => l.status === filter);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Archived" },
  ];

  return (
    <>
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
            <span
              className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                filter === tab.key ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No {filter === "all" ? "" : filter === "active" ? "active" : "archived"} listings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((listing) => (
            <div key={listing.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold">{listing.address}</h3>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      listing.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {listing.status === "active" ? "Active" : "Archived"}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  {listing.city}, {listing.state} {listing.zip} · {listing.bedrooms}bd / {listing.bathrooms}ba · ${Number(listing.monthly_rent).toLocaleString()}/mo
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/listing/${listing.id}`} className="text-sm text-gray-500 hover:text-gray-700">
                  View
                </Link>
                <ListingActions listingId={listing.id} currentStatus={listing.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
