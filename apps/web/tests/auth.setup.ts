import { test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.locator('[data-testid="page-login-button-initial-login"]').click();

  await page.locator('[data-testid="form-login-input-email"]').fill("carlo@carlonicora.com");
  await page.locator('[data-testid="form-login-input-password"]').fill("password");

  await page.locator('[data-testid="form-login-button-submit"]').click();

  await page.waitForURL("/en", { timeout: 10000 });

  await page.locator('[data-testid="page-homepage-container"]').waitFor({ timeout: 10000 });

  await page.context().storageState({ path: authFile });
});
