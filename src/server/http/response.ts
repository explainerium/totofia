import { NextResponse } from "next/server";

export type PaginationMeta = { page: number; limit: number; total: number; totalPages: number };

export type ApiSuccess<T> = { success: true; message?: string; data: T; meta?: PaginationMeta };
export type ApiFailure = {
  success: false;
  statusCode: number;
  message: string;
  details?: { path: string; message: string }[];
};

export function ok<T>(
  data: T,
  init: { status?: number; message?: string; meta?: PaginationMeta } = {},
) {
  const body: ApiSuccess<T> = { success: true, message: init.message, data, meta: init.meta };
  return NextResponse.json(body, { status: init.status ?? 200 });
}

export function fail(statusCode: number, message: string, details?: ApiFailure["details"]) {
  const body: ApiFailure = { success: false, statusCode, message, details };
  return NextResponse.json(body, { status: statusCode });
}

/** `?page=1&limit=20` → Prisma skip/take + meta builder. */
export function pagination(query: { page?: number; limit?: number }, max = 100) {
  const page = Math.min(100_000, Math.max(1, query.page ?? 1));
  const limit = Math.min(max, Math.max(1, query.limit ?? 20));
  return {
    skip: (page - 1) * limit,
    take: limit,
    meta: (total: number): PaginationMeta => ({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }),
  };
}
