import "server-only";
import { createTranslator } from "use-intl/core";
import bn from "../../../../messages/bn.json";
import en from "../../../../messages/en.json";
import { prisma } from "../../db/prisma";
import { sendMail } from "../../integrations/mail/mailer";

const catalogs = { bn, en } as const;

/** Password reset link, in the customer's language. */
export async function sendPasswordResetEmail(userId: string, url: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, locale: true },
  });
  if (!user) return;
  const locale = user.locale;
  const t = createTranslator({ locale, messages: catalogs[locale], namespace: "Email" });
  const name = user.name.replace(/[&<>"']/g, "");

  const html = `<!doctype html><html lang="${locale}"><body style="margin:0;background:#fff8f5;font-family:'Noto Sans','Noto Sans Bengali',Arial,sans-serif;color:#1f1b17">
<div style="max-width:560px;margin:0 auto;padding:24px">
<h1 style="color:#005c55;font-size:22px;margin:0 0 16px">${t("brand")}</h1>
<p>${t("resetIntro", { name })}</p>
<p><a href="${url}" style="display:inline-block;background:#005c55;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">${t("resetButton")}</a></p>
<p style="color:#3e4947;font-size:13px">${t("resetIgnore")}</p>
</div></body></html>`;

  await sendMail({
    to: user.email,
    subject: t("resetSubject"),
    html,
    text: `${t("resetIntro", { name })}\n${url}\n${t("resetIgnore")}`,
  });
}
