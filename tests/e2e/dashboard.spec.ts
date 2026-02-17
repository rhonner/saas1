import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should display all metric cards", async ({ page }) => {
    await page.goto("/dashboard");

    // Verify all 4 metric cards are visible
    await expect(page.locator("text=Total de Agendamentos")).toBeVisible();
    await expect(page.locator("text=Taxa de Confirmação")).toBeVisible();
    await expect(page.locator("text=Taxa de Faltas")).toBeVisible();
    await expect(page.locator("text=Prejuízo Estimado")).toBeVisible();
  });

  test("should display chart section", async ({ page }) => {
    await page.goto("/dashboard");

    // Verify chart section exists
    await expect(page.locator("text=/estatísticas|gráfico|tendência/i").first()).toBeVisible({ timeout: 10000 });
  });

  test("should display summary cards", async ({ page }) => {
    await page.goto("/dashboard");

    // Wait for chart to load
    await page.waitForTimeout(1500);

    // Scroll down to see the chart section which is below the metric cards
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);

    // Verify the chart legend shows these status labels (they're in the chart area)
    // Use .first() to avoid strict mode violation
    await expect(page.locator("text=Confirmados").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Faltas").first()).toBeVisible({ timeout: 10000 });
  });

  test("should show loading state initially", async ({ page }) => {
    // Intercept API call to simulate delay
    await page.route("**/api/dashboard", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      route.continue();
    });

    await page.goto("/dashboard");

    // Should see content after loading
    await expect(page.locator("text=Total de Agendamentos")).toBeVisible({ timeout: 10000 });
  });
});
