"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Application } from "@/lib/types";

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

function SectionHeader({ title, number }: { title: string; number: number }) {
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

interface EditableApplicationFormProps {
  application: Application;
  token: string;
  onSaveSuccess: () => void;
}

export default function EditableApplicationForm({
  application,
  token,
  onSaveSuccess,
}: EditableApplicationFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  
  // State mirrors application data
  const [fullName, setFullName] = useState(application.full_name);
  const [email, setEmail] = useState(application.email);
  const [phone, setPhone] = useState(application.phone);
  const [desiredMoveIn, setDesiredMoveIn] = useState(application.desired_move_in);
  const [applyingAs, setApplyingAs] = useState(application.applying_as);
  
  const [currentAddress, setCurrentAddress] = useState(application.current_address);
  const [currentCity, setCurrentCity] = useState(application.current_city);
  const [currentState, setCurrentState] = useState(application.current_state);
  const [currentZip, setCurrentZip] = useState(application.current_zip);
  const [currentMonthlyRent, setCurrentMonthlyRent] = useState(String(application.current_monthly_rent));
  const [currentLandlordName, setCurrentLandlordName] = useState(application.current_landlord_name);
  const [currentLandlordPhone, setCurrentLandlordPhone] = useState(application.current_landlord_phone);
  
  const [workStatus, setWorkStatus] = useState(application.work_status);
  const [employerName, setEmployerName] = useState(application.employer_name);
  const [jobTitle, setJobTitle] = useState(application.job_title);
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState(String(application.gross_monthly_income));
  const [supervisorName, setSupervisorName] = useState(application.supervisor_name);
  const [supervisorPhone, setSupervisorPhone] = useState(application.supervisor_phone);
  
  const [screening, setScreening] = useState<Record<string, any>>(application.screening_questions || {});
  const [additionalInfo, setAdditionalInfo] = useState(application.additional_info || "");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");

    const updates = {
      full_name: fullName,
      email,
      phone,
      desired_move_in: desiredMoveIn,
      applying_as: applyingAs,
      current_address: currentAddress,
      current_city: currentCity,
      current_state: currentState,
      current_zip: currentZip,
      current_monthly_rent: parseFloat(currentMonthlyRent) || 0,
      current_landlord_name: currentLandlordName,
      current_landlord_phone: currentLandlordPhone,
      work_status: workStatus,
      employer_name: employerName,
      job_title: jobTitle,
      gross_monthly_income: parseFloat(grossMonthlyIncome) || 0,
      supervisor_name: supervisorName,
      supervisor_phone: supervisorPhone,
      screening_questions: screening,
      additional_info: additionalInfo,
    };

    try {
      // Extend token expiry by 7 more days
      const newExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from("applications")
        .update({
          ...updates,
          edit_token_expires_at: newExpiryDate,
          last_edited_at: new Date().toISOString(),
        })
        .eq("id", application.id);

      if (error) throw error;

      setSaveMessage("✅ Your changes have been saved! Your edit link has been extended 7 more days.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      onSaveSuccess();
    } catch (err) {
      setSaveMessage(
        `❌ Failed to save: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-2">
      {saveMessage && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            saveMessage.includes("✅")
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {saveMessage}
        </div>
      )}

      {/* SECTION 1: Personal Info (Editable) */}
      <SectionHeader title="Personal Information" number={1} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label>Full Name<RequiredStar /></label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email Address<RequiredStar /></label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Phone Number<RequiredStar /></label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Desired Move-in Date<RequiredStar /></label>
          <input
            type="date"
            value={desiredMoveIn}
            onChange={(e) => setDesiredMoveIn(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Applying As<RequiredStar /></label>
          <select
            value={applyingAs}
            onChange={(e) => setApplyingAs(e.target.value)}
            required
          >
            <option value="Tenant">Tenant</option>
            <option value="Co-applicant">Co-applicant</option>
          </select>
        </div>
      </div>

      {/* SECTION 4: Current Residence (Editable) */}
      <SectionHeader title="Current Residence" number={4} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label>Street Address<RequiredStar /></label>
          <input
            type="text"
            value={currentAddress}
            onChange={(e) => setCurrentAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label>City<RequiredStar /></label>
          <input
            type="text"
            value={currentCity}
            onChange={(e) => setCurrentCity(e.target.value)}
            required
          />
        </div>
        <div>
          <label>State<RequiredStar /></label>
          <select
            value={currentState}
            onChange={(e) => setCurrentState(e.target.value)}
            required
          >
            <option value="">Select...</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Zip Code<RequiredStar /></label>
          <input
            type="text"
            value={currentZip}
            onChange={(e) => setCurrentZip(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Monthly Rent<RequiredStar /></label>
          <input
            type="number"
            value={currentMonthlyRent}
            onChange={(e) => setCurrentMonthlyRent(e.target.value)}
            step="0.01"
            required
          />
        </div>
        <div>
          <label>Landlord/Manager Name<RequiredStar /></label>
          <input
            type="text"
            value={currentLandlordName}
            onChange={(e) => setCurrentLandlordName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Landlord Phone<RequiredStar /></label>
          <input
            type="tel"
            value={currentLandlordPhone}
            onChange={(e) => setCurrentLandlordPhone(e.target.value)}
            required
          />
        </div>
      </div>

      {/* SECTION 6: Current Employment (Editable) */}
      <SectionHeader title="Current Employment & Income" number={6} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Work Status<RequiredStar /></label>
          <select
            value={workStatus}
            onChange={(e) => setWorkStatus(e.target.value)}
            required
          >
            <option value="">Select...</option>
            <option value="Employed">Employed</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="Retired">Retired</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label>Employer Name<RequiredStar /></label>
          <input
            type="text"
            value={employerName}
            onChange={(e) => setEmployerName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Job Title<RequiredStar /></label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Gross Monthly Income<RequiredStar /></label>
          <input
            type="number"
            value={grossMonthlyIncome}
            onChange={(e) => setGrossMonthlyIncome(e.target.value)}
            step="0.01"
            required
          />
        </div>
        <div>
          <label>Supervisor Name</label>
          <input
            type="text"
            value={supervisorName}
            onChange={(e) => setSupervisorName(e.target.value)}
          />
        </div>
        <div>
          <label>Supervisor Phone</label>
          <input
            type="tel"
            value={supervisorPhone}
            onChange={(e) => setSupervisorPhone(e.target.value)}
          />
        </div>
      </div>

      {/* SECTION 10: Screening Questions (Editable) */}
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
                  onChange={() =>
                    setScreening({
                      ...screening,
                      [q.key]: { ...screening[q.key], answer: true },
                    })
                  }
                  className="w-4 h-4"
                />
                Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`screening_${q.key}`}
                  checked={screening[q.key]?.answer === false}
                  onChange={() =>
                    setScreening({
                      ...screening,
                      [q.key]: { ...screening[q.key], answer: false, details: "" },
                    })
                  }
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
                  onChange={(e) =>
                    setScreening({
                      ...screening,
                      [q.key]: { ...screening[q.key], details: e.target.value },
                    })
                  }
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
          rows={4}
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="Any additional info you'd like us to know."
        />
      </div>

      {/* Submit Button */}
      <div className="mt-10 pb-8 flex gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 text-white font-bold py-4 rounded-lg text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#D4A843" }}
        >
          {isSaving ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center mt-4">
        <strong>Note:</strong> Some fields (date of birth, desired move-in, etc.) are read-only to ensure application integrity.
        Contact us if you need to change these.
      </p>
    </form>
  );
}
