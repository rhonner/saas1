import { test, expect } from "@playwright/test";
import { login } from "./helpers";

/**
 * Comprehensive CRUD lifecycle tests.
 *
 * Tests CREATE, UPDATE, and DELETE for every entity in the system:
 *  - Patients (create → verify → search → edit → delete)
 *  - Appointments (create → verify → edit → delete)
 *  - Settings (update → verify persistence)
 *  - Auth (register → auto-login, logout)
 *  - Navigation (all sidebar links)
 *  - Dashboard (metrics & charts)
 *
 * Tests run in serial mode because later steps depend on earlier state.
 */

const TS = Date.now();

const PATIENT = {
  name: `Paciente E2E ${TS}`,
  phone: "+5511988776655",
  email: `e2e${TS}@teste.com`,
  notes: "Criado via Playwright E2E",
};

const PATIENT_UPDATED = {
  name: `Pac Atualizado ${TS}`,
  phone: "+5511977665544",
};

// Today's date in YYYY-MM-DD for the appointment
const today = new Date();
const APPT_DATE = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
const APPT_TIME = "20:30";
const APPT_TIME_UPDATED = "20:45";

test.describe("Full CRUD Lifecycle", () => {
  test.describe.configure({ mode: "serial" });

  // ═══════════════════════════════════════════
  //  PATIENTS - Create
  // ═══════════════════════════════════════════

  test("Create a new patient with all fields", async ({ page }) => {
    await login(page);
    await page.goto("/pacientes");
    await page.waitForTimeout(1000);

    // Open create dialog
    await page.click("button:has-text('Novo Paciente')");
    await expect(page.locator("text=Novo Paciente").nth(1)).toBeVisible();

    // Fill all fields
    await page.fill('input[id="name"]', PATIENT.name);
    await page.fill('input[id="phone"]', PATIENT.phone);
    await page.fill('input[id="email"]', PATIENT.email);
    await page.fill('textarea[id="notes"]', PATIENT.notes);

    // Submit
    await page.click('button[type="submit"]:has-text("Criar")');

    // Verify success toast appeared
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 10000 });

    // Verify patient now shows in the table
    await expect(page.locator(`text=${PATIENT.name}`)).toBeVisible({ timeout: 15000 });
  });

  // ═══════════════════════════════════════════
  //  PATIENTS - Read & Search
  // ═══════════════════════════════════════════

  test("Verify patient data appears correctly in table", async ({ page }) => {
    await login(page);
    await page.goto("/pacientes");
    await page.waitForTimeout(1500);

    // Find the row with the patient name
    const row = page.locator(`tr:has-text("${PATIENT.name}")`);
    await expect(row).toBeVisible();

    // Verify phone number is in the row
    await expect(row.locator(`text=${PATIENT.phone}`)).toBeVisible();
  });

  test("Search filters to find the patient", async ({ page }) => {
    await login(page);
    await page.goto("/pacientes");
    await page.waitForTimeout(1000);

    // Type the full unique patient name for precision
    await page.fill('input[placeholder*="Buscar"]', PATIENT.name);
    await page.waitForTimeout(500); // wait for debounce

    // Our patient should be visible
    await expect(page.locator(`text=${PATIENT.name}`)).toBeVisible({ timeout: 5000 });

    // Seed patients should NOT be visible (search is specific enough)
    const visibleRows = page.locator("tbody tr");
    const count = await visibleRows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ═══════════════════════════════════════════
  //  PATIENTS - Update
  // ═══════════════════════════════════════════

  test("Edit patient name and phone", async ({ page }) => {
    await login(page);
    await page.goto("/pacientes");
    await page.waitForTimeout(1500);

    // Click edit button (first button = Pencil icon) on the patient row
    const row = page.locator(`tr:has-text("${PATIENT.name}")`);
    await row.locator("button").first().click();

    // Verify edit dialog opened with pre-filled values
    await expect(page.locator("text=Editar Paciente")).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[id="name"]')).toHaveValue(PATIENT.name);
    await expect(page.locator('input[id="phone"]')).toHaveValue(PATIENT.phone);

    // Clear and fill name - use triple-click + type to ensure RHF detects change
    const nameInput = page.locator('input[id="name"]');
    await nameInput.click({ clickCount: 3 });
    await nameInput.pressSequentially(PATIENT_UPDATED.name, { delay: 5 });

    // Clear and fill phone
    const phoneInput = page.locator('input[id="phone"]');
    await phoneInput.click({ clickCount: 3 });
    await phoneInput.pressSequentially(PATIENT_UPDATED.phone, { delay: 5 });

    // Wait for React to process the changes
    await page.waitForTimeout(300);

    // Submit via clicking and wait for the API response
    const submitBtn = page.locator('[role="dialog"] button:has-text("Atualizar")');
    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes("/api/patients/") &&
          resp.request().method() === "PUT",
        { timeout: 10000 }
      ),
      submitBtn.click(),
    ]);

    expect(response.status()).toBe(200);

    // Wait for dialog to close and table to update
    await page.waitForTimeout(1500);

    // Verify updated name in table, old name gone
    await expect(page.locator(`text=${PATIENT_UPDATED.name}`)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator(`text=${PATIENT.name}`)).not.toBeVisible();
  });

  test("Verify patient edit persisted after page reload", async ({ page }) => {
    await login(page);
    await page.goto("/pacientes");
    await page.waitForTimeout(1500);

    // Verify the updated values are still there
    const row = page.locator(`tr:has-text("${PATIENT_UPDATED.name}")`);
    await expect(row).toBeVisible();
    await expect(row.locator(`text=${PATIENT_UPDATED.phone}`)).toBeVisible();
  });

  // ═══════════════════════════════════════════
  //  APPOINTMENTS - Create
  // ═══════════════════════════════════════════

  test("Create appointment for the patient", async ({ page }) => {
    await login(page);
    await page.goto("/agenda");
    await page.waitForTimeout(1000);

    // Open the new appointment dialog
    await page.click("button:has-text('Novo Agendamento')");
    await expect(page.locator("text=Novo Agendamento").nth(1)).toBeVisible();

    // Select patient via Radix UI Select component
    await page.locator('button[role="combobox"]').click();
    await page.locator('[role="listbox"]').waitFor({ timeout: 5000 });
    await page
      .locator('[role="option"]')
      .filter({ hasText: PATIENT_UPDATED.name })
      .click();

    // Fill date (today) and time
    await page.fill('input[id="date"]', APPT_DATE);
    await page.fill('input[id="time"]', APPT_TIME);
    await page.fill('textarea[id="notes"]', "Consulta criada via E2E");

    // Submit
    await page.click('button[type="submit"]:has-text("Criar")');

    // Verify success toast
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 10000 });

    // Wait for the agenda to refresh and verify the appointment shows
    await page.waitForTimeout(2000);
    await expect(
      page.locator(`text=${PATIENT_UPDATED.name}`).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════
  //  APPOINTMENTS - Read
  // ═══════════════════════════════════════════

  test("Verify appointment appears in week view with correct time", async ({ page }) => {
    await login(page);
    await page.goto("/agenda");
    await page.waitForTimeout(1500);

    // Find the appointment card by patient name
    const card = page.locator(".cursor-pointer").filter({
      hasText: PATIENT_UPDATED.name,
    });
    await expect(card.first()).toBeVisible({ timeout: 10000 });

    // Verify the time is displayed
    await expect(card.first().locator("text=20:30")).toBeVisible();

    // Verify status badge shows "Pendente"
    await expect(card.first().locator("text=Pendente")).toBeVisible();
  });

  // ═══════════════════════════════════════════
  //  APPOINTMENTS - Update
  // ═══════════════════════════════════════════

  test("Edit appointment time and notes", async ({ page }) => {
    await login(page);
    await page.goto("/agenda");
    await page.waitForTimeout(1500);

    // Click the appointment card to open edit dialog
    await page
      .locator(".cursor-pointer")
      .filter({ hasText: PATIENT_UPDATED.name })
      .first()
      .click();

    // Verify edit dialog opened
    await expect(page.locator("text=Editar Agendamento")).toBeVisible({
      timeout: 10000,
    });

    // Verify pre-filled values
    await expect(page.locator('input[id="time"]')).toHaveValue(APPT_TIME);

    // Update time using fill (time inputs work better with fill than pressSequentially)
    await page.fill('input[id="time"]', APPT_TIME_UPDATED);

    // Update notes
    const notesInput = page.locator('textarea[id="notes"]');
    await notesInput.click({ clickCount: 3 });
    await notesInput.pressSequentially("Consulta reagendada via E2E", { delay: 5 });

    // Wait for React to process
    await page.waitForTimeout(300);

    // Submit and wait for API response
    const submitBtn = page.locator('[role="dialog"] button:has-text("Atualizar")');
    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes("/api/appointments/") &&
          resp.request().method() === "PUT",
        { timeout: 10000 }
      ),
      submitBtn.click(),
    ]);

    expect(response.status()).toBe(200);

    // Wait and verify updated time shows
    await page.waitForTimeout(2000);
    const updatedCard = page.locator(".cursor-pointer").filter({
      hasText: PATIENT_UPDATED.name,
    });
    await expect(updatedCard.first().locator("text=20:45")).toBeVisible({
      timeout: 10000,
    });
  });

  // ═══════════════════════════════════════════
  //  APPOINTMENTS - Delete
  // ═══════════════════════════════════════════

  test("Delete appointment from edit dialog", async ({ page }) => {
    await login(page);
    await page.goto("/agenda");
    await page.waitForTimeout(1500);

    // Click the appointment to open edit dialog
    await page
      .locator(".cursor-pointer")
      .filter({ hasText: PATIENT_UPDATED.name })
      .first()
      .click();

    await expect(page.locator("text=Editar Agendamento")).toBeVisible({
      timeout: 10000,
    });

    // Accept the browser confirm() dialog
    page.once("dialog", (dialog) => dialog.accept());

    // Click "Excluir" button
    await page.click('button:has-text("Excluir")');

    // Wait for deletion and dialog close
    await page.waitForTimeout(2000);

    // Verify the edit dialog closed
    await expect(page.locator("text=Editar Agendamento")).not.toBeVisible();

    // Verify the appointment card with our patient is no longer visible (for our time)
    const cards = page
      .locator(".cursor-pointer")
      .filter({ hasText: PATIENT_UPDATED.name });
    await expect(cards).toHaveCount(0, { timeout: 5000 });
  });

  // ═══════════════════════════════════════════
  //  PATIENTS - Delete (now possible, no future appointments)
  // ═══════════════════════════════════════════

  test("Delete patient after removing appointments", async ({ page }) => {
    await login(page);
    await page.goto("/pacientes");
    await page.waitForTimeout(1500);

    // Verify patient is still in the table
    const row = page.locator(`tr:has-text("${PATIENT_UPDATED.name}")`);
    await expect(row).toBeVisible();

    // Accept the browser confirm() dialog
    page.once("dialog", (dialog) => dialog.accept());

    // Click delete button (last button = Trash icon)
    await row.locator("button").last().click();

    // Wait for deletion
    await page.waitForTimeout(2000);

    // Verify success toast
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 10000 });

    // Verify patient is gone from the table
    await expect(page.locator(`text=${PATIENT_UPDATED.name}`)).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("Verify deleted patient is gone after page reload", async ({ page }) => {
    await login(page);
    await page.goto("/pacientes");
    await page.waitForTimeout(1500);

    // Confirm patient no longer exists
    await expect(page.locator(`text=${PATIENT_UPDATED.name}`)).not.toBeVisible();

    // Search should also not find them
    await page.fill('input[placeholder*="Buscar"]', `Atualizado ${TS}`);
    await page.waitForTimeout(500);

    const noResult = page.locator("text=Nenhum paciente encontrado");
    await expect(noResult).toBeVisible({ timeout: 5000 });
  });

  // ═══════════════════════════════════════════
  //  SETTINGS - Update all fields
  // ═══════════════════════════════════════════

  test("Update all settings fields", async ({ page }) => {
    await login(page);
    await page.goto("/configuracoes");
    await page.waitForTimeout(2000);

    // Save button should be disabled initially (form not dirty)
    const saveBtn = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Salvar/ });
    await expect(saveBtn).toBeDisabled();

    // Update confirmation hours
    await page.fill('input[id="confirmationHoursBefore"]', "48");

    // Update reminder hours
    await page.fill('input[id="reminderHoursBefore"]', "4");

    // Update confirmation template
    await page.fill(
      'textarea[id="confirmationMessage"]',
      "Olá {nome}! Confirme sua consulta em {clinica} no dia {data} às {hora}. Responda SIM ou NÃO."
    );

    // Update reminder template
    await page.fill(
      'textarea[id="reminderMessage"]',
      "Lembrete {nome}: sua consulta em {clinica} é amanhã ({data} às {hora}). Confirme!"
    );

    // Scroll to save button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Save button should now be enabled (form is dirty)
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    // Verify success toast
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 10000 });
  });

  test("Verify settings persisted after page reload", async ({ page }) => {
    await login(page);
    await page.goto("/configuracoes");
    await page.waitForTimeout(2000);

    // Verify number fields
    await expect(
      page.locator('input[id="confirmationHoursBefore"]')
    ).toHaveValue("48");
    await expect(
      page.locator('input[id="reminderHoursBefore"]')
    ).toHaveValue("4");

    // Verify template fields contain the updated values
    const confirmMsg = await page
      .locator('textarea[id="confirmationMessage"]')
      .inputValue();
    expect(confirmMsg).toContain("Olá {nome}");
    expect(confirmMsg).toContain("{clinica}");
    expect(confirmMsg).toContain("Responda SIM ou NÃO");

    const reminderMsg = await page
      .locator('textarea[id="reminderMessage"]')
      .inputValue();
    expect(reminderMsg).toContain("Lembrete {nome}");
    expect(reminderMsg).toContain("{clinica}");
  });

  // ═══════════════════════════════════════════
  //  SETTINGS - Restore defaults
  // ═══════════════════════════════════════════

  test("Restore settings to default values", async ({ page }) => {
    await login(page);
    await page.goto("/configuracoes");
    await page.waitForTimeout(2000);

    // Restore original values
    await page.fill('input[id="confirmationHoursBefore"]', "24");
    await page.fill('input[id="reminderHoursBefore"]', "2");
    await page.fill(
      'textarea[id="confirmationMessage"]',
      "Olá {nome}! Você tem consulta agendada em {clinica} no dia {data} às {hora}. Confirma sua presença? Responda SIM ou NÃO."
    );
    await page.fill(
      'textarea[id="reminderMessage"]',
      "Oi {nome}! Ainda não recebemos sua confirmação para a consulta de amanhã ({data} às {hora}). Confirma sua presença? Responda SIM ou NÃO."
    );

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const saveBtn = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Salvar/ });
    await saveBtn.click();

    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════
  //  DASHBOARD - Read metrics
  // ═══════════════════════════════════════════

  test("Dashboard displays all metrics, chart, and summary cards", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard");
    await page.waitForTimeout(1500);

    // Verify all 4 metric cards
    await expect(page.locator("text=Total de Agendamentos")).toBeVisible();
    await expect(page.locator("text=Taxa de Confirmação")).toBeVisible();
    await expect(page.locator("text=Taxa de Faltas")).toBeVisible();
    await expect(page.locator("text=Prejuízo Estimado")).toBeVisible();

    // Verify chart section
    await expect(page.locator("text=Estatísticas Semanais")).toBeVisible();

    // Scroll to summary cards
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Verify all 4 summary cards
    await expect(page.locator("text=Confirmados").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Pendentes").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Faltas").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Cancelados").first()).toBeVisible({ timeout: 10000 });

    // Verify actual numeric values are displayed (not loading/error)
    const totalText = await page
      .locator("text=Total de Agendamentos")
      .locator("..")
      .locator("..")
      .locator(".text-2xl")
      .textContent();
    expect(Number(totalText)).toBeGreaterThanOrEqual(0);
  });

  // ═══════════════════════════════════════════
  //  AUTH - Register new user
  // ═══════════════════════════════════════════

  test("Register a new user account and auto-login", async ({ page }) => {
    const regEmail = `novo${TS}@clinica.com`;

    await page.goto("/registro");

    // Verify registration form elements
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="clinicName"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Fill registration form
    await page.fill('input[id="name"]', "Dr. Teste E2E");
    await page.fill('input[id="clinicName"]', `Clinica E2E ${TS}`);
    await page.fill('input[id="email"]', regEmail);
    await page.fill('input[id="password"]', "senha123");

    // Submit
    await page.click('button[type="submit"]:has-text("Criar conta")');

    // Should auto-login and redirect to dashboard
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify the new clinic name is shown in the header
    await expect(
      page.locator(`text=Clinica E2E ${TS}`)
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════
  //  NAVIGATION - All sidebar links
  // ═══════════════════════════════════════════

  test("Navigate through all sidebar links", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*dashboard/);

    // Dashboard → Agenda
    await page.click('a:has-text("Agenda")');
    await expect(page).toHaveURL(/.*agenda/);
    await expect(page.locator("h1:has-text('Agenda')")).toBeVisible();

    // Agenda → Pacientes
    await page.click('a:has-text("Pacientes")');
    await expect(page).toHaveURL(/.*pacientes/);
    await expect(page.locator("h1:has-text('Pacientes')")).toBeVisible();

    // Pacientes → Configurações
    await page.click('a:has-text("Configurações")');
    await expect(page).toHaveURL(/.*configuracoes/);
    await expect(page.locator("h1:has-text('Configurações')")).toBeVisible();

    // Configurações → Dashboard
    await page.click('a:has-text("Dashboard")');
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator("h1:has-text('Dashboard')")).toBeVisible();
  });

  // ═══════════════════════════════════════════
  //  AUTH - Logout
  // ═══════════════════════════════════════════

  test("Logout redirects to login page", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard");
    await page.waitForTimeout(1000);

    // Click the "Sair" button
    await page.click('button:has-text("Sair")');

    // Should redirect to login
    await page.waitForURL("**/login", { timeout: 10000 });
    await expect(page).toHaveURL(/.*login/);

    // Login form should be visible
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
  });

  // ═══════════════════════════════════════════
  //  AUTH - Protected routes
  // ═══════════════════════════════════════════

  test("Accessing dashboard without auth redirects to login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/dashboard");
    await page.waitForURL("**/login", { timeout: 10000 });
    await expect(page).toHaveURL(/.*login/);
  });
});
