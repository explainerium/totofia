import { describe, expect, it } from "vitest";
import { formatDate, formatDigits, formatNumber, formatPrice } from "@/lib/format/intl";

describe("formatPrice", () => {
  it("uses Bangla digits for bn", () => {
    expect(formatPrice(1450, "bn")).toBe("৳১,৪৫০");
  });
  it("uses Latin digits for en", () => {
    expect(formatPrice(1450, "en")).toBe("৳1,450");
  });
  it("accepts decimal strings from Prisma", () => {
    expect(formatPrice("2250.00", "en")).toBe("৳2,250");
  });
});

describe("formatNumber", () => {
  it("groups Bangla numbers in lakh", () => {
    expect(formatNumber(123456, "bn")).toBe("১,২৩,৪৫৬");
  });
});

describe("formatDate", () => {
  it("formats per locale", () => {
    expect(formatDate("2026-09-30", "bn")).toBe("৩০ সেপ্টেম্বর, ২০২৬");
    expect(formatDate("2026-09-30", "en")).toBe("30 September 2026");
  });
  it("uses the Dhaka calendar day on any server", () => {
    // 01:30 on 1 October in Dhaka is still 30 September in UTC.
    expect(formatDate("2026-09-30T19:30:00Z", "en")).toBe("1 October 2026");
  });
});

describe("formatDigits", () => {
  it("does not group digits", () => {
    expect(formatDigits(2026, "bn")).toBe("২০২৬");
    expect(formatDigits(2026, "en")).toBe("2026");
  });
});
