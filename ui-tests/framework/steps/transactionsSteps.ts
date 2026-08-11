import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { BloomWorld } from "../support/world";
import { AccountPage } from "../pages/AccountPage";

/**
 * Deposits the given amount into the current account.
 * Waits for the success message before proceeding.
 */
When("the user deposits {int}", async function (this: BloomWorld, amount: number) {
  const accountPage = new AccountPage(this.page);
  await accountPage.deposit(amount);
});

/**
 * Deposits the given amount with an optional description into the current account.
 * The description will appear in the transaction history.
 */
When("the user deposits {int} with description {string}", async function (this: BloomWorld, amount: number, description: string) {
  const accountPage = new AccountPage(this.page);
  await accountPage.deposit(amount, description);
});

When("the user deposits {int} with category {string}", async function (this: BloomWorld, amount: number, category: string) {
  const accountPage = new AccountPage(this.page);
  await accountPage.deposit(amount, category);
});

/**
 * Withdraws the given amount from the current account.
 * Waits for the success message before proceeding.
 */
When("the user withdraws {int}", async function (this: BloomWorld, amount: number) {
  const accountPage = new AccountPage(this.page);
  await accountPage.withdraw(amount);
});

/**
 * Withdraws the given amount with a description from the current account.
 * The description will appear in the transaction history.
 */
When("the user withdraws {int} with description {string}", async function (this: BloomWorld, amount: number, description: string) {
  const accountPage = new AccountPage(this.page);
  await accountPage.withdraw(amount, description);
});

When("the user withdraws {int} with category {string}", async function (this: BloomWorld, amount: number, category: string) {
  const accountPage = new AccountPage(this.page);
  await accountPage.withdraw(amount, category);
});

/**
 * Attempts a withdrawal without waiting for success.
 * Used in negative scenarios where we expect an error message.
 */
When("the user attempts to withdraw {int}", async function (this: BloomWorld, amount: number) {
  const accountPage = new AccountPage(this.page);
  await accountPage.selectOperation("withdraw");
  await accountPage.amountInput.fill(String(amount));
  await this.page.locator('button[type="submit"]').first().click();
});

/**
 * Transfers the given amount to another account selected by visible account name.
 */
When("the user transfers {int} to {string}'s account", async function (this: BloomWorld, amount: number, name: string) {
  const accountPage = new AccountPage(this.page);
  await accountPage.transfer(name, amount);
});

/**
 * Asserts that an error message is visible on the page.
 */
Then("an error message shows {string}", async function (this: BloomWorld, message: string) {
  const accountPage = new AccountPage(this.page);
  await accountPage.expectError(message);
});

/**
 * Asserts the transaction history record count shown in the history header.
 * e.g. "2 records"
 */
Then("the transaction history shows {int} records", async function (this: BloomWorld, count: number) {
  await expect(this.page.getByText(`${count} records`)).toBeVisible();
});

/**
 * Asserts that a specific transaction description is visible in the history list.
 */
Then("the transaction description {string} is visible", async function (this: BloomWorld, description: string) {
  await expect(this.page.getByText(description)).toBeVisible();
});

Then("the transaction category {string} is visible", async function (this: BloomWorld, category: string) {
  await expect(this.page.locator("span").getByText(category, { exact: true })).toBeVisible();
});

When("the user deletes the transaction {string}", async function (this: BloomWorld, description: string) {
  const row = this.page.locator("div").filter({ hasText: description }).filter({
    has: this.page.getByRole("button", { name: "Delete" }),
  }).last();
  await row.getByRole("button", { name: "Delete" }).click();
  const dialog = this.page.getByRole("alertdialog").or(this.page.getByRole("dialog"));
  await expect(dialog.getByText("Delete transaction?")).toBeVisible();
  await Promise.all([
    this.page.waitForResponse(
      (response) =>
        /\/api\/bloom\/accounts\/[^/]+\/transactions\/[^/]+$/.test(response.url()) &&
        response.request().method() === "DELETE" &&
        (response.status() === 200 || response.status() === 204)
    ),
    dialog.getByRole("button", { name: "Delete" }).click(),
  ]);
});

When("the user cancels transaction deletion for {string}", async function (this: BloomWorld, description: string) {
  const row = this.page.locator("div").filter({ hasText: description }).filter({
    has: this.page.getByRole("button", { name: "Delete" }),
  }).last();
  await row.getByRole("button", { name: "Delete" }).click();
  const dialog = this.page.getByRole("alertdialog").or(this.page.getByRole("dialog"));
  await expect(dialog.getByText("Delete transaction?")).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).not.toBeVisible();
});

/**
 * Asserts that a label is visible in the dashboard stats section.
 * Scoped to the stats container via the "Total Balance" anchor to avoid
 * matching the same text elsewhere on the page.
 */
Then("the stats section shows {string}", async function (this: BloomWorld, label: string) {
  await expect(this.page.getByRole("button", { name: new RegExp(`^${label}`) })).toBeVisible();
});

/**
 * Asserts the Analytics panel heading is visible on the account detail page.
 * This panel only renders after at least one transaction has been made.
 */
Then("the analytics panel is visible", async function (this: BloomWorld) {
  const accountPage = new AccountPage(this.page);
  await expect(accountPage.analyticsPanel).toBeVisible();
});

/**
 * Asserts the Balance History chart label is visible inside the Analytics panel.
 */
Then("the balance history chart is visible", async function (this: BloomWorld) {
  const accountPage = new AccountPage(this.page);
  await expect(accountPage.balanceHistoryChart).toBeVisible();
});

/**
 * Asserts the Transaction Types donut chart label is visible inside the Analytics panel.
 */
Then("the transaction type breakdown is visible", async function (this: BloomWorld) {
  const accountPage = new AccountPage(this.page);
  await expect(accountPage.transactionTypeChart).toBeVisible();
});
