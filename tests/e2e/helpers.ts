import { Page } from "@playwright/test";

export async function login(page: Page) {
  await page.goto("/login");
  await page.fill('input[id="email"]', "admin@teste.com");
  await page.fill('input[id="password"]', "123456");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");
}
