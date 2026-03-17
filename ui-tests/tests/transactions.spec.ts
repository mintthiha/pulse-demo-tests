import { test, expect } from "@playwright/test";
import { DashboardPage } from "../pages/DashboardPage";
import { AccountPage } from "../pages/AccountPage";

test.describe("Transactions", () => {

  test("@smoke deposit funds", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const name = `Deposit Test ${Date.now()}`;
    await dashboard.createAccount(name, "CHEQUING");
    await dashboard.clickAccount(name);
    const accountPage = new AccountPage(page);
    await accountPage.deposit(500);
    await expect(page.getByText("Available Balance").locator("..").getByText("$500.00")).toBeVisible();
  });

  test("@smoke withdraw funds", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const name = `Withdraw Test ${Date.now()}`;
    await dashboard.createAccount(name, "CHEQUING");
    await dashboard.clickAccount(name);
    const accountPage = new AccountPage(page);
    await accountPage.deposit(1000);
    await accountPage.withdraw(300);
    await expect(page.getByText("Available Balance").locator("..").getByText("$700.00")).toBeVisible();
  });

  test("cannot withdraw more than balance", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const name = `Overdraft Test ${Date.now()}`;
    await dashboard.createAccount(name, "CHEQUING");
    await dashboard.clickAccount(name);
    const accountPage = new AccountPage(page);
    await accountPage.deposit(100);
    await accountPage.selectOperation("withdraw");
    await accountPage.amountInput.fill("500");
    await page.getByRole("button", { name: /^Withdraw$/i }).last().click();
    await accountPage.expectError("Insufficient funds");
  });

  test("@smoke transfer between accounts", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const destName = `Transfer Dest ${Date.now()}`;
    await dashboard.createAccount(destName, "CHEQUING");
    await dashboard.clickAccount(destName);
    await page.waitForURL(/\/account\//);
    const destId = page.url().split("/account/")[1];
    await page.getByRole("link", { name: /Accounts/i }).click();
    await page.waitForURL("/");
    const sourceName = `Transfer Source ${Date.now()}`;
    await dashboard.createAccount(sourceName, "CHEQUING");
    await dashboard.clickAccount(sourceName);
    const accountPage = new AccountPage(page);
    await accountPage.deposit(800);
    await accountPage.transfer(destId, 250);
    await expect(page.getByText("Available Balance").locator("..").getByText("$550.00")).toBeVisible();
  });

  test("transaction history shows operations", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const name = `History Test ${Date.now()}`;
    await dashboard.createAccount(name, "CHEQUING");
    await dashboard.clickAccount(name);
    const accountPage = new AccountPage(page);
    await accountPage.deposit(1000, "Initial deposit");
    await accountPage.withdraw(200, "Coffee run");
    await expect(page.getByText("2 records")).toBeVisible();
  });

  test("transaction description appears in history", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const name = `Description Test ${Date.now()}`;
    await dashboard.createAccount(name, "CHEQUING");
    await dashboard.clickAccount(name);
    const accountPage = new AccountPage(page);
    await accountPage.deposit(500, "Salary payment");
    await expect(page.getByText("Salary payment")).toBeVisible();
  });

  test("dashboard stats update after account creation", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.createAccount(`Stats Test ${Date.now()}`, "CHEQUING");
    await dashboard.createAccount(`Stats Test 2 ${Date.now()}`, "SAVINGS");
    const statsSection = page.getByText("Total Balance").locator("../..");
    await expect(statsSection.getByText("Chequing")).toBeVisible();
    await expect(statsSection.getByText("Savings")).toBeVisible();
  });
});