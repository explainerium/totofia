import { defineConfig, devices } from "@playwright/test";

/**
 * Storefront smoke tests. They run against an already running app — start it first:
 *   npm run dev -- -p 3100            (or any URL via PLAYWRIGHT_BASE_URL)
 *   npm run test:e2e
 * The guest checkout test creates a real COD order with phone 01799990000 — delete it afterwards
 * (Admin → Orders, or the database) on anything that isn't a throwaway environment.
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100",
    trace: "retain-on-failure",
    navigationTimeout: 60_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
