import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Configuracoes", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/configuracoes");
  });

  test("should display settings form", async ({ page }) => {
    // Wait for settings to load
    await page.waitForTimeout(1500);

    // Use .first() to avoid strict mode violation (sidebar + page title both have "Configurações")
    await expect(page.locator("text=Configurações").first()).toBeVisible();
    await expect(page.locator("text=Horários de Notificação")).toBeVisible();

    // Scroll down to see Templates section
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(500);

    await expect(page.locator("text=Templates de Mensagem")).toBeVisible({ timeout: 10000 });
  });

  test("should display notification hours inputs", async ({ page }) => {
    await expect(page.locator('label:has-text("Antecedência para confirmação")')).toBeVisible();
    await expect(page.locator('label:has-text("Antecedência para lembrete")')).toBeVisible();

    // Verify inputs have values
    const confirmationInput = page.locator('input[id="confirmationHoursBefore"]');
    const reminderInput = page.locator('input[id="reminderHoursBefore"]');

    await expect(confirmationInput).toBeVisible();
    await expect(reminderInput).toBeVisible();
  });

  test("should display message template textareas", async ({ page }) => {
    await expect(page.locator('label:has-text("Template de confirmação")')).toBeVisible();
    await expect(page.locator('label:has-text("Template de lembrete")')).toBeVisible();

    // Verify textareas exist
    const confirmationTextarea = page.locator('textarea[id="confirmationMessage"]');
    const reminderTextarea = page.locator('textarea[id="reminderMessage"]');

    await expect(confirmationTextarea).toBeVisible();
    await expect(reminderTextarea).toBeVisible();
  });

  test("should display available variables", async ({ page }) => {
    await expect(page.locator("text=Variáveis disponíveis")).toBeVisible();
    await expect(page.locator("text={nome}")).toBeVisible();
    await expect(page.locator("text={data}")).toBeVisible();
    await expect(page.locator("text={hora}")).toBeVisible();
    await expect(page.locator("text={clinica}")).toBeVisible();
  });

  test("should display WhatsApp status section", async ({ page }) => {
    await expect(page.locator("text=Conexão WhatsApp")).toBeVisible();
    await expect(page.locator("text=Conexão não configurada")).toBeVisible();
  });

  test("should change value and enable save button", async ({ page }) => {
    // Wait for settings to load
    await page.waitForTimeout(1000);

    // Save button should be disabled initially (not dirty)
    const saveButton = page.locator('button[type="submit"]:has-text("Salvar")');
    await expect(saveButton).toBeDisabled();

    // Change a value
    const confirmationInput = page.locator('input[id="confirmationHoursBefore"]');
    await confirmationInput.fill("48");

    // Save button should now be enabled
    await expect(saveButton).toBeEnabled();
  });

  test("should save settings changes", async ({ page }) => {
    // Wait for settings to load
    await page.waitForTimeout(1500);

    // Get initial value to verify it changed
    const confirmationInput = page.locator('input[id="confirmationHoursBefore"]');
    const initialValue = await confirmationInput.inputValue();

    // Change to a different value
    const newValue = initialValue === "36" ? "24" : "36";
    await confirmationInput.fill(newValue);

    // Change reminder hours
    const reminderInput = page.locator('input[id="reminderHoursBefore"]');
    await reminderInput.fill("3");

    // Submit form - scroll down first to ensure button is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const saveButton = page.locator('button[type="submit"]').filter({ hasText: /Salvar/ });

    // Click and wait a reasonable time for save
    await saveButton.click();
    await page.waitForTimeout(2000);

    // Reload the page to verify the values were saved
    await page.reload();
    await page.waitForTimeout(1500);

    // Check that the value persisted
    const savedValue = await confirmationInput.inputValue();
    expect(savedValue).toBe(newValue);
  });

  test("should load current settings values", async ({ page }) => {
    // Wait for settings to load
    await page.waitForTimeout(1500);

    // Inputs should have values (not empty)
    const confirmationInput = page.locator('input[id="confirmationHoursBefore"]');
    const reminderInput = page.locator('input[id="reminderHoursBefore"]');

    const confirmationValue = await confirmationInput.inputValue();
    const reminderValue = await reminderInput.inputValue();

    expect(confirmationValue).not.toBe("");
    expect(reminderValue).not.toBe("");
    expect(Number(confirmationValue)).toBeGreaterThan(0);
    expect(Number(reminderValue)).toBeGreaterThan(0);
  });
});
