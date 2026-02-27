import { Resend } from "resend";
import { getSiteUrl } from "@/lib/site-url";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export interface NewSubmissionPayload {
  referenceId: string;
  workTitle: string;
  artistName?: string | null;
  medium?: string | null;
  year?: number | null;
  createdAt: string;
}

/**
 * Sends an email to the admin when a new artist submission is received.
 * Fails silently if RESEND_API_KEY or ADMIN_EMAIL is not set.
 */
export async function notifyAdminNewSubmission(
  payload: NewSubmissionPayload
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const resend = getResend();

  if (!resend || !adminEmail) {
    return;
  }

  const siteUrl = getSiteUrl();
  const reviewUrl = `${siteUrl}/admin/submissions`;

  const subject = `[Art Gallery] New submission: ${payload.workTitle}`;
  const html = `
    <h2>New Artist Submission</h2>
    <p>A new work has been submitted for review.</p>
    <table style="border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 6px 12px 6px 0; color: #666;">Reference</td><td style="padding: 6px 0;"><strong>${payload.referenceId}</strong></td></tr>
      <tr><td style="padding: 6px 12px 6px 0; color: #666;">Title</td><td style="padding: 6px 0;">${payload.workTitle}</td></tr>
      ${payload.artistName ? `<tr><td style="padding: 6px 12px 6px 0; color: #666;">Artist</td><td style="padding: 6px 0;">${payload.artistName}</td></tr>` : ""}
      ${payload.medium ? `<tr><td style="padding: 6px 12px 6px 0; color: #666;">Medium</td><td style="padding: 6px 0;">${payload.medium}</td></tr>` : ""}
      ${payload.year ? `<tr><td style="padding: 6px 12px 6px 0; color: #666;">Year</td><td style="padding: 6px 0;">${payload.year}</td></tr>` : ""}
      <tr><td style="padding: 6px 12px 6px 0; color: #666;">Submitted</td><td style="padding: 6px 0;">${payload.createdAt}</td></tr>
    </table>
    <p><a href="${reviewUrl}" style="display: inline-block; padding: 10px 20px; background: #5EB1BF; color: white; text-decoration: none; border-radius: 6px;">Review submissions</a></p>
    <p style="color: #999; font-size: 12px; margin-top: 24px;">Art Valuation Protocol — Bayview Hub</p>
  `;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Art Gallery <onboarding@resend.dev>",
      to: adminEmail,
      subject,
      html,
    });
  } catch (err) {
    console.error("[notifyAdminNewSubmission]", err);
  }
}
