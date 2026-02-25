import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Listing } from "@/lib/types";
import ListingsFilter from "./ListingsFilter";

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
        <ListingsFilter listings={listings as Listing[]} />
      )}
    </div>
  );
}
