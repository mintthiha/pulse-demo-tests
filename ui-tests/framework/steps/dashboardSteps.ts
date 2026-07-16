import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { BloomWorld } from "../support/world";
import { DashboardPage } from "../pages/DashboardPage";

When("the user selects the single dashboard view", async function (this: BloomWorld) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.chooseSingleDashboardView();
});

When("the user selects the double dashboard view", async function (this: BloomWorld) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.chooseDoubleDashboardView();
});

Then("the dashboard view preference is {string}", async function (this: BloomWorld, expectedView: string) {
  const storedView = await this.page.evaluate("window.localStorage.getItem('bloom_dashboard_view')");
  expect(storedView).toBe(expectedView);
});

Then("the monthly snapshot is visible", async function (this: BloomWorld) {
  await expect(this.page.getByText("Monthly Snapshot")).toBeVisible();
});

Then("the monthly snapshot shows income {string}, spending {string}, and net {string}", async function (
  this: BloomWorld,
  income: string,
  spending: string,
  net: string
) {
  // Match labels and values exactly so the "+$X vs prior" delta line and cards like
  // "Net Worth" don't cause strict-mode multiple-element matches.
  await expect(
    this.page.getByText("Income", { exact: true }).locator("..").getByText(income, { exact: true })
  ).toBeVisible();
  await expect(
    this.page.getByText("Spending", { exact: true }).locator("..").getByText(spending, { exact: true })
  ).toBeVisible();
  await expect(
    this.page.getByText("Net", { exact: true }).locator("..").getByText(net, { exact: true })
  ).toBeVisible();
});

Then("the monthly snapshot shows spending category {string}", async function (this: BloomWorld, category: string) {
  await expect(this.page.getByText(category, { exact: true }).first()).toBeVisible();
});

When("the user saves a {string} budget with a monthly limit of {int}", async function (
  this: BloomWorld,
  category: string,
  monthlyLimit: number
) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.saveBudget(category, monthlyLimit);
});

When("the user deletes the {string} budget", async function (this: BloomWorld, category: string) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.deleteBudget(category);
});

Then("the {string} budget shows {string} spent of {string}", async function (
  this: BloomWorld,
  category: string,
  spent: string,
  limit: string
) {
  const dashboard = new DashboardPage(this.page);
  const row = dashboard.budgetRow(category);
  await expect(row.getByText(`${spent} spent of ${limit}`)).toBeVisible();
});

Then("the {string} budget shows {string} remaining", async function (
  this: BloomWorld,
  category: string,
  remaining: string
) {
  const dashboard = new DashboardPage(this.page);
  await expect(dashboard.budgetRow(category).getByText(`${remaining} remaining`)).toBeVisible();
});

Then("the {string} budget shows {int}% used", async function (this: BloomWorld, category: string, percent: number) {
  const dashboard = new DashboardPage(this.page);
  await expect(dashboard.budgetRow(category).getByText(`${percent}% used`)).toBeVisible();
});

Then("the {string} budget shows {string} over budget", async function (
  this: BloomWorld,
  category: string,
  amount: string
) {
  const dashboard = new DashboardPage(this.page);
  await expect(dashboard.budgetRow(category).getByText(`${amount} over budget`)).toBeVisible();
});

Then("the {string} budget is not visible", async function (this: BloomWorld, category: string) {
  const dashboard = new DashboardPage(this.page);
  await expect(dashboard.budgetRow(category)).not.toBeVisible();
});
