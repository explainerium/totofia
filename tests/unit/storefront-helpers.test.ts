import { describe, expect, it } from "vitest";
import {
  activeFilterCount,
  listingQuery,
  parseListingParams,
} from "@/components/storefront/listing/params";
import { ageLabel } from "@/lib/format/age";
import { discountPercent, localizeDigits } from "@/lib/format/intl";
import { localeAlternates } from "@/lib/seo/alternates";

describe("parseListingParams", () => {
  it("parses and validates query params", () => {
    const p = parseListingParams({
      size: "0-3m,3-6m,BAD VALUE",
      color: "sage",
      min: "500",
      max: "abc",
      stock: "1",
      sort: "price-asc",
      page: "2",
      age: "infant",
    });
    expect(p).toMatchObject({
      sizes: ["0-3m", "3-6m"],
      colors: ["sage"],
      minPrice: 500,
      maxPrice: undefined,
      inStock: true,
      sort: "price-asc",
      page: 2,
      age: "infant",
    });
  });
  it("falls back to defaults for unknown values", () => {
    const p = parseListingParams({ sort: "cheapest", page: "-1", age: "teen" });
    expect(p.sort).toBe("newest");
    expect(p.page).toBe(1);
    expect(p.age).toBeUndefined();
  });
  it("round-trips through listingQuery and resets page on override", () => {
    const p = parseListingParams({ size: "0-3m", page: "3" });
    expect(listingQuery(p)).toBe("?size=0-3m&page=3");
    expect(listingQuery(p, { page: 1 })).toBe("?size=0-3m");
    expect(activeFilterCount(p)).toBe(1);
  });
});

describe("ageLabel", () => {
  it("uses months up to 24", () => {
    expect(ageLabel(0, 12)).toEqual({ key: "ageMonths", min: 0, max: 12 });
  });
  it("uses years for long whole-year spans", () => {
    expect(ageLabel(12, 36)).toEqual({ key: "ageYears", min: 1, max: 3 });
  });
  it("handles open ends", () => {
    expect(ageLabel(36, null)).toEqual({ key: "ageFromYears", min: 3 });
    expect(ageLabel(null, null)).toBeNull();
  });
});

describe("format helpers", () => {
  it("localizes digits in free text for bn only", () => {
    expect(localizeDigits("+880 1800", "bn")).toBe("+৮৮০ ১৮০০");
    expect(localizeDigits("+880 1800", "en")).toBe("+880 1800");
  });
  it("computes discount percent", () => {
    expect(discountPercent(1450, 1650)).toBe(12);
    expect(discountPercent(1650, 1650)).toBe(0);
  });
  it("builds locale alternates", () => {
    expect(localeAlternates("/", "en")).toMatchObject({
      canonical: "/en",
      languages: { bn: "/", en: "/en" },
    });
    expect(localeAlternates("/shop", "bn").canonical).toBe("/shop");
  });
});
