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
      <header className="bg-[#1a1a2e] text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#D4A843" }}>
              Geaux Home Rentals
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              Quality rental homes in Baton Rouge
            </p>
          </div>
        </div>
      </header>

      {/* Listings */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Available Properties</h2>

        {!listings || listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg">
              No properties available right now. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(listings as Listing[]).map((listing) => (
              <Link
                key={listing.id}
                href={`/listing/${listing.slug || listing.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Photo */}
                <div className="h-48 bg-gray-200 relative">
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
                  <div
                    className="absolute top-3 right-3 text-white text-lg font-bold px-3 py-1 rounded-lg"
                    style={{ backgroundColor: "#D4A843" }}
                  >
                    ${listing.monthly_rent.toLocaleString()}/mo
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-bold text-lg">{listing.address}</h3>
                  <p className="text-gray-500 text-sm">
                    {listing.city}, {listing.state} {listing.zip}
                  </p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-600">
                    <span>{listing.bedrooms} bed</span>
                    <span>{listing.bathrooms} bath</span>
                    {listing.square_footage && (
                      <span>{listing.square_footage.toLocaleString()} sqft</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-500">
                      {listing.property_type}
                    </span>
                    <span className="text-sm text-gray-500">
                      Available{" "}
                      {new Date(listing.available_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] text-gray-400 text-center py-6 mt-12">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Geaux Home Buyers LLC. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
