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
  await dashboard.createAccount(name, type as "CHEQUING" | "SAVINGS");
});

/**
 * Creates an account and stores its ID in BloomWorld.accountIds.
 * Used in scenarios where a later step needs to reference this account (e.g. transfers).
 */
Given("a {string} account exists for {string}", async function (this: BloomWorld, type: string, name: string) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.createAccount(name, type as "CHEQUING" | "SAVINGS");

  // Grab the account ID from the href of the most recently created account row link
  const accountRow = this.page.getByRole("link", { name: new RegExp(name) }).first();
  const href = await accountRow.getAttribute("href");
  this.accountIds[name] = href?.split("/account/")[1] ?? "";
});

/**
 * Clicks an account row on the dashboard and waits for navigation to the account detail page.
 */
When("the user opens the account for {string}", async function (this: BloomWorld, name: string) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.clickAccount(name);
  await this.page.waitForURL(/\/account\//);
});

/**
 * Clicks the back link on the account detail page and waits for the dashboard URL.
 */
When("the user navigates back to accounts", async function (this: BloomWorld) {
  const accountPage = new AccountPage(this.page);
  await accountPage.goBack();
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
 * Asserts an account row link with the given owner name is visible on the dashboard.
 */
Then("an account row for {string} is visible", async function (this: BloomWorld, name: string) {
  await expect(this.page.getByRole("link", { name: new RegExp(name) }).first()).toBeVisible();
});

/**
 * Asserts the account type badge (span element) inside the account row shows the correct type.
 * Scoped to span to avoid matching the type toggle buttons or stats section.
 */
Then("the account row shows type {string}", async function (this: BloomWorld, type: string) {
  const accountRow = this.page.getByRole("link", { name: new RegExp(type) }).first();
  await expect(accountRow.locator("span").getByText(type)).toBeVisible();
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
  await expect(this.page).toHaveURL("/");
});

/**
 * Asserts the Account Balances bar chart section is visible on the dashboard.
 * This chart only renders when two or more accounts exist.
 */
Then("the account balances chart is visible", async function (this: BloomWorld) {
  const dashboard = new DashboardPage(this.page);
  await expect(dashboard.balancesChart).toBeVisible();
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