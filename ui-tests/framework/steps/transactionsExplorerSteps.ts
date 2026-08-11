import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { BloomWorld } from "../support/world";
import { TransactionsExplorerPage } from "../pages/TransactionsExplorerPage";

When("the user visits the transactions explorer", async function (this: BloomWorld) {
  const explorer = new TransactionsExplorerPage(this.page);
  await explorer.goto();
});

When("the user filters the transactions explorer by type {string}", async function (
  this: BloomWorld,
  type: string
) {
  const explorer = new TransactionsExplorerPage(this.page);
  await explorer.filterByType(type);
});

When("the user clears the transactions explorer filters", async function (this: BloomWorld) {
  const explorer = new TransactionsExplorerPage(this.page);
  await explorer.clearFilters();
});

Then("the transactions explorer empty state is visible", async function (this: BloomWorld) {
  const explorer = new TransactionsExplorerPage(this.page);
  await expect(explorer.emptyState).toBeVisible();
});

Then("the transactions table shows {int} rows", async function (this: BloomWorld, count: number) {
  const explorer = new TransactionsExplorerPage(this.page);
  await expect(explorer.tableRows()).toHaveCount(count);
});

Then("the transactions table shows the category {string}", async function (
  this: BloomWorld,
  category: string
) {
  await expect(this.page.locator("table").getByText(category).first()).toBeVisible();
});
