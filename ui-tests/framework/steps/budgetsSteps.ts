import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { BloomWorld } from "../support/world";
import { BudgetPage } from "../pages/BudgetPage";

When("the user visits the budgets page", async function (this: BloomWorld) {
  const budgets = new BudgetPage(this.page);
  await budgets.goto();
});

When(
  "the user creates a budget for category {string} with a monthly limit of {int}",
  async function (this: BloomWorld, category: string, monthlyLimit: number) {
    const budgets = new BudgetPage(this.page);
    this.budgetIds[category] = await budgets.createBudget(category, monthlyLimit);
  }
);

When("the user deletes the budget {string}", async function (this: BloomWorld, category: string) {
  const budgets = new BudgetPage(this.page);
  await budgets.deleteBudget(category);
});

When("the user opens the budget {string}", async function (this: BloomWorld, category: string) {
  const budgets = new BudgetPage(this.page);
  await budgets.openBudgetDetail(this.budgetIds[category]);
});

Then("the budgets empty state is visible", async function (this: BloomWorld) {
  const budgets = new BudgetPage(this.page);
  await expect(budgets.emptyState).toBeVisible();
});

Then("the budget {string} is visible", async function (this: BloomWorld, category: string) {
  const budgets = new BudgetPage(this.page);
  await expect(budgets.budgetRow(category)).toBeVisible();
});

Then("the budget {string} is not visible", async function (this: BloomWorld, category: string) {
  const budgets = new BudgetPage(this.page);
  await expect(budgets.budgetRow(category)).not.toBeVisible();
});

Then(
  "the budget {string} shows a monthly limit of {string}",
  async function (this: BloomWorld, category: string, limit: string) {
    const budgets = new BudgetPage(this.page);
    await expect(budgets.budgetRow(category).getByText(`of ${limit} available`)).toBeVisible();
  }
);
