import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Listing } from "@/lib/types";
import ListingActions from "./ListingActions";

export const revalidate = 0;

export default async function AdminListings() {
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Listings</h1>
        <Link
          href="/admin/listings/new"
          className="text-white px-4 py-2 rounded-lg font-medium hover:opacity-90"
          style={{ backgroundColor: "#D4A843" }}
        >
          + New Listing
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No listings yet.</p>
          <Link href="/admin/listings/new" className="text-blue-600 hover:underline mt-2 inline-block">
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(listings as Listing[]).map((listing) => (
            <div key={listing.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold">{listing.address}</h3>
                  <span className={`badge badge-${listing.status}`}>
                    {listing.status}
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
    </div>
  );
}
