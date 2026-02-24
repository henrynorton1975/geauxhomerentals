import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import ApplicationForm from "./ApplicationForm";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!listing) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <header className="bg-[#1a1a2e] text-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" style={{ color: "#D4A843" }}>
            Geaux Home Rentals
          </Link>
          <Link href={`/listing/${id}`} className="text-gray-300 hover:text-white text-sm">
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

        <ApplicationForm listingId={id} />
      </main>
    </div>
  );
}
