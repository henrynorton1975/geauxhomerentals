import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import ApplicationForm from "./ApplicationForm";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ApplyPage({
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

  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  return (
    <div className="min-h-screen">
      {googleApiKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`}
          strategy="lazyOnload"
        />
      )}
      <header className="bg-[#1a1a2e] text-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" style={{ color: "#D4A843" }}>
            Geaux Home Rentals
          </Link>
          <Link href={`/listing/${listing.slug || listing.id}`} className="text-gray-300 hover:text-white text-sm">
            ← Back to Listing
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex items-center justify-between">
          <div>
            <p className="font-bold">{listing.address}</p>
            <p className="text-gray-500 text-sm">{listing.city}, {listing.state} {listing.zip}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg" style={{ color: "#D4A843" }}>
              ${Number(listing.monthly_rent).toLocaleString()}/mo
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Rental Application</h1>
        <p className="text-gray-500 mb-8">
          Please fill out all required fields. Fields marked with * are required.
        </p>

        <ApplicationForm listingId={listing.id} />
      </main>
    </div>
  );
}
