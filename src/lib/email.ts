/**
 * Email helper — sends via Gmail SMTP using nodemailer.
 * Requires GMAIL_USER and GMAIL_APP_PASSWORD environment variables.
 * From address: Geaux Home Rentals <stephen@225sellnow.com>
 *
 * To generate an app password:
 * Google Account → Security → 2-Step Verification → App passwords
 * Name it "Geaux Home Rentals" and paste the 16-char password into GMAIL_APP_PASSWORD.
 */

import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER || "stephen@225sellnow.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  if (!GMAIL_APP_PASSWORD) {
    console.warn("[email] GMAIL_APP_PASSWORD not set — skipping email send");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `Geaux Home Rentals <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Don't throw — email failure shouldn't break application submission
    console.error("[email] Gmail send error:", err);
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a1a1a;">Application Received ✅</h2>
      <p>Hi ${applicantName},</p>
      <p>Thank you for submitting your rental application for <strong>${listingAddress}</strong>. We've received it and will be in touch shortly.</p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

      <p><strong>Need to make a change?</strong></p>
      <p>You have <strong>7 days</strong> to update your application using the secure link below:</p>
      <p style="margin: 20px 0;">
        <a href="${editUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Edit My Application
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">Or copy this link: ${editUrl}</p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

      <p>Questions? Reply to this email or call <strong>(225) 330-8416</strong>.</p>
      <p>— The Geaux Home Rentals Team</p>
    </div>
  `;
}
