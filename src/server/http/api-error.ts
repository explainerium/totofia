import type { ErrorKey } from "./messages";

/** Throw from services; `apiHandler` turns it into a localized JSON error response. */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly messageKey: ErrorKey,
    public readonly vars?: Record<string, string | number>,
  ) {
    super(messageKey);
    this.name = "ApiError";
  }
}
