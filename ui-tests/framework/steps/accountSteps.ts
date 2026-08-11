import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { BloomWorld } from "../support/world";
import { DashboardPage } from "../pages/DashboardPage";
import { AccountPage } from "../pages/AccountPage";

/**
 * Navigates to the Bloom dashboard.
 * Used as the starting point for most scenarios.
 */
Given("the user is on the dashboard", async function (this: BloomWorld) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.goto();
});

/**
 * Creates an account via the dashboard form.
 * Stores nothing — used when we only need the account to exist visually.
 */
When("the user creates a {string} account for {string}", async function (this: BloomWorld, type: string, name: string) {
  const dashboard = new DashboardPage(this.page);
  const accountId = await dashboard.createAccount(name, type as "CHEQUING" | "SAVINGS" | "TFSA" | "RRSP" | "FHSA" | "CREDIT");
  this.accountIds[name] = accountId;
});

/**
 * Creates an account and stores its ID in BloomWorld.accountIds.
 * The ID is captured from the POST response body, since account rows
 * now live at /accounts rather than on the dashboard.
 */
Given("a {string} account exists for {string}", async function (this: BloomWorld, type: string, name: string) {
  const dashboard = new DashboardPage(this.page);
  // Register waiters for the second loadAccounts() *before* clicking Open.
  // onCreated fires after POST /accounts → loadAccounts() fires 6–7 parallel
  // API calls → setAccounts() only after ALL complete.
  // createAccount() waits for GET /api/bloom/accounts (exact URL, no subdirs).
  // We cover the remaining calls here.
  //
  // Registration order matters: Playwright delivers each matching response to
  // the first registered handler. The hard waiter (#1) must be registered
  // before the optional race (#2) so that monthly(current) is caught by #1
  // and monthly(previous) — if it fires — is caught by #2. If there is no
  // previous range query, #2's 5 s timeout wins the race instead.
  const firstMonthly = this.page.waitForResponse(
    (r) => r.url().includes("/api/bloom/accounts/summary/monthly") && r.request().method() === "GET",
    { timeout: 55000 }
  );
  const secondMonthlyOrTimeout = Promise.race([
    this.page.waitForResponse(
      (r) => r.url().includes("/api/bloom/accounts/summary/monthly") && r.request().method() === "GET",
      { timeout: 55000 }
    ),
    new Promise<void>((resolve) => setTimeout(resolve, 5000)),
  ]);
  const loadAccountsSettled = Promise.all([
    firstMonthly,
    secondMonthlyOrTimeout,
    this.page.waitForResponse(
      (r) => r.url().includes("/api/bloom/savings-goals") && r.request().method() === "GET",
      { timeout: 55000 }
    ),
    this.page.waitForResponse(
      (r) => r.url().includes("/api/bloom/budgets") && r.request().method() === "GET",
      { timeout: 55000 }
    ),
    this.page.waitForResponse(
      (r) =>
        r.url().includes("/api/bloom/recurring") &&
        r.request().method() === "GET" &&
        !r.url().includes("/apply-due"),
      { timeout: 55000 }
    ),
    this.page.waitForResponse(
      (r) => r.url().includes("/api/bloom/accounts/summary/trends") && r.request().method() === "GET",
      { timeout: 55000 }
    ),
  ]);
  const accountId = await dashboard.createAccount(name, type as "CHEQUING" | "SAVINGS" | "TFSA" | "RRSP" | "FHSA" | "CREDIT");
  this.accountIds[name] = accountId;
  await loadAccountsSettled;
});

When("the user creates a {string} account called {string} for {string}", async function (
  this: BloomWorld,
  type: string,
  nickname: string,
  ownerName: string
) {
  const dashboard = new DashboardPage(this.page);
  const accountId = await dashboard.createAccount(
    ownerName,
    type as "CHEQUING" | "SAVINGS" | "TFSA" | "RRSP" | "FHSA" | "CREDIT",
    nickname
  );
  this.accountIds[nickname] = accountId;
});

/**
 * Navigates to the account detail page for the given account.
 * Uses the stored account ID for direct navigation when available (fast path),
 * otherwise falls back to /accounts to find and click the row link.
 */
When("the user opens the account for {string}", async function (this: BloomWorld, name: string) {
  const accountId = this.accountIds[name];
  if (accountId) {
    await this.page.goto(`/account/${accountId}`);
    await this.page.waitForURL(/\/account\//);
  } else {
    const dashboard = new DashboardPage(this.page);
    await dashboard.gotoAccounts();
    await dashboard.clickAccount(name);
    await this.page.waitForURL(/\/account\//);
  }
});

/**
 * Clicks the back link on the account detail page and waits for the dashboard URL.
 */
When("the user navigates back to accounts", async function (this: BloomWorld) {
  const accountPage = new AccountPage(this.page);
  await accountPage.goBack();
});

When("the user returns to the dashboard", async function (this: BloomWorld) {
  const accountPage = new AccountPage(this.page);
  await accountPage.goBack();
  const dashboard = new DashboardPage(this.page);
  await dashboard.goto();
});

When("the user changes the account nickname to {string}", async function (this: BloomWorld, nickname: string) {
  const accountPage = new AccountPage(this.page);
  await accountPage.updateNickname(nickname);
});

/**
 * Asserts the browser page title contains the expected text.
 */
Then("the page title contains {string}", async function (this: BloomWorld, title: string) {
  await expect(this.page).toHaveTitle(new RegExp(title));
});

/**
 * Asserts the header banner contains the expected text.
 * Scoped to the banner role to avoid matching footer text.
 */
Then("the header shows {string}", async function (this: BloomWorld, text: string) {
  await expect(this.page.getByRole("banner").getByText(text)).toBeVisible();
});

/**
 * Navigates to /accounts then asserts the account row link is visible.
 * Account rows live at /accounts, not on the main dashboard.
 */
Then("an account row for {string} is visible", async function (this: BloomWorld, name: string) {
  const dashboard = new DashboardPage(this.page);
  if (!this.page.url().includes("/accounts")) {
    await dashboard.gotoAccounts();
  }
  await expect(dashboard.accountRow(name)).toBeVisible();
});

Then("the account row for {string} shows owner {string}", async function (
  this: BloomWorld,
  nickname: string,
  ownerName: string
) {
  const dashboard = new DashboardPage(this.page);
  if (!this.page.url().includes("/accounts")) {
    await dashboard.gotoAccounts();
  }
  const row = dashboard.accountRow(nickname);
  await expect(row).toBeVisible();
  await expect(row.getByText(ownerName)).toBeVisible();
});

/**
 * Asserts a Sonner confirmation toast with the given message is shown.
 * Covers the "Account opened" toast fired after a successful account creation.
 */
Then("a confirmation toast {string} is shown", async function (this: BloomWorld, message: string) {
  await expect(this.page.getByText(message, { exact: true })).toBeVisible();
});

/**
 * Navigates to /accounts then asserts the account row is in the viewport.
 */
Then("the account row for {string} is visible in the viewport", async function (
  this: BloomWorld,
  name: string
) {
  const dashboard = new DashboardPage(this.page);
  if (!this.page.url().includes("/accounts")) {
    await dashboard.gotoAccounts();
  }
  await expect(dashboard.accountRow(name)).toBeInViewport();
});

/**
 * Navigates to /accounts then asserts the account type badge is visible in the list.
 */
Then("the account row shows type {string}", async function (this: BloomWorld, type: string) {
  const typeLabelMap: Record<string, string> = {
    CHEQUING: "Chequing",
    SAVINGS: "Savings",
    TFSA: "TFSA",
    RRSP: "RRSP",
    FHSA: "FHSA",
    CREDIT: "Credit",
  };

  const dashboard = new DashboardPage(this.page);
  if (!this.page.url().includes("/accounts")) {
    await dashboard.gotoAccounts();
  }
  const expectedLabel = typeLabelMap[type] ?? type;
  await expect(this.page.getByText(expectedLabel, { exact: true }).first()).toBeVisible();
});

/**
 * Asserts the Open button is disabled when no account name has been entered.
 */
Then("the open button is disabled", async function (this: BloomWorld) {
  const dashboard = new DashboardPage(this.page);
  await expect(dashboard.openButton).toBeDisabled();
});

/**
 * Asserts the account detail page heading shows the correct owner name.
 */
Then("the account heading shows {string}", async function (this: BloomWorld, name: string) {
  await expect(this.page.getByRole("heading", { name })).toBeVisible();
});

Then("the account nickname section shows {string}", async function (this: BloomWorld, nickname: string) {
  const section = this.page.getByText("Account Nickname", { exact: true }).locator("../..");
  await expect(section.getByText(nickname, { exact: true })).toBeVisible();
});

/**
 * Asserts the account type badge on the detail page.
 * Climbs up from the heading to its parent container to find the badge.
 */
Then("the account type badge shows {string}", async function (this: BloomWorld, type: string) {
  const heading = this.page.getByRole("heading").first();
  await expect(heading.locator("..").getByText(type)).toBeVisible();
});

/**
 * Asserts the available balance on the account detail page.
 * Scoped to the "Available Balance" label container to avoid matching transaction amounts.
 */
Then("the available balance shows {string}", async function (this: BloomWorld, balance: string) {
  await expect(this.page.getByText("Available Balance").locator("..").getByText(balance)).toBeVisible();
});

/**
 * Asserts the current URL is the dashboard root.
 */
Then("the user should be back on the dashboard", async function (this: BloomWorld) {
  await expect(this.page).toHaveURL(/\/(\?.*)?$/);
});

/**
 * Asserts the Account Balances bar chart section is visible on the dashboard.
 * This chart only renders when two or more accounts exist.
 */
Then("the account balances chart is visible", async function (this: BloomWorld) {
  const dashboard = new DashboardPage(this.page);
  await expect(dashboard.balancesChart).toBeVisible();
});

When("the user deletes the account", async function (this: BloomWorld) {
  await this.page.getByRole("button", { name: "Delete" }).click();
  await Promise.all([
    this.page.waitForResponse(
      (response) =>
        /\/api\/bloom\/accounts\/[^/]+$/.test(response.url()) &&
        response.request().method() === "DELETE" &&
        (response.status() === 200 || response.status() === 204)
    ),
    this.page.getByRole("button", { name: "Confirm" }).click(),
  ]);
  // Redirects to /?deleted=... after account removal
  await this.page.waitForURL(/\/(\?.*)?$/);
});

When("the user cancels account deletion", async function (this: BloomWorld) {
  await this.page.getByRole("button", { name: "Delete" }).click();
  await this.page.getByRole("button", { name: "Cancel" }).click();
});

Then("the account row for {string} is not visible", async function (this: BloomWorld, name: string) {
  const dashboard = new DashboardPage(this.page);
  if (!this.page.url().includes("/accounts")) {
    await dashboard.gotoAccounts();
  }
  await expect(dashboard.accountRow(name)).not.toBeVisible();
});

/**
 * Clicks the Freeze button and waits for the account to reflect the frozen state.
 */
When("the user freezes the account", async function (this: BloomWorld) {
  const accountPage = new AccountPage(this.page);
  await accountPage.freeze();
});

/**
 * Clicks the Unfreeze button and waits for the account to reflect the active state.
 */
When("the user unfreezes the account", async function (this: BloomWorld) {
  const accountPage = new AccountPage(this.page);
  await accountPage.unfreeze();
});

/**
 * Asserts the FROZEN badge is visible in the account card header.
 */
Then("the frozen badge is visible", async function (this: BloomWorld) {
  const accountPage = new AccountPage(this.page);
  await expect(accountPage.frozenBadge).toBeVisible();
});

/**
 * Asserts the FROZEN badge is no longer visible in the account card header.
 */
Then("the frozen badge is not visible", async function (this: BloomWorld) {
  const accountPage = new AccountPage(this.page);
  await expect(accountPage.frozenBadge).not.toBeVisible();
});

/**
 * Asserts the frozen account message banner is visible below the account card.
 */
Then("the frozen account message is visible", async function (this: BloomWorld) {
  const accountPage = new AccountPage(this.page);
  await expect(accountPage.frozenMessage).toBeVisible();
});

/**
 * Asserts the New Transaction panel is not rendered (account is frozen).
 */
Then("the transaction form is hidden", async function (this: BloomWorld) {
  const accountPage = new AccountPage(this.page);
  await expect(accountPage.newTransactionPanel).not.toBeVisible();
});

/**
 * Asserts the New Transaction panel is rendered (account is active).
 */
Then("the transaction form is visible", async function (this: BloomWorld) {
  const accountPage = new AccountPage(this.page);
  await expect(accountPage.newTransactionPanel).toBeVisible();
});
