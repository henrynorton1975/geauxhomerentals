"use client";

import { useState } from "react";

const SCREENING_QUESTIONS = [
  { key: "evicted", text: "Have you ever been evicted or asked to move from any tenancy?" },
  { key: "broken_lease", text: "Have you ever broken a rental agreement or lease?" },
  { key: "refused_rent", text: "Have you ever willfully and intentionally refused to pay rent when due?" },
  { key: "income_interruption", text: "Do you know of anything that might interrupt your income or ability to pay rent?" },
  { key: "outstanding_judgments", text: "Are there any outstanding judgments against you?" },
  { key: "foreclosure", text: "Have you had property foreclosed upon or given title/deed in lieu of foreclosure in the past 7 years?" },
  { key: "bankruptcy", text: "Have you ever filed a petition of bankruptcy? (If yes, provide dates and discharge status)" },
  { key: "criminal_proceedings", text: "Are you a named party to a criminal proceeding, lawsuit, or unlawful detainer filing?" },
  { key: "felony", text: "Have you or anyone in your household ever been convicted of a felony?" },
  { key: "rent_on_first", text: "Rent is due in advance on the first day of each month. Are you able to fulfill this requirement?" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

interface FormSection {
  title: string;
  number: number;
}

function SectionHeader({ title, number }: FormSection) {
  return (
    <div className="border-b-2 border-gray-200 pb-2 mb-6 mt-10 first:mt-0">
      <h2 className="text-xl font-bold">
        <span className="text-gray-400 mr-2">Section {number}:</span>
        {title}
      </h2>
    </div>
  );
}

function RequiredStar() {
  return <span className="text-red-500 ml-1">*</span>;
}

export default function ApplicationForm({ listingId }: { listingId: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Section 2: Additional Occupants
  const [occupants, setOccupants] = useState<Array<{ name: string; email: string; relationship: string }>>([]);

  // Section 5: Previous Residences
  const [prevResidences, setPrevResidences] = useState<Array<Record<string, string>>>([]);

  // Section 7: Previous Employment
  const [prevEmployment, setPrevEmployment] = useState<Array<Record<string, string>>>([]);

  // Section 8: References
  const [references, setReferences] = useState<Array<Record<string, string>>>([
    { name: "", phone: "", email: "", relationship: "", length: "" },
  ]);

  // Section 9: Pets
  const [hasPets, setHasPets] = useState(false);
  const [pets, setPets] = useState<Array<Record<string, string>>>([]);

  // Section 10: Screening Questions
  const [screening, setScreening] = useState<Record<string, { answer: boolean; details: string }>>(
    Object.fromEntries(SCREENING_QUESTIONS.map((q) => [q.key, { answer: false, details: "" }]))
  );

  const [consent, setConsent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const get = (name: string) => (fd.get(name) as string) || "";

    const applicationData = {
      listing_id: listingId,
      // Section 1
      full_name: get("full_name"),
      date_of_birth: get("date_of_birth"),
      email: get("email"),
      phone: get("phone"),
      desired_move_in: get("desired_move_in"),
      applying_as: get("applying_as"),
      // Section 2
      additional_occupants: occupants,
      // Section 3
      guarantor_name: get("guarantor_name") || null,
      guarantor_email: get("guarantor_email") || null,
      guarantor_phone: get("guarantor_phone") || null,
      // Section 4
      current_housing_type: get("current_housing_type"),
      current_address: get("current_address"),
      current_city: get("current_city"),
      current_state: get("current_state"),
      current_zip: get("current_zip"),
      current_date_from: get("current_date_from"),
      current_date_to: get("current_date_to"),
      current_monthly_rent: parseFloat(get("current_monthly_rent")) || 0,
      current_landlord_name: get("current_landlord_name"),
      current_landlord_email: get("current_landlord_email") || null,
      current_landlord_phone: get("current_landlord_phone"),
      // Section 5
      previous_residences: prevResidences,
      // Section 6
      work_status: get("work_status"),
      employer_name: get("employer_name"),
      job_title: get("job_title"),
      gross_monthly_income: parseFloat(get("gross_monthly_income")) || 0,
      employment_date_from: get("employment_date_from"),
      employment_date_to: get("employment_date_to"),
      supervisor_name: get("supervisor_name"),
      supervisor_phone: get("supervisor_phone"),
      supervisor_email: get("supervisor_email") || null,
      // Section 7
      previous_employment: prevEmployment,
      // Section 8
      applicant_references: references,
      // Section 9
      has_pets: hasPets,
      pets: pets,
      // Section 10
      screening_questions: screening,
      additional_info: get("additional_info") || null,
      // Section 11
      consent_agreed: consent,
      signature_name: get("signature_name"),
      signature_date: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit application");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Thank you for applying. We will review your application and get back to
          you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* ====== SECTION 1: Personal Information ====== */}
      <SectionHeader title="Personal Information" number={1} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label>Full Name<RequiredStar /></label>
          <input type="text" name="full_name" required />
        </div>
        <div>
          <label>Date of Birth<RequiredStar /></label>
          <input type="date" name="date_of_birth" required />
        </div>
        <div>
          <label>Email Address<RequiredStar /></label>
          <input type="email" name="email" required />
        </div>
        <div>
          <label>Phone Number<RequiredStar /></label>
          <input type="tel" name="phone" required />
        </div>
        <div>
          <label>Desired Move-in Date<RequiredStar /></label>
          <input type="date" name="desired_move_in" required />
        </div>
        <div>
          <label>Applying As<RequiredStar /></label>
          <select name="applying_as" required>
            <option value="Tenant">Tenant</option>
            <option value="Co-applicant">Co-applicant</option>
          </select>
        </div>
      </div>

      {/* ====== SECTION 2: Additional Occupants ====== */}
      <SectionHeader title="Additional Occupants" number={2} />
      <p className="text-gray-500 text-sm mb-4">
        List anyone else who will be living in the property.
      </p>
      {occupants.map((occ, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg relative">
          <div>
            <label>Occupant Name</label>
            <input
              type="text"
              value={occ.name}
              onChange={(e) => {
                const updated = [...occupants];
                updated[i].name = e.target.value;
                setOccupants(updated);
              }}
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={occ.email}
              onChange={(e) => {
                const updated = [...occupants];
                updated[i].email = e.target.value;
                setOccupants(updated);
              }}
            />
          </div>
          <div>
            <label>Relationship</label>
            <input
              type="text"
              value={occ.relationship}
              onChange={(e) => {
                const updated = [...occupants];
                updated[i].relationship = e.target.value;
                setOccupants(updated);
              }}
            />
          </div>
          <button
            type="button"
            className="absolute top-2 right-2 text-red-400 hover:text-red-600"
            onClick={() => setOccupants(occupants.filter((_, j) => j !== i))}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-sm font-medium px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        onClick={() => setOccupants([...occupants, { name: "", email: "", relationship: "" }])}
      >
        + Add Occupant
      </button>

      {/* ====== SECTION 3: Guarantor / Co-signer ====== */}
      <SectionHeader title="Guarantor / Co-signer" number={3} />
      <p className="text-gray-500 text-sm mb-4">
        Only fill this out if applicable.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label>Guarantor Name</label>
          <input type="text" name="guarantor_name" />
        </div>
        <div>
          <label>Guarantor Email</label>
          <input type="email" name="guarantor_email" />
        </div>
        <div>
          <label>Guarantor Phone</label>
          <input type="tel" name="guarantor_phone" />
        </div>
      </div>

      {/* ====== SECTION 4: Current Residence ====== */}
      <SectionHeader title="Current Residence" number={4} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Housing Type<RequiredStar /></label>
          <select name="current_housing_type" required>
            <option value="">Select...</option>
            <option value="Rental">Rental</option>
            <option value="Owned">Owned</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label>Street Address<RequiredStar /></label>
          <input type="text" name="current_address" required />
        </div>
        <div>
          <label>City<RequiredStar /></label>
          <input type="text" name="current_city" required />
        </div>
        <div>
          <label>State<RequiredStar /></label>
          <select name="current_state" required>
            <option value="">Select...</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Zip Code<RequiredStar /></label>
          <input type="text" name="current_zip" required />
        </div>
        <div>
          <label>Date From (Month/Year)<RequiredStar /></label>
          <input type="month" name="current_date_from" required />
        </div>
        <div>
          <label>Date To (Month/Year or Present)<RequiredStar /></label>
          <input type="text" name="current_date_to" placeholder="MM/YYYY or Present" required />
        </div>
        <div>
          <label>Monthly Rent<RequiredStar /></label>
          <input type="number" name="current_monthly_rent" step="0.01" required />
        </div>
        <div>
          <label>Landlord/Manager Name<RequiredStar /></label>
          <input type="text" name="current_landlord_name" required />
        </div>
        <div>
          <label>Landlord Email</label>
          <input type="email" name="current_landlord_email" />
        </div>
        <div>
          <label>Landlord Phone<RequiredStar /></label>
          <input type="tel" name="current_landlord_phone" required />
        </div>
      </div>

      {/* ====== SECTION 5: Previous Residences ====== */}
      <SectionHeader title="Previous Residence(s)" number={5} />
      {prevResidences.map((res, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-lg mb-4 relative">
          <button
            type="button"
            className="absolute top-2 right-2 text-red-400 hover:text-red-600"
            onClick={() => setPrevResidences(prevResidences.filter((_, j) => j !== i))}
          >
            ✕
          </button>
          <p className="font-medium mb-3">Previous Residence {i + 1}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>Housing Type</label>
              <select value={res.housing_type || ""} onChange={(e) => { const u = [...prevResidences]; u[i] = { ...u[i], housing_type: e.target.value }; setPrevResidences(u); }}>
                <option value="">Select...</option>
                <option value="Rental">Rental</option>
                <option value="Owned">Owned</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label>Street Address</label>
              <input type="text" value={res.address || ""} onChange={(e) => { const u = [...prevResidences]; u[i] = { ...u[i], address: e.target.value }; setPrevResidences(u); }} />
            </div>
            <div>
              <label>City</label>
              <input type="text" value={res.city || ""} onChange={(e) => { const u = [...prevResidences]; u[i] = { ...u[i], city: e.target.value }; setPrevResidences(u); }} />
            </div>
            <div>
              <label>State</label>
              <select value={res.state || ""} onChange={(e) => { const u = [...prevResidences]; u[i] = { ...u[i], state: e.target.value }; setPrevResidences(u); }}>
                <option value="">Select...</option>
                {US_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div><label>Zip Code</label><input type="text" value={res.zip || ""} onChange={(e) => { const u = [...prevResidences]; u[i] = { ...u[i], zip: e.target.value }; setPrevResidences(u); }} /></div>
            <div><label>Date From</label><input type="month" value={res.date_from || ""} onChange={(e) => { const u = [...prevResidences]; u[i] = { ...u[i], date_from: e.target.value }; setPrevResidences(u); }} /></div>
            <div><label>Date To</label><input type="text" placeholder="MM/YYYY or Present" value={res.date_to || ""} onChange={(e) => { const u = [...prevResidences]; u[i] = { ...u[i], date_to: e.target.value }; setPrevResidences(u); }} /></div>
            <div><label>Monthly Rent</label><input type="number" step="0.01" value={res.monthly_rent || ""} onChange={(e) => { const u = [...prevResidences]; u[i] = { ...u[i], monthly_rent: e.target.value }; setPrevResidences(u); }} /></div>
            <div><label>Landlord Name</label><input type="text" value={res.landlord_name || ""} onChange={(e) => { const u = [...prevResidences]; u[i] = { ...u[i], landlord_name: e.target.value }; setPrevResidences(u); }} /></div>
            <div><label>Landlord Email</label><input type="email" value={res.landlord_email || ""} onChange={(e) => { const u = [...prevResidences]; u[i] = { ...u[i], landlord_email: e.target.value }; setPrevResidences(u); }} /></div>
            <div><label>Landlord Phone</label><input type="tel" value={res.landlord_phone || ""} onChange={(e) => { const u = [...prevResidences]; u[i] = { ...u[i], landlord_phone: e.target.value }; setPrevResidences(u); }} /></div>
          </div>
        </div>
      ))}
      <button type="button" className="text-sm font-medium px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" onClick={() => setPrevResidences([...prevResidences, {}])}>
        + Add Previous Residence
      </button>

      {/* ====== SECTION 6: Current Employment ====== */}
      <SectionHeader title="Current Employment & Income" number={6} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Work Status<RequiredStar /></label>
          <select name="work_status" required>
            <option value="">Select...</option>
            <option value="Employed">Employed</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="Retired">Retired</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label>Employer Name<RequiredStar /></label>
          <input type="text" name="employer_name" required />
        </div>
        <div>
          <label>Job Title<RequiredStar /></label>
          <input type="text" name="job_title" required />
        </div>
        <div>
          <label>Gross Monthly Income<RequiredStar /></label>
          <input type="number" name="gross_monthly_income" step="0.01" required />
        </div>
        <div>
          <label>Date From<RequiredStar /></label>
          <input type="month" name="employment_date_from" required />
        </div>
        <div>
          <label>Date To<RequiredStar /></label>
          <input type="text" name="employment_date_to" placeholder="MM/YYYY or Present" required />
        </div>
        <div>
          <label>Supervisor Name<RequiredStar /></label>
          <input type="text" name="supervisor_name" required />
        </div>
        <div>
          <label>Supervisor Phone<RequiredStar /></label>
          <input type="tel" name="supervisor_phone" required />
        </div>
        <div>
          <label>Supervisor Email</label>
          <input type="email" name="supervisor_email" />
        </div>
      </div>

      {/* ====== SECTION 7: Previous Employment ====== */}
      <SectionHeader title="Previous Employment" number={7} />
      {prevEmployment.map((emp, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-lg mb-4 relative">
          <button type="button" className="absolute top-2 right-2 text-red-400 hover:text-red-600" onClick={() => setPrevEmployment(prevEmployment.filter((_, j) => j !== i))}>✕</button>
          <p className="font-medium mb-3">Previous Employer {i + 1}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label>Work Status</label><select value={emp.work_status || ""} onChange={(e) => { const u = [...prevEmployment]; u[i] = { ...u[i], work_status: e.target.value }; setPrevEmployment(u); }}><option value="">Select...</option><option value="Employed">Employed</option><option value="Self-Employed">Self-Employed</option><option value="Retired">Retired</option><option value="Other">Other</option></select></div>
            <div><label>Employer Name</label><input type="text" value={emp.employer_name || ""} onChange={(e) => { const u = [...prevEmployment]; u[i] = { ...u[i], employer_name: e.target.value }; setPrevEmployment(u); }} /></div>
            <div><label>Job Title</label><input type="text" value={emp.job_title || ""} onChange={(e) => { const u = [...prevEmployment]; u[i] = { ...u[i], job_title: e.target.value }; setPrevEmployment(u); }} /></div>
            <div><label>Gross Monthly Income</label><input type="number" step="0.01" value={emp.gross_monthly_income || ""} onChange={(e) => { const u = [...prevEmployment]; u[i] = { ...u[i], gross_monthly_income: e.target.value }; setPrevEmployment(u); }} /></div>
            <div><label>Date From</label><input type="month" value={emp.date_from || ""} onChange={(e) => { const u = [...prevEmployment]; u[i] = { ...u[i], date_from: e.target.value }; setPrevEmployment(u); }} /></div>
            <div><label>Date To</label><input type="text" placeholder="MM/YYYY" value={emp.date_to || ""} onChange={(e) => { const u = [...prevEmployment]; u[i] = { ...u[i], date_to: e.target.value }; setPrevEmployment(u); }} /></div>
            <div><label>Supervisor Name</label><input type="text" value={emp.supervisor_name || ""} onChange={(e) => { const u = [...prevEmployment]; u[i] = { ...u[i], supervisor_name: e.target.value }; setPrevEmployment(u); }} /></div>
            <div><label>Supervisor Phone</label><input type="tel" value={emp.supervisor_phone || ""} onChange={(e) => { const u = [...prevEmployment]; u[i] = { ...u[i], supervisor_phone: e.target.value }; setPrevEmployment(u); }} /></div>
            <div><label>Supervisor Email</label><input type="email" value={emp.supervisor_email || ""} onChange={(e) => { const u = [...prevEmployment]; u[i] = { ...u[i], supervisor_email: e.target.value }; setPrevEmployment(u); }} /></div>
          </div>
        </div>
      ))}
      <button type="button" className="text-sm font-medium px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" onClick={() => setPrevEmployment([...prevEmployment, {}])}>
        + Add Previous Employer
      </button>

      {/* ====== SECTION 8: References ====== */}
      <SectionHeader title="References" number={8} />
      {references.map((ref, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-lg mb-4 relative">
          {references.length > 1 && (
            <button type="button" className="absolute top-2 right-2 text-red-400 hover:text-red-600" onClick={() => setReferences(references.filter((_, j) => j !== i))}>✕</button>
          )}
          <p className="font-medium mb-3">Reference {i + 1}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label>Name<RequiredStar /></label><input type="text" value={ref.name} required onChange={(e) => { const u = [...references]; u[i] = { ...u[i], name: e.target.value }; setReferences(u); }} /></div>
            <div><label>Phone<RequiredStar /></label><input type="tel" value={ref.phone} required onChange={(e) => { const u = [...references]; u[i] = { ...u[i], phone: e.target.value }; setReferences(u); }} /></div>
            <div><label>Email</label><input type="email" value={ref.email} onChange={(e) => { const u = [...references]; u[i] = { ...u[i], email: e.target.value }; setReferences(u); }} /></div>
            <div><label>Relationship<RequiredStar /></label><input type="text" value={ref.relationship} required onChange={(e) => { const u = [...references]; u[i] = { ...u[i], relationship: e.target.value }; setReferences(u); }} /></div>
            <div><label>Length of Acquaintance</label><input type="text" value={ref.length} onChange={(e) => { const u = [...references]; u[i] = { ...u[i], length: e.target.value }; setReferences(u); }} /></div>
          </div>
        </div>
      ))}
      <button type="button" className="text-sm font-medium px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" onClick={() => setReferences([...references, { name: "", phone: "", email: "", relationship: "", length: "" }])}>
        + Add Another Reference
      </button>

      {/* ====== SECTION 9: Pets ====== */}
      <SectionHeader title="Pets" number={9} />
      <div className="mb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasPets}
            onChange={(e) => {
              setHasPets(e.target.checked);
              if (!e.target.checked) setPets([]);
            }}
            className="w-5 h-5"
          />
          <span>I have pets</span>
        </label>
      </div>
      {hasPets && (
        <>
          {pets.map((pet, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg mb-4 relative">
              <button type="button" className="absolute top-2 right-2 text-red-400 hover:text-red-600" onClick={() => setPets(pets.filter((_, j) => j !== i))}>✕</button>
              <p className="font-medium mb-3">Pet {i + 1}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label>Pet Name</label><input type="text" value={pet.name || ""} onChange={(e) => { const u = [...pets]; u[i] = { ...u[i], name: e.target.value }; setPets(u); }} /></div>
                <div><label>Type / Breed / Size</label><input type="text" value={pet.type_breed_size || ""} onChange={(e) => { const u = [...pets]; u[i] = { ...u[i], type_breed_size: e.target.value }; setPets(u); }} /></div>
                <div><label>Sex</label><select value={pet.sex || ""} onChange={(e) => { const u = [...pets]; u[i] = { ...u[i], sex: e.target.value }; setPets(u); }}><option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                <div><label>Neutered / Spayed</label><select value={pet.neutered_spayed || ""} onChange={(e) => { const u = [...pets]; u[i] = { ...u[i], neutered_spayed: e.target.value }; setPets(u); }}><option value="">Select...</option><option value="Yes">Yes</option><option value="No">No</option></select></div>
                <div><label>Indoor / Outdoor / Both</label><select value={pet.indoor_outdoor || ""} onChange={(e) => { const u = [...pets]; u[i] = { ...u[i], indoor_outdoor: e.target.value }; setPets(u); }}><option value="">Select...</option><option value="Indoor">Indoor</option><option value="Outdoor">Outdoor</option><option value="Both">Both</option></select></div>
              </div>
            </div>
          ))}
          {pets.length < 5 && (
            <button type="button" className="text-sm font-medium px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" onClick={() => setPets([...pets, {}])}>
              + Add Pet
            </button>
          )}
        </>
      )}

      {/* ====== SECTION 10: Screening Questions ====== */}
      <SectionHeader title="Screening Questions" number={10} />
      <div className="space-y-6">
        {SCREENING_QUESTIONS.map((q, i) => (
          <div key={q.key} className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium mb-3">
              {i + 1}. {q.text}
            </p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`screening_${q.key}`}
                  checked={screening[q.key]?.answer === true}
                  onChange={() => setScreening({ ...screening, [q.key]: { ...screening[q.key], answer: true } })}
                  className="w-4 h-4"
                />
                Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`screening_${q.key}`}
                  checked={screening[q.key]?.answer === false}
                  onChange={() => setScreening({ ...screening, [q.key]: { ...screening[q.key], answer: false, details: "" } })}
                  className="w-4 h-4"
                />
                No
              </label>
            </div>
            {screening[q.key]?.answer && (
              <div className="mt-3">
                <label className="text-sm">Please provide details:</label>
                <textarea
                  rows={2}
                  value={screening[q.key]?.details || ""}
                  onChange={(e) => setScreening({ ...screening, [q.key]: { ...screening[q.key], details: e.target.value } })}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <label>Additional Information</label>
        <textarea
          name="additional_info"
          rows={4}
          placeholder="List any additional info you would like for us to know as we consider your application."
        />
      </div>

      {/* ====== SECTION 11: Authorization & E-Signature ====== */}
      <SectionHeader title="Authorization & E-Signature" number={11} />
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <p className="text-sm leading-relaxed text-gray-700 italic">
          I hereby authorize a review and full disclosure of all records concerning
          myself. I authorize current and past landlords, employers, financial
          institutions, personal references, and courts of law to release
          information regarding my rental, employment, credit, and/or criminal
          history. I agree to indemnify and hold harmless Geaux Home Buyers LLC and
          its agents from claims arising from complying with this request. A copy of
          this authorization may be accepted as an original.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            className="w-5 h-5 mt-0.5"
          />
          <span>I agree to the above authorization<RequiredStar /></span>
        </label>

        <div>
          <label>Typed Full Legal Name (E-Signature)<RequiredStar /></label>
          <input
            type="text"
            name="signature_name"
            required
            placeholder="Type your full legal name"
            className="font-serif text-lg"
          />
        </div>

        <p className="text-sm text-gray-500">
          Date: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Submit Button */}
      <div className="mt-10 pb-8">
        <button
          type="submit"
          disabled={submitting || !consent}
          className="w-full text-white font-bold py-4 rounded-lg text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#D4A843" }}
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </form>
  );
}
