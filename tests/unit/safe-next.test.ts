import { describe, expect, it } from "vitest";
import { safeNext } from "@/components/storefront/auth/safe-next";

describe("safeNext", () => {
  it("keeps relative paths", () => {
    expect(safeNext("/account/orders")).toBe("/account/orders");
    expect(safeNext("/checkout?step=1")).toBe("/checkout?step=1");
    expect(safeNext("/category/খেলনা")).toBe("/category/খেলনা");
  });
  it("strips a locale prefix", () => {
    expect(safeNext("/en/account")).toBe("/account");
    expect(safeNext("/en")).toBe("/");
  });
  it.each([
    null,
    "",
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "account",
    "/en//evil.com",
    // `?next=/%09/evil.com` arrives decoded; URL parsers drop the tab → "//evil.com".
    "/\t/evil.com",
    "/\n/evil.com",
    "/en/\r\n/evil.com",
  ])("falls back for %j", (value) => {
    expect(safeNext(value)).toBe("/account");
  });
});
