import { describe, expect, it } from "vitest";
import { productFitsAgeRange } from "@/server/domain/catalog/age-ranges";
import { effectivePrice, lowestPrice } from "@/server/domain/pricing/effective-price";

const now = new Date("2026-10-01T12:00:00Z");
const base = { price: 1650, salePrice: null, saleStartsAt: null, saleEndsAt: null };

describe("effectivePrice", () => {
  it("returns the regular price without a sale", () => {
    expect(effectivePrice(base, now)).toEqual({ price: 1650, compareAt: null });
  });
  it("applies an open-ended sale", () => {
    expect(effectivePrice({ ...base, salePrice: 1450 }, now)).toEqual({
      price: 1450,
      compareAt: 1650,
    });
  });
  it("ignores a sale outside its window", () => {
    const ended = { ...base, salePrice: 1450, saleEndsAt: new Date("2026-09-30T00:00:00Z") };
    const future = { ...base, salePrice: 1450, saleStartsAt: new Date("2026-10-02T00:00:00Z") };
    expect(effectivePrice(ended, now).compareAt).toBeNull();
    expect(effectivePrice(future, now).compareAt).toBeNull();
  });
  it("ignores a sale price that is not lower", () => {
    expect(effectivePrice({ ...base, salePrice: 1800 }, now).price).toBe(1650);
  });
});

describe("lowestPrice", () => {
  it("picks the cheapest effective variant", () => {
    const result = lowestPrice(
      [
        { ...base, price: 2000 },
        { ...base, salePrice: 1200 },
      ],
      now,
    );
    expect(result).toEqual({ price: 1200, compareAt: 1650 });
  });
  it("returns null without variants", () => {
    expect(lowestPrice([], now)).toBeNull();
  });
});

describe("productFitsAgeRange", () => {
  const infant = { min: 3, max: 12 };
  it("matches overlapping spans", () => {
    expect(productFitsAgeRange({ ageMinMonths: 0, ageMaxMonths: 6 }, infant)).toBe(true);
  });
  it("rejects spans that only touch the edge", () => {
    expect(productFitsAgeRange({ ageMinMonths: 0, ageMaxMonths: 3 }, infant)).toBe(false);
  });
  it("treats missing ages as all ages", () => {
    expect(productFitsAgeRange({ ageMinMonths: null, ageMaxMonths: null }, infant)).toBe(true);
  });
});
