"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NoteAdder({ applicationId }: { applicationId: string }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function addNote() {
    if (!note.trim()) return;
    setSaving(true);
    await fetch(`/api/applications/${applicationId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setNote("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note..."
        rows={3}
        className="text-sm"
      />
      <button
        onClick={addNote}
        disabled={saving || !note.trim()}
        className="mt-2 w-full text-white text-sm py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "#D4A843" }}
      >
        {saving ? "Saving..." : "Add Note"}
      </button>
    </div>
  );
}
