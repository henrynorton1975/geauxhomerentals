import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import StatusUpdater from "./StatusUpdater";
import NoteAdder from "./NoteAdder";

export const revalidate = 0;

const SCREENING_LABELS: Record<string, string> = {
  evicted: "Ever evicted or asked to move",
  broken_lease: "Ever broken a lease",
  refused_rent: "Refused to pay rent",
  income_interruption: "Income interruption concerns",
  outstanding_judgments: "Outstanding judgments",
  foreclosure: "Foreclosure in past 7 years",
  bankruptcy: "Filed for bankruptcy",
  criminal_proceedings: "Party to criminal proceedings",
  felony: "Felony conviction",
  rent_on_first: "Able to pay rent on the 1st",
};

export default async function ApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: app } = await supabase
    .from("applications")
    .select("*, listing:listings(address, city, state, zip, monthly_rent)")
    .eq("id", id)
    .single();

  if (!app) notFound();

  const { data: notes } = await supabase
    .from("application_notes")
    .select("*")
    .eq("application_id", id)
    .order("created_at", { ascending: false });

  const listing = app.listing as Record<string, unknown> | null;
  const screening = (app.screening_questions || {}) as Record<string, { answer: boolean; details: string }>;
  const incomeRatio = listing ? (Number(app.gross_monthly_income) / Number(listing.monthly_rent)).toFixed(1) : null;

  return (
    <div>
      <Link href="/admin/applications" className="text-gray-500 hover:text-gray-700 text-sm mb-4 inline-block">
        ← Back to Applications
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{app.full_name}</h1>
          {listing && (
            <p className="text-gray-500">
              Applied for: {listing.address as string}, {listing.city as string}, {listing.state as string} {listing.zip as string}
            </p>
          )}
        </div>
        <StatusUpdater applicationId={id} currentStatus={app.status} />
      </div>

      {/* Income Check */}
      {incomeRatio && (
        <div className={`p-4 rounded-lg mb-6 ${Number(incomeRatio) >= 3 ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          <p className="font-medium">
            Income-to-Rent Ratio: {incomeRatio}x
            {Number(incomeRatio) >= 3 ? " ✓ Meets 3x requirement" : " ⚠ Below 3x requirement"}
          </p>
          <p className="text-sm mt-1">
            Income: ${Number(app.gross_monthly_income).toLocaleString()}/mo · Rent: ${Number(listing?.monthly_rent).toLocaleString()}/mo
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{app.full_name}</span></div>
              <div><span className="text-gray-500">DOB:</span> <span className="font-medium">{new Date(app.date_of_birth).toLocaleDateString()}</span></div>
              <div><span className="text-gray-500">Email:</span> <a href={`mailto:${app.email}`} className="font-medium text-blue-600">{app.email}</a></div>
              <div><span className="text-gray-500">Phone:</span> <a href={`tel:${app.phone}`} className="font-medium text-blue-600">{app.phone}</a></div>
              <div><span className="text-gray-500">Move-in:</span> <span className="font-medium">{new Date(app.desired_move_in).toLocaleDateString()}</span></div>
              <div><span className="text-gray-500">Applying as:</span> <span className="font-medium">{app.applying_as}</span></div>
            </div>
          </section>

          {/* Current Residence */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">Current Residence</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Type:</span> <span className="font-medium">{app.current_housing_type}</span></div>
              <div><span className="text-gray-500">Address:</span> <span className="font-medium">{app.current_address}, {app.current_city}, {app.current_state} {app.current_zip}</span></div>
              <div><span className="text-gray-500">Duration:</span> <span className="font-medium">{app.current_date_from} to {app.current_date_to}</span></div>
              <div><span className="text-gray-500">Rent:</span> <span className="font-medium">${Number(app.current_monthly_rent).toLocaleString()}/mo</span></div>
              <div><span className="text-gray-500">Landlord:</span> <span className="font-medium">{app.current_landlord_name}</span></div>
              <div><span className="text-gray-500">Landlord Phone:</span> <a href={`tel:${app.current_landlord_phone}`} className="font-medium text-blue-600">{app.current_landlord_phone}</a></div>
            </div>
          </section>

          {/* Employment */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">Employment & Income</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Status:</span> <span className="font-medium">{app.work_status}</span></div>
              <div><span className="text-gray-500">Employer:</span> <span className="font-medium">{app.employer_name}</span></div>
              <div><span className="text-gray-500">Title:</span> <span className="font-medium">{app.job_title}</span></div>
              <div><span className="text-gray-500">Income:</span> <span className="font-medium">${Number(app.gross_monthly_income).toLocaleString()}/mo</span></div>
              <div><span className="text-gray-500">Duration:</span> <span className="font-medium">{app.employment_date_from} to {app.employment_date_to}</span></div>
              <div><span className="text-gray-500">Supervisor:</span> <span className="font-medium">{app.supervisor_name}</span></div>
              <div><span className="text-gray-500">Supervisor Phone:</span> <a href={`tel:${app.supervisor_phone}`} className="font-medium text-blue-600">{app.supervisor_phone}</a></div>
            </div>
          </section>

          {/* Screening Questions */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">Screening Questions</h2>
            <div className="space-y-3">
              {Object.entries(SCREENING_LABELS).map(([key, label]) => {
                const q = screening[key];
                if (!q) return null;
                const isFlag = key === "rent_on_first" ? !q.answer : q.answer;
                return (
                  <div key={key} className={`p-3 rounded-lg text-sm ${isFlag ? "bg-red-50" : "bg-gray-50"}`}>
                    <div className="flex items-center justify-between">
                      <span>{label}</span>
                      <span className={`font-bold ${isFlag ? "text-red-600" : "text-green-600"}`}>
                        {q.answer ? "Yes" : "No"}
                      </span>
                    </div>
                    {q.details && <p className="text-gray-600 mt-1 italic">{q.details}</p>}
                  </div>
                );
              })}
            </div>
            {app.additional_info && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                <p className="font-medium text-blue-800">Additional Info:</p>
                <p className="text-blue-700 mt-1">{app.additional_info}</p>
              </div>
            )}
          </section>

          {/* Pets */}
          {app.has_pets && app.pets && (app.pets as Array<Record<string, string>>).length > 0 && (
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg mb-4 border-b pb-2">Pets</h2>
              {(app.pets as Array<Record<string, string>>).map((pet, i) => (
                <div key={i} className="text-sm mb-2">
                  <span className="font-medium">{pet.name}</span> — {pet.type_breed_size}, {pet.sex}, {pet.neutered_spayed === "Yes" ? "Fixed" : "Not Fixed"}, {pet.indoor_outdoor}
                </div>
              ))}
            </section>
          )}

          {/* References */}
          {app.references && (app.references as Array<Record<string, string>>).length > 0 && (
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg mb-4 border-b pb-2">References</h2>
              {(app.references as Array<Record<string, string>>).map((ref, i) => (
                <div key={i} className="text-sm mb-3">
                  <span className="font-medium">{ref.name}</span> — {ref.relationship}
                  <br />
                  <a href={`tel:${ref.phone}`} className="text-blue-600">{ref.phone}</a>
                  {ref.email && <> · <a href={`mailto:${ref.email}`} className="text-blue-600">{ref.email}</a></>}
                </div>
              ))}
            </section>
          )}

          {/* Signature */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">Authorization & Signature</h2>
            <div className="text-sm">
              <p><span className="text-gray-500">Consent:</span> <span className="font-medium text-green-600">{app.consent_agreed ? "Agreed" : "Not Agreed"}</span></p>
              <p className="mt-1"><span className="text-gray-500">Signed as:</span> <span className="font-medium font-serif text-lg">{app.signature_name}</span></p>
              <p className="mt-1"><span className="text-gray-500">Date:</span> <span className="font-medium">{new Date(app.signature_date).toLocaleString()}</span></p>
            </div>
          </section>
        </div>

        {/* Sidebar - Notes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
            <h2 className="font-bold text-lg mb-4">Internal Notes</h2>
            <NoteAdder applicationId={id} />
            <div className="mt-4 space-y-3">
              {notes && notes.map((note: Record<string, unknown>) => (
                <div key={note.id as string} className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p>{note.note as string}</p>
                  <p className="text-gray-400 text-xs mt-1">{new Date(note.created_at as string).toLocaleString()}</p>
                </div>
              ))}
              {(!notes || notes.length === 0) && (
                <p className="text-gray-400 text-sm">No notes yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
