import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { logger } from "../../lib/logger";

export type Mail = { to: string; subject: string; html: string; text: string };

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  const host = process.env.SMTP_HOST;
  transporter = host
    ? nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      })
    : null;
  return transporter;
}

/** Sends through SMTP when configured; otherwise logs the mail (development). */
export async function sendMail(mail: Mail) {
  const transport = getTransporter();
  if (!transport) {
    // In development the text body (links included) is logged so flows like password reset can be tested.
    const text = process.env.NODE_ENV === "production" ? undefined : mail.text;
    logger.info(
      { to: mail.to, subject: mail.subject, text },
      "SMTP not configured — mail not sent",
    );
    return;
  }
  await transport.sendMail({
    from: process.env.MAIL_FROM ?? "Totofia <no-reply@totofia.com>",
    ...mail,
  });
}
