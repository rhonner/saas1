import { test, expect } from "@playwright/test";

/**
 * Navigation tests for authenticated users
 * Note: These tests require a logged-in session
 */
test.describe("Navigation", () => {
  // You may need to implement a login helper or use Playwright's storage state
  // to maintain authentication across tests
  test.beforeEach(async ({ page }) => {
    // TODO: Add authentication setup here
    // For now, these tests will fail without authentication
    // Example:
    // await page.goto("/auth/login");
    // await page.getByLabel(/email/i).fill("test@example.com");
    // await page.getByLabel(/senha/i).fill("testpassword");
    // await page.getByRole("button", { name: /entrar/i }).click();
    // await page.waitForURL("/dashboard");
  });

  test.skip("sidebar shows all navigation links", async ({ page }) => {
    await page.goto("/dashboard");

    // Check for main navigation items
    const dashboardLink = page.getByRole("link", { name: /dashboard/i });
    await expect(dashboardLink).toBeVisible();

    const agendaLink = page.getByRole("link", { name: /agenda/i });
    await expect(agendaLink).toBeVisible();

    const patientsLink = page.getByRole("link", { name: /pacientes/i });
    await expect(patientsLink).toBeVisible();

    const settingsLink = page.getByRole("link", { name: /configurações/i });
    await expect(settingsLink).toBeVisible();
  });

  test.skip("can navigate between pages", async ({ page }) => {
    await page.goto("/dashboard");

    // Navigate to Agenda
    await page.getByRole("link", { name: /agenda/i }).click();
    await expect(page).toHaveURL(/\/agenda/);
    await expect(
      page.getByRole("heading", { name: /agenda/i })
    ).toBeVisible();

    // Navigate to Pacientes
    await page.getByRole("link", { name: /pacientes/i }).click();
    await expect(page).toHaveURL(/\/pacientes/);
    await expect(
      page.getByRole("heading", { name: /pacientes/i })
    ).toBeVisible();

    // Navigate to Configurações
    await page.getByRole("link", { name: /configurações/i }).click();
    await expect(page).toHaveURL(/\/configuracoes/);
    await expect(
      page.getByRole("heading", { name: /configurações/i })
    ).toBeVisible();

    // Navigate back to Dashboard
    await page.getByRole("link", { name: /dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test.skip("maintains navigation state across pages", async ({ page }) => {
    await page.goto("/dashboard");

    // Check that navigation is visible on all pages
    await page.getByRole("link", { name: /agenda/i }).click();
    await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();

    await page.getByRole("link", { name: /pacientes/i }).click();
    await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
  });

  test.skip("highlights active navigation item", async ({ page }) => {
    await page.goto("/dashboard");

    // Dashboard should be highlighted
    const dashboardLink = page.getByRole("link", { name: /dashboard/i });
    await expect(dashboardLink).toHaveAttribute("data-active", "true");

    // Navigate to Agenda
    await page.getByRole("link", { name: /agenda/i }).click();
    const agendaLink = page.getByRole("link", { name: /agenda/i });
    await expect(agendaLink).toHaveAttribute("data-active", "true");
  });
});

test.describe("Responsive Navigation", () => {
  test.skip("mobile menu toggle works", async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");

    // Find and click mobile menu button
    const menuButton = page.getByRole("button", { name: /menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // Check that navigation is now visible
    await expect(page.getByRole("link", { name: /agenda/i })).toBeVisible();
  });
});
