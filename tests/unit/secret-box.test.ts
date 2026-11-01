import { beforeAll, describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, maskSecret } from "@/server/lib/secret-box";

beforeAll(() => {
  process.env.CREDENTIALS_KEY = "unit-test-credentials-key-0123456789abcdef";
});

describe("secret box", () => {
  it("round-trips and never stores the plain text", () => {
    const sealed = encryptSecret("store-password-123");
    expect(sealed.startsWith("v1:")).toBe(true);
    expect(sealed).not.toContain("store-password-123");
    expect(decryptSecret(sealed)).toBe("store-password-123");
  });
  it("uses a fresh IV every time", () => {
    expect(encryptSecret("same")).not.toBe(encryptSecret("same"));
  });
  it("rejects tampered data", () => {
    const sealed = encryptSecret("secret");
    const tampered = sealed.slice(0, -2) + (sealed.endsWith("A") ? "B" : "A") + sealed.slice(-1);
    expect(() => decryptSecret(tampered)).toThrow();
  });
  it("fails with another key", () => {
    const sealed = encryptSecret("secret");
    process.env.CREDENTIALS_KEY = "another-credentials-key-0123456789abcdefgh";
    expect(() => decryptSecret(sealed)).toThrow();
    process.env.CREDENTIALS_KEY = "unit-test-credentials-key-0123456789abcdef";
  });
  it("masks all but the last 4 characters", () => {
    expect(maskSecret("abcdef1234")).toBe("••••1234");
    expect(maskSecret("abc")).toBe("••••");
  });
});
