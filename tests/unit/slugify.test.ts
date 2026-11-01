import { describe, expect, it } from "vitest";
import { slugify, slugSchemaPattern } from "@/server/lib/slugify";
import { toRows } from "@/server/modules/catalog/translations";

describe("slugify", () => {
  it("builds a latin slug", () => {
    expect(slugify("Organic Cotton Romper (Sage)")).toBe("organic-cotton-romper-sage");
  });
  it("spells out ampersands and strips accents", () => {
    expect(slugify("Bodysuits & Rompers — Café")).toBe("bodysuits-and-rompers-cafe");
  });
  it("drops Bangla-only input to an empty slug", () => {
    expect(slugify("অর্গানিক রম্পার")).toBe("");
  });
  it("produces slugs that pass validation", () => {
    expect(slugSchemaPattern.test(slugify("  Waffle   Knit  Set  "))).toBe(true);
  });
});

describe("toRows", () => {
  it("creates one row per locale with shared fields", () => {
    expect(toRows({ bn: { name: "সেট" }, en: { name: "Set" } }, { slug: "set" })).toEqual([
      { name: "সেট", slug: "set", locale: "bn" },
      { name: "Set", slug: "set", locale: "en" },
    ]);
  });
});
