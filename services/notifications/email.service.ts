import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "BewerbungsFinder <noreply@bewerbungsfinder.de>";

let _resend: Resend | null = null;
function getResendClient(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? "placeholder-set-in-env");
  }
  return _resend;
}

type SendParams = { to: string; subject: string; html: string };

class EmailService {
  private get enabled() {
    return !!process.env.RESEND_API_KEY;
  }

  async send({ to, subject, html }: SendParams): Promise<void> {
    if (!this.enabled) {
      console.log(`[EmailService] Skipping email to ${to}: ${subject}`);
      return;
    }
    await getResendClient().emails.send({ from: FROM, to, subject, html });
  }

  async sendNewMatches(to: string, userName: string, count: number): Promise<void> {
    await this.send({
      to, subject: `🎯 ${count} neue Job-Matches gefunden`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px;"><h1 style="color:#60a5fa;">Neue Job-Matches!</h1><p>Hallo ${userName},</p><p>Wir haben <strong>${count} neue Stellen</strong> gefunden, die zu deinem Profil passen.</p><a href="${process.env.NEXTAUTH_URL}/dashboard/matches" style="display:inline-block;margin-top:16px;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Matches ansehen →</a></div>`,
    });
  }

  async sendApplicationSubmitted(to: string, userName: string, jobTitle: string, company: string): Promise<void> {
    await this.send({
      to, subject: `✅ Bewerbung eingereicht: ${jobTitle} bei ${company}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px;"><h1 style="color:#34d399;">Bewerbung eingereicht!</h1><p>Hallo ${userName},</p><p>Deine Bewerbung für <strong>${jobTitle}</strong> bei <strong>${company}</strong> wurde erfolgreich eingereicht.</p><a href="${process.env.NEXTAUTH_URL}/dashboard/applications" style="display:inline-block;margin-top:16px;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Bewerbungen verwalten →</a></div>`,
    });
  }

  async sendStatusUpdate(to: string, userName: string, jobTitle: string, company: string, newStatus: string): Promise<void> {
    const labels: Record<string, string> = { ACKNOWLEDGED: "bestätigt", INTERVIEW: "zum Gespräch eingeladen", OFFER: "ein Angebot erhalten", REJECTED: "abgelehnt" };
    const isPositive = ["ACKNOWLEDGED", "INTERVIEW", "OFFER"].includes(newStatus);
    const color = isPositive ? "#34d399" : "#f87171";
    await this.send({
      to, subject: `📬 Update: ${jobTitle} bei ${company}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px;"><h1 style="color:${color};">Bewerbungs-Update</h1><p>Hallo ${userName},</p><p>Deine Bewerbung für <strong>${jobTitle}</strong> bei <strong>${company}</strong> wurde <strong style="color:${color};">${labels[newStatus] ?? newStatus}</strong>.</p><a href="${process.env.NEXTAUTH_URL}/dashboard/applications" style="display:inline-block;margin-top:16px;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Details ansehen →</a></div>`,
    });
  }
}

export const emailService = new EmailService();
