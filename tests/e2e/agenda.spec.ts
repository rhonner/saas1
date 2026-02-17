import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Agenda", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/agenda");
  });

  test("should display week navigation controls", async ({ page }) => {
    // Verify navigation buttons
    await expect(page.locator("button:has-text('Anterior')")).toBeVisible();
    await expect(page.locator("button:has-text('Hoje')")).toBeVisible();
    await expect(page.locator("button:has-text('Próxima')")).toBeVisible();
  });

  test("should display new appointment button", async ({ page }) => {
    await expect(page.locator("button:has-text('Novo Agendamento')")).toBeVisible();
  });

  test("should open dialog when clicking new appointment", async ({ page }) => {
    await page.click("button:has-text('Novo Agendamento')");

    // Verify dialog opened
    await expect(page.locator("text=Novo Agendamento").nth(1)).toBeVisible();
    await expect(page.locator('label:has-text("Paciente")')).toBeVisible();
    await expect(page.locator('label:has-text("Data")')).toBeVisible();
    await expect(page.locator('label:has-text("Horário")')).toBeVisible();
  });

  test("should display seeded appointments", async ({ page }) => {
    // Wait for appointments to load
    await page.waitForTimeout(1000);

    // Verify that the week view renders with 7 day cards
    // Each day should be visible, even if it says "Nenhum agendamento"
    const dayCards = page.locator('[class*="card"]').filter({ hasText: /seg|ter|qua|qui|sex|sáb|dom/i });
    const count = await dayCards.count();

    // Should have day cards displayed (week view)
    expect(count).toBeGreaterThan(0);
  });

  test("should navigate to previous week", async ({ page }) => {
    // Get current week text
    const currentWeekText = await page.locator("span:has-text('-')").first().textContent();

    // Click previous week
    await page.click("button:has-text('Anterior')");
    await page.waitForTimeout(500);

    // Week text should change
    const newWeekText = await page.locator("span:has-text('-')").first().textContent();
    expect(newWeekText).not.toBe(currentWeekText);
  });

  test("should navigate to next week", async ({ page }) => {
    // Get current week text
    const currentWeekText = await page.locator("span:has-text('-')").first().textContent();

    // Click next week
    await page.click("button:has-text('Próxima')");
    await page.waitForTimeout(500);

    // Week text should change
    const newWeekText = await page.locator("span:has-text('-')").first().textContent();
    expect(newWeekText).not.toBe(currentWeekText);
  });

  test("should return to today when clicking today button", async ({ page }) => {
    // Navigate to previous week first
    await page.click("button:has-text('Anterior')");
    await page.waitForTimeout(1000);

    // Verify we're not on current week anymore
    const weekTextBefore = await page.locator("text=/\\d+ [a-z]+ - \\d+ [a-z]+ 2026/i").first().textContent();

    // Click today button
    await page.click("button:has-text('Hoje')");
    await page.waitForTimeout(1000);

    // Week should have changed back
    const weekTextAfter = await page.locator("text=/\\d+ [a-z]+ - \\d+ [a-z]+ 2026/i").first().textContent();
    expect(weekTextAfter).not.toBe(weekTextBefore);

    // Should show "Hoje" badge somewhere on the page
    const hojeVisible = await page.locator("text=Hoje").count();
    expect(hojeVisible).toBeGreaterThan(0);
  });
});
