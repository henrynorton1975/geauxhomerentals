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

  async function updateStatus(newStatus: string) {
    await fetch(`/api/applications/${applicationId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  return (
    <select
      value={currentStatus}
      onChange={(e) => updateStatus(e.target.value)}
      className="text-sm border border-gray-300 rounded-lg px-3 py-2"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
