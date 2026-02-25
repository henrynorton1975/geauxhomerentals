import { supabase } from "@/lib/supabase";
import { Listing } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import PhotoGallery from "./PhotoGallery";

export const revalidate = 60;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const column = UUID_REGEX.test(id) ? "id" : "slug";
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq(column, id)
    .eq("status", "active")
    .single();

  if (!listing) {
    notFound();
  }

  const l = listing as Listing;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-[#1a1a2e] text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" style={{ color: "#D4A843" }}>
            Geaux Home Rentals
          </Link>
          <Link href="/" className="text-gray-300 hover:text-white text-sm">
            ← All Listings
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Photo Gallery */}
        <PhotoGallery photos={l.photos || []} address={l.address} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold">{l.address}</h1>
            <p className="text-gray-500 mt-1">
              {l.city}, {l.state} {l.zip}
            </p>

            <div className="flex flex-wrap gap-6 mt-6 text-lg">
              <div>
                <span className="font-bold">{l.bedrooms}</span>{" "}
                <span className="text-gray-500">Bedrooms</span>
              </div>
              <div>
                <span className="font-bold">{l.bathrooms}</span>{" "}
                <span className="text-gray-500">Bathrooms</span>
              </div>
              {l.square_footage && (
                <div>
                  <span className="font-bold">
                    {l.square_footage.toLocaleString()}
                  </span>{" "}
                  <span className="text-gray-500">Sq Ft</span>
                </div>
              )}
              <div>
                <span className="font-bold">{l.property_type}</span>
              </div>
            </div>

            {l.description && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-3">About This Property</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {l.description}
                </p>
              </div>
            )}

            {l.utilities_included && l.utilities_included.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-3">Utilities Included</h2>
                <div className="flex flex-wrap gap-2">
                  {l.utilities_included.map((util) => (
                    <span
                      key={util}
                      className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      ✓ {util}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <div className="text-3xl font-bold" style={{ color: "#D4A843" }}>
                ${l.monthly_rent.toLocaleString()}
                <span className="text-gray-400 text-lg font-normal">/month</span>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Security Deposit</span>
                  <span className="font-medium">
                    ${l.security_deposit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Available</span>
                  <span className="font-medium">
                    {new Date(l.available_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pet Policy</span>
                  <span className="font-medium">{l.pet_policy}</span>
                </div>
              </div>

              <Link
                href={`/listing/${l.slug || l.id}/apply`}
                className="block w-full text-center text-white font-bold py-3 rounded-lg mt-6 text-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#D4A843" }}
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#1a1a2e] text-gray-400 text-center py-6 mt-12">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Geaux Home Buyers LLC. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
