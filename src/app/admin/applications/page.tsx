import { supabase } from "@/lib/supabase";
import ApplicationsList from "./ApplicationsList";

export const revalidate = 0;

export default async function AdminApplications() {
  const { data: applications } = await supabase
    .from("applications")
    .select("id, listing_id, full_name, email, phone, gross_monthly_income, desired_move_in, status, screening_questions, created_at, listing:listings(address, monthly_rent)")
    .order("created_at", { ascending: false });

  const { data: listings } = await supabase
    .from("listings")
    .select("id, address")
    .eq("status", "active")
    .order("address");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Applications</h1>
      <ApplicationsList
        applications={applications || []}
        listings={listings || []}
      />
    </div>
  );
}
