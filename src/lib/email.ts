/**
 * Email helper — sends via Resend API (no SDK needed, plain fetch).
 * Requires RESEND_API_KEY environment variable.
 * From address: Geaux Home Rentals <noreply@geauxhomerentals.com>
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = "Geaux Home Rentals <noreply@geauxhomerentals.com>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email] Resend API error:", res.status, body);
    // Don't throw — email failure shouldn't break application submission
  }
}

export function buildApplicationConfirmationEmail({
  applicantName,
  listingAddress,
  editToken,
}: {
  applicantName: string;
  listingAddress: string;
  editToken: string;
}): string {
  const editUrl = `https://www.geauxhomerentals.com/application/edit?token=${editToken}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application Received</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#D4A843;padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">Geaux Home Rentals</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:20px;">Application Received ✅</h2>
              <p style="margin:0 0 16px;color:#555;font-size:16px;line-height:1.6;">
                Hi ${applicantName},
              </p>
              <p style="margin:0 0 16px;color:#555;font-size:16px;line-height:1.6;">
                Thank you for submitting your rental application for <strong>${listingAddress}</strong>. We've received it and will be in touch soon.
              </p>

              <!-- Edit link box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8ec;border:1px solid #f0d98a;border-radius:8px;margin:24px 0;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 8px;color:#1a1a1a;font-size:15px;font-weight:bold;">Need to make changes?</p>
                    <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.5;">
                      You can edit your application anytime in the next 7 days, as long as it hasn't been reviewed yet. Just click the button below.
                    </p>
                    <a href="${editUrl}"
                       style="display:inline-block;background:#D4A843;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:bold;">
                      Edit My Application →
                    </a>
                    <p style="margin:12px 0 0;color:#888;font-size:12px;">
                      This link expires in 7 days and only works while your application is under review.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;color:#555;font-size:14px;line-height:1.6;">
                If you have any questions, feel free to reach out to us directly.
              </p>
              <p style="margin:8px 0 0;color:#555;font-size:14px;">
                — The Geaux Home Rentals Team
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #eee;text-align:center;">
              <p style="margin:0;color:#aaa;font-size:12px;">
                © ${new Date().getFullYear()} Geaux Home Rentals · Baton Rouge, LA<br/>
                <a href="https://www.geauxhomerentals.com" style="color:#D4A843;text-decoration:none;">www.geauxhomerentals.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
