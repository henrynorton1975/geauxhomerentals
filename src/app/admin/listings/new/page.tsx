"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewListing() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const get = (name: string) => (fd.get(name) as string) || "";

    const listingData = {
      address: get("address"),
      city: get("city"),
      state: get("state"),
      zip: get("zip"),
      monthly_rent: parseFloat(get("monthly_rent")),
      security_deposit: parseFloat(get("security_deposit")),
      bedrooms: parseInt(get("bedrooms")),
      bathrooms: parseFloat(get("bathrooms")),
      square_footage: get("square_footage") ? parseInt(get("square_footage")) : null,
      property_type: get("property_type"),
      available_date: get("available_date"),
      pet_policy: get("pet_policy"),
      description: get("description") || null,
      contact_phone: get("contact_phone") || null,
      contact_email: get("contact_email") || null,
      status: "active",
    };

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingData),
      });

      if (!res.ok) throw new Error("Failed to create listing");

      router.push("/admin/listings");
      router.refresh();
    } catch {
      setError("Failed to create listing. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Listing</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label>Street Address *</label>
            <input type="text" name="address" required />
          </div>
          <div>
            <label>City *</label>
            <input type="text" name="city" defaultValue="Baton Rouge" required />
          </div>
          <div>
            <label>State *</label>
            <input type="text" name="state" defaultValue="LA" required />
          </div>
          <div>
            <label>Zip Code *</label>
            <input type="text" name="zip" required />
          </div>
          <div>
            <label>Monthly Rent *</label>
            <input type="number" name="monthly_rent" step="0.01" required />
          </div>
          <div>
            <label>Security Deposit *</label>
            <input type="number" name="security_deposit" step="0.01" required />
          </div>
          <div>
            <label>Bedrooms *</label>
            <input type="number" name="bedrooms" required />
          </div>
          <div>
            <label>Bathrooms *</label>
            <input type="number" name="bathrooms" step="0.5" required />
          </div>
          <div>
            <label>Square Footage</label>
            <input type="number" name="square_footage" />
          </div>
          <div>
            <label>Property Type *</label>
            <select name="property_type" required>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Duplex">Duplex</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Condo">Condo</option>
            </select>
          </div>
          <div>
            <label>Available Date *</label>
            <input type="date" name="available_date" required />
          </div>
          <div>
            <label>Pet Policy *</label>
            <select name="pet_policy" required>
              <option value="Allowed">Allowed</option>
              <option value="Not Allowed">Not Allowed</option>
              <option value="Case by Case">Case by Case</option>
            </select>
          </div>
          <div>
            <label>Contact Phone</label>
            <input type="tel" name="contact_phone" placeholder="(555) 555-5555" />
          </div>
          <div>
            <label>Contact Email</label>
            <input type="email" name="contact_email" placeholder="email@example.com" />
          </div>
          <div className="md:col-span-2">
            <label>Description</label>
            <textarea name="description" rows={4} placeholder="Property features, neighborhood info, notes..." />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#D4A843" }}
          >
            {saving ? "Creating..." : "Create Listing"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
