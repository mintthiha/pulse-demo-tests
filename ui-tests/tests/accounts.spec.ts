import { test, expect } from "@playwright/test";
import { DashboardPage } from "../pages/DashboardPage";
import { AccountPage } from "../pages/AccountPage";

test.describe("Account Management", () => {

  test("@smoke dashboard loads with Bloom branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Bloom/);
    await expect(page.getByRole("banner").getByText("Bloom")).toBeVisible();
  });

  test("@smoke create a chequing account", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const name = `Test Chequing ${Date.now()}`;
    await dashboard.createAccount(name, "CHEQUING");
    const accountRow = page.getByRole("link", { name: new RegExp(name) });
    await expect(accountRow).toBeVisible();
    await expect(accountRow.locator("span").getByText("CHEQUING")).toBeVisible();
  });

  test("@smoke create a savings account", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const name = `Test Savings ${Date.now()}`;
    await dashboard.createAccount(name, "SAVINGS");
    const accountRow = page.getByRole("link", { name: new RegExp(name) });
    await expect(accountRow).toBeVisible();
    await expect(accountRow.locator("span").getByText("SAVINGS")).toBeVisible();
  });

  test("cannot create account with empty name", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.openButton).toBeDisabled();
  });

  test("@smoke account detail page shows correct info", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const name = `Detail Test ${Date.now()}`;
    await dashboard.createAccount(name, "CHEQUING");
    await dashboard.clickAccount(name);
    const accountHeader = page.getByRole("heading", { name });
    await expect(accountHeader).toBeVisible();
    await expect(accountHeader.locator("..").getByText("CHEQUING")).toBeVisible();
    await expect(page.getByText("Available Balance").locator("..").getByText("$0.00")).toBeVisible();
  });

  test("account page has back navigation", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const name = `Nav Test ${Date.now()}`;
    await dashboard.createAccount(name, "CHEQUING");
    await dashboard.clickAccount(name);
    const accountPage = new AccountPage(page);
    await accountPage.goBack();
    await expect(page).toHaveURL("/");
  });
});
