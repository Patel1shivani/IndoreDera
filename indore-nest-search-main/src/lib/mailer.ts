import { toast } from "sonner";

/*
 * SIMULATED EMAIL LAYER.
 *
 * Yahan koi asli email nahi jaata — browser se SMTP possible hi nahi hai.
 * Ye sirf wahi toast/console output deta hai jo asli mail ke saath dikhta.
 *
 * TODO(backend): har call ko `fetch("/api/mail", { method: "POST", ... })` se
 * replace karein jo server par Nodemailer/Resend se asli mail bheje.
 * Template names aur payload keys jaan-boojh kar backend-friendly rakhe hain.
 */

export type MailTemplate =
  | "welcome"
  | "login-alert"
  | "listing-submitted"
  | "listing-draft"
  | "listing-approved"
  | "owner-inquiry"
  | "plan-purchased";

const SUBJECTS: Record<MailTemplate, string> = {
  welcome: "Indore Dera me aapka swagat hai",
  "login-alert": "Aapke account me login hua",
  "listing-submitted": "Aapki property listing mil gayi",
  "listing-draft": "Draft save ho gaya",
  "listing-approved": "Aapki listing live ho gayi",
  "owner-inquiry": "Kisi ne aapki property me interest dikhaya",
  "plan-purchased": "Plan activate ho gaya",
};

export interface MailPayload {
  to: string;
  template: MailTemplate;
  data?: Record<string, string | number>;
}

export async function sendMail({ to, template, data }: MailPayload): Promise<void> {
  const subject = SUBJECTS[template];

  // Backend aane par yahi shape API ko jaayega
  console.info("[mail:simulated]", { to, template, subject, data });

  toast.success(`Email bheja gaya → ${to}`, {
    description: `${subject} (demo — abhi asli mail nahi jaata)`,
  });
}
