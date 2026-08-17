import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { BloomWorld } from "../support/world";
import { AutoCategorizePage } from "../pages/AutoCategorizePage";

When("the user visits the auto-categorize page", async function (this: BloomWorld) {
  const autoCategorize = new AutoCategorizePage(this.page);
  await autoCategorize.goto();
});

When(
  "the user creates a categorization rule for merchant {string} with category {string}",
  async function (this: BloomWorld, merchant: string, category: string) {
    const autoCategorize = new AutoCategorizePage(this.page);
    await autoCategorize.createRule(merchant, category);
  }
);

When(
  "the user edits the categorization rule for {string} to merchant {string} with category {string}",
  async function (this: BloomWorld, merchant: string, newMerchant: string, newCategory: string) {
    const autoCategorize = new AutoCategorizePage(this.page);
    await autoCategorize.editRule(merchant, newMerchant, newCategory);
  }
);

When(
  "the user deletes the categorization rule for {string}",
  async function (this: BloomWorld, merchant: string) {
    const autoCategorize = new AutoCategorizePage(this.page);
    await autoCategorize.deleteRule(merchant);
  }
);

Then("the categorization rules empty state is visible", async function (this: BloomWorld) {
  const autoCategorize = new AutoCategorizePage(this.page);
  await expect(autoCategorize.emptyState).toBeVisible();
});

Then(
  "the categorization rule for {string} is visible",
  async function (this: BloomWorld, merchant: string) {
    const autoCategorize = new AutoCategorizePage(this.page);
    await expect(autoCategorize.ruleRow(merchant)).toBeVisible();
  }
);

Then(
  "the categorization rule for {string} is not visible",
  async function (this: BloomWorld, merchant: string) {
    const autoCategorize = new AutoCategorizePage(this.page);
    await expect(autoCategorize.ruleRow(merchant)).not.toBeVisible();
  }
);
