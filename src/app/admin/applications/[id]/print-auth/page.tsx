import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function PrintAuthorizationPage({
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

  const listing = app.listing as Record<string, unknown> | null;
  const signatureDate = app.signature_date
    ? new Date(app.signature_date as string).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date(app.created_at as string).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 13px;
          line-height: 1.7;
          color: #111;
          background: white;
        }
        .page {
          padding: 60px;
          max-width: 780px;
          margin: 0 auto;
        }
        .header { text-align: center; margin-bottom: 36px; border-bottom: 2px solid #111; padding-bottom: 20px; }
        .header h1 { font-size: 20px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; }
        .header p { font-size: 12px; color: #555; margin-top: 4px; }
        .section { margin-bottom: 28px; }
        .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; color: #555; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        .field-row { display: flex; gap: 8px; margin-bottom: 6px; }
        .field-label { font-weight: bold; min-width: 180px; color: #333; }
        .auth-text { background: #f9f9f9; border: 1px solid #ddd; padding: 16px 20px; font-style: italic; line-height: 1.8; margin: 12px 0; }
        .signature-box { border: 1px solid #aaa; padding: 20px 24px; margin-top: 16px; background: #fafafa; }
        .sig-name { font-family: 'Palatino', Georgia, serif; font-size: 22px; font-style: italic; border-bottom: 1px solid #333; padding-bottom: 6px; margin-bottom: 10px; }
        .sig-meta { font-size: 11px; color: #555; display: flex; gap: 40px; flex-wrap: wrap; }
        .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 11px; color: #888; text-align: center; }
        .print-btn {
          position: fixed; top: 20px; right: 20px;
          background: #16a34a; color: white; border: none;
          padding: 10px 20px; font-size: 14px; border-radius: 6px;
          cursor: pointer; font-family: Arial, sans-serif;
          text-decoration: none; display: inline-block;
        }
        .print-btn:hover { background: #15803d; }
        @media print {
          .print-btn { display: none !important; }
          .page { padding: 30px; }
        }
      `}</style>

      <a href="javascript:window.print()" className="print-btn">🖨️ Print / Save PDF</a>

      <div className="page">
        <div className="header">
          <h1>Rental Application Authorization</h1>
          <p>Geaux Home Rentals · (225) 330-8416 · geauxhomerentals.com</p>
        </div>

        <div className="section">
          <div className="section-title">Applicant Information</div>
          <div className="field-row"><span className="field-label">Applicant Name:</span><span>{app.full_name as string}</span></div>
          <div className="field-row"><span className="field-label">Date of Birth:</span><span>{app.date_of_birth as string}</span></div>
          <div className="field-row"><span className="field-label">Email:</span><span>{app.email as string}</span></div>
          <div className="field-row"><span className="field-label">Phone:</span><span>{app.phone as string}</span></div>
        </div>

        {listing && (
          <div className="section">
            <div className="section-title">Property Applied For</div>
            <div className="field-row">
              <span className="field-label">Address:</span>
              <span>{listing.address as string}, {listing.city as string}, {listing.state as string} {listing.zip as string}</span>
            </div>
            <div className="field-row"><span className="field-label">Monthly Rent:</span><span>${Number(listing.monthly_rent).toLocaleString()}/month</span></div>
          </div>
        )}

        <div className="section">
          <div className="section-title">Authorization Language</div>
          <div className="auth-text">
            I hereby authorize a review and full disclosure of all records concerning
            myself. I authorize current and past landlords, employers, financial
            institutions, personal references, and courts of law to release
            information regarding my rental, employment, credit, and/or criminal
            history. I agree to indemnify and hold harmless Geaux Home Buyers LLC and
            its agents from claims arising from complying with this request. A copy of
            this authorization may be accepted as an original.
          </div>
        </div>

        <div className="section">
          <div className="section-title">Electronic Signature</div>
          <div className="signature-box">
            <div className="sig-name">{app.signature_name as string}</div>
            <div className="sig-meta">
              <span><strong>Signed:</strong> {signatureDate}</span>
              <span><strong>Method:</strong> Electronic (typed signature)</span>
              <span><strong>Agreed:</strong> {app.consent_agreed ? "Yes ✓" : "No"}</span>
            </div>
          </div>
        </div>

        <div className="footer">
          Application ID: {app.id as string} &nbsp;·&nbsp;
          Submitted: {new Date(app.created_at as string).toLocaleString()} &nbsp;·&nbsp;
          Generated: {new Date().toLocaleString()}
        </div>
      </div>
    </>
  );
}
