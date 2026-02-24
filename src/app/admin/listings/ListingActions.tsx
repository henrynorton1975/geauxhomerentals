"use client";

import { useRouter } from "next/navigation";

export default function ListingActions({ listingId, currentStatus }: { listingId: string; currentStatus: string }) {
  const router = useRouter();

  async function toggleStatus() {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await fetch(`/api/listings/${listingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  return (
    <button
      onClick={toggleStatus}
      className={`text-sm px-3 py-1 rounded-lg ${
        currentStatus === "active"
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-green-50 text-green-600 hover:bg-green-100"
      }`}
    >
      {currentStatus === "active" ? "Archive" : "Acivate"}
    </button>
  );
}
