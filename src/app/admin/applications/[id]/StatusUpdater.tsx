"use client";

import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Denied" },
  { value: "lease_signed", label: "Lease Signed" },
];

export default function StatusUpdater({ applicationId, currentStatus }: { applicationId: string; currentStatus: string }) {
  const router = useRouter();

  function getAuthHeaders() {
    const adminPw = sessionStorage.getItem("admin_authenticated") || "";
    return {
      "Content-Type": "application/json",
      "x-admin-password": adminPw,
    };
  }

  async function updateStatus(newStatus: string) {
    const res = await fetch(`/api/applications/${applicationId}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) router.refresh();
  }

  async function archiveApplication() {
    if (!confirm("Archive this application? It will be hidden from the main list but not deleted.")) return;
    const res = await fetch(`/api/applications/${applicationId}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: "archived" }),
    });
    if (res.ok) router.push("/admin/applications");
  }

  if (currentStatus === "archived") {
    return (
      <button
        onClick={() => updateStatus("new")}
        className="text-sm border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
      >
        Restore Application
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentStatus}
        onChange={(e) => updateStatus(e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-2"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <button
        onClick={archiveApplication}
        className="text-sm border border-red-200 text-red-600 rounded-lg px-3 py-2 hover:bg-red-50 transition-colors"
      >
        Archive
      </button>
    </div>
  );
}
