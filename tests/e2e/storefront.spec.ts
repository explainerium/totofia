import { expect, test } from "@playwright/test";

test.describe("language", () => {
  test("home renders in Bangla at / and English at /en", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("শিশুর");

    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Perfect care");
  });

  test("switching language keeps the page", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: "EN" }).first().click();
    await expect(page).toHaveURL(/\/en\/shop$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});

test("signed-out visitors are sent from /account to login", async ({ page }) => {
  await page.goto("/en/account");
  await expect(page).toHaveURL(/\/en\/login\?next=%2Faccount/);
});

test("unknown product shows the localized 404", async ({ page }) => {
  const res = await page.goto("/product/does-not-exist-xyz");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "পেজটি পাওয়া যায়নি" })).toBeVisible();

  await page.goto("/en/product/does-not-exist-xyz");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

// Creates a real COD order (phone 01799990000) — see playwright.config.ts.
test("guest can buy with cash on delivery", async ({ page }) => {
  await page.goto("/en/product/muslin-swaddle-wrap");
  const add = page.getByRole("button", { name: "Add to bag" }).first();
  await expect(add).toBeEnabled();
  // Wait until the client bundle is interactive before clicking.
  await page.waitForLoadState("networkidle");
  await add.click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.goto("/en/checkout");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Full name").fill("E2E Test Parent");
  await page.getByLabel("Mobile number").fill("01799990000");
  await page.getByLabel("Division").selectOption("dhaka");
  await page.getByLabel("District").selectOption("dhaka");
  await page.getByLabel("Area / thana").fill("Mirpur");
  await page.getByLabel("House, road and full address").fill("House 1, Road 2, Block C");
  await page.getByRole("button", { name: "Place order" }).click();

  // The access token moves into a cookie (proxy.ts), so it never stays in the address bar.
  await expect(page).toHaveURL(/\/en\/order\/\d+\?placed=1$/, { timeout: 60_000 });
  await expect(page.getByText("Order number")).toBeVisible();
  await expect(page.locator("text=/#\\d{5,}/").first()).toBeVisible();
});
