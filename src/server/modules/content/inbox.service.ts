import "server-only";
import type { ContactStatus, Locale, Prisma } from "@/generated/prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../http/api-error";
import { pagination } from "../../http/response";

// ─── Contact messages ────────────────────────────────────────────────────────

export async function createContactMessage(
  locale: Locale,
  input: { name: string; email?: string; phone?: string; subject?: string; message: string },
) {
  await prisma.contactMessage.create({
    data: {
      locale,
      name: input.name,
      email: input.email,
      phone: input.phone,
      subject: input.subject,
      message: input.message,
    },
  });
}

/** `INBOX` = everything except archived (filtered here, so pages stay full). */
export async function listContactMessages(query: {
  page?: number;
  limit?: number;
  status?: ContactStatus | "INBOX";
}) {
  const { skip, take, meta } = pagination(query);
  const where: Prisma.ContactMessageWhereInput =
    query.status === "INBOX" ? { status: { not: "ARCHIVED" } } : { status: query.status };
  const [items, total, unread] = await Promise.all([
    prisma.contactMessage.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);
  return { items, meta: meta(total), unread };
}

export type AdminContactMessage = Awaited<ReturnType<typeof listContactMessages>>["items"][number];

export async function setContactStatus(id: string, status: ContactStatus) {
  const found = await prisma.contactMessage.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw new ApiError(404, "notFound");
  await prisma.contactMessage.update({ where: { id }, data: { status } });
}

export async function deleteContactMessage(id: string) {
  const found = await prisma.contactMessage.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw new ApiError(404, "notFound");
  await prisma.contactMessage.delete({ where: { id } });
}

// ─── Newsletter ──────────────────────────────────────────────────────────────

/** Idempotent: subscribing again re-activates the address. */
export async function subscribeNewsletter(email: string, locale: Locale) {
  const normalized = email.trim().toLowerCase();
  await prisma.newsletterSubscriber.upsert({
    where: { email: normalized },
    create: { email: normalized, locale },
    update: { unsubscribedAt: null, locale },
  });
}

export async function listSubscribers(query: { page?: number; limit?: number; q?: string }) {
  const { skip, take, meta } = pagination(query);
  const where = {
    unsubscribedAt: null,
    email: query.q ? { contains: query.q, mode: "insensitive" as const } : undefined,
  };
  const [items, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.newsletterSubscriber.count({ where }),
  ]);
  return { items, meta: meta(total) };
}

export async function unsubscribe(id: string) {
  const found = await prisma.newsletterSubscriber.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!found) throw new ApiError(404, "notFound");
  await prisma.newsletterSubscriber.update({ where: { id }, data: { unsubscribedAt: new Date() } });
}

/** All active subscribers as CSV (email,language,subscribed). */
export async function subscribersCsv() {
  const rows = await prisma.newsletterSubscriber.findMany({
    where: { unsubscribedAt: null },
    orderBy: { createdAt: "asc" },
  });
  return [
    "email,language,subscribed_at",
    ...rows.map((r) => `${r.email},${r.locale},${r.createdAt.toISOString()}`),
  ].join("\n");
}
