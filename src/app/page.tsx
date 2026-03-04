import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Listing } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white" style={{ borderBottom: "2px solid var(--color-navy)" }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-navy)" }}
          >
            Geaux Home Rentals
          </h1>
          <span className="text-gray-500 text-sm hidden sm:block">
            Baton Rouge, Louisiana
          </span>
        </div>
      </header>

      {/* Hero Banner */}
      <section
        className="text-center py-16 md:py-24 px-4"
        style={{ backgroundColor: "var(--color-navy)" }}
      >
        <h2
          className="text-3xl md:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Find Your Next Home in Baton Rouge
        </h2>
        <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Browse available properties and apply online in minutes
        </p>
        <a
          href="#listings"
          className="hero-cta inline-block px-8 py-3 rounded-lg text-lg font-semibold transition-opacity"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "white",
          }}
        >
          View Available Properties
        </a>
      </section>

      {/* Listings */}
      <main id="listings" className="max-w-6xl mx-auto px-4 py-12" style={{ scrollMarginTop: "2rem" }}>
        <h2
          className="text-2xl md:text-3xl font-bold mb-8"
          style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-navy)" }}
        >
          Available Properties
        </h2>

        {!listings || listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg">
              No properties available right now — please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(listings as Listing[]).map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
              >
                {/* Photo */}
                <div className="h-48 bg-gray-200 relative overflow-hidden rounded-t-xl">
                  {listing.photos && listing.photos.length > 0 ? (
                    <img
                      src={listing.photos[0]}
                      alt={listing.address}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" />
                      </svg>
                    </div>
                  )}
                  {/* Available Badge */}
                  <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    Available
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Rent */}
                  <div className="mb-2">
                    <span className="text-2xl font-bold" style={{ color: "var(--color-navy)" }}>
                      ${listing.monthly_rent.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">/mo</span>
                  </div>

                  {/* Property details row */}
                  <div className="flex gap-4 text-sm text-gray-600 mb-2">
                    <span>🛏 {listing.bedrooms} bed</span>
                    <span>🛁 {listing.bathrooms} bath</span>
                    {listing.square_footage && (
                      <span>{listing.square_footage.toLocaleString()} sqft</span>
                    )}
                  </div>

                  {/* Address */}
                  <p className="text-gray-400 text-sm mb-4">
                    {listing.address}, {listing.city}, {listing.state} {listing.zip}
                  </p>

                  {/* View Details Button */}
                  <Link
                    href={`/listing/${listing.slug || listing.id}`}
                    className="btn-navy-gold mt-auto block w-full text-center py-2.5 rounded-lg font-semibold"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-gray-400 text-center py-6 mt-12" style={{ backgroundColor: "var(--color-navy)" }}>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Geaux Home Buyers LLC. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
