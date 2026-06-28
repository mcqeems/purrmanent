import { test, expect } from "@playwright/test";

// Happy-path smoke: landing -> login screen renders. Extend with a seeded
// account to cover register -> onboard -> board -> coach (needs the backend).
test("landing shows the brand and routes to login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Purrmanent" })).toBeVisible();
  await page.getByRole("link", { name: /get started/i }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
});
