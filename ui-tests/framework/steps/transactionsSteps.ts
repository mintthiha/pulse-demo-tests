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

/**
 * Attempts a withdrawal without waiting for success.
 * Used in negative scenarios where we expect an error message.
 */
When("the user attempts to withdraw {int}", async function (this: BloomWorld, amount: number) {
  const accountPage = new AccountPage(this.page);
  await accountPage.selectOperation("withdraw");
  await accountPage.amountInput.fill(String(amount));
  await this.page.getByRole("button", { name: /^Withdraw$/i }).last().click();
});

/**
 * Transfers the given amount to another account identified by owner name.
 * Looks up the destination account ID from BloomWorld.accountIds,
 * which was populated when the destination account was created via the Given step.
 */
When("the user transfers {int} to {string}'s account", async function (this: BloomWorld, amount: number, name: string) {
  const accountPage = new AccountPage(this.page);
  const toId = this.accountIds[name] ?? "";
  await accountPage.transfer(toId, amount);
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

/**
 * Asserts that a label is visible in the dashboard stats section.
 * Scoped to the stats container via the "Total Balance" anchor to avoid
 * matching the same text elsewhere on the page.
 */
Then("the stats section shows {string}", async function (this: BloomWorld, label: string) {
  const statsSection = this.page.getByText("Total Balance").locator("../..");
  await expect(statsSection.getByText(label)).toBeVisible();
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