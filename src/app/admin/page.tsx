import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminDashboard() {
  const { data: listings } = await supabase.from("listings").select("id, status");
  const { data: applications } = await supabase.from("applications").select("id, status, created_at");

  const activeListings = listings?.filter((l) => l.status === "active").length || 0;
  const totalListings = listings?.length || 0;

  const now = new Date();
  const thisMonth = applications?.filter((a) => {
    const d = new Date(a.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length || 0;

  const pending = applications?.filter((a) => a.status === "new" || a.status === "under_review").length || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Active Listings</p>
          <p className="text-3xl font-bold mt-1">{activeListings}</p>
          <p className="text-gray-400 text-xs mt-1">{totalListings} total</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Applications This Month</p>
          <p className="text-3xl font-bold mt-1">{thisMonth}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Pending Review</p>
          <p className="text-3xl font-bold mt-1" style={{ color: pending > 0 ? "#D4A843" : undefined }}>{pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Total Applications</p>
          <p className="text-3xl font-bold mt-1">{applications?.length || 0}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/listings/new" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-lg mb-1">+ Create New Listing</h3>
          <p className="text-gray-500 text-sm">Add a new vacant property</p>
        </Link>
        <Link href="/admin/applications" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-lg mb-1">View Applications</h3>
          <p className="text-gray-500 text-sm">Review and manage incoming applications</p>
        </Link>
      </div>
    </div>
  );
}
