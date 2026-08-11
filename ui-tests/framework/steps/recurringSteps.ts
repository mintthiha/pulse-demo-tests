import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { BloomWorld } from "../support/world";
import { DashboardPage } from "../pages/DashboardPage";

function todayDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function futureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

When(
  "the user creates a recurring {string} rule named {string} for {string} with amount {int}, frequency {string}, category {string}, and description {string}",
  async function (
    this: BloomWorld,
    type: "Deposit" | "Withdrawal",
    name: string,
    account: string,
    amount: number,
    frequency: "Weekly" | "Biweekly" | "Monthly",
    category: string,
    description: string
  ) {
    const dashboard = new DashboardPage(this.page);
    await dashboard.saveRecurringRule({
      name,
      account,
      type,
      amount,
      frequency,
      category,
      description,
      startDate: futureDate(30),
    });
  }
);

When(
  "the user creates a due recurring {string} rule named {string} for {string} with amount {int}, frequency {string}, category {string}, and description {string}",
  async function (
    this: BloomWorld,
    type: "Deposit" | "Withdrawal",
    name: string,
    account: string,
    amount: number,
    frequency: "Weekly" | "Biweekly" | "Monthly",
    category: string,
    description: string
  ) {
    const dashboard = new DashboardPage(this.page);
    await dashboard.saveRecurringRule({
      name,
      account,
      type,
      amount,
      frequency,
      category,
      description,
      startDate: todayDate(),
    });
  }
);

When("the user attempts to save a recurring rule without a name", async function (this: BloomWorld) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.openNewRecurringForm();
  await dashboard.recurringAccountSelect.selectOption({ index: 1 });
  await dashboard.recurringAmountInput.fill("100");
  await dashboard.recurringStartDateInput.fill(futureDate(10));
  await dashboard.saveRecurringRuleButton.click();
});

When("the user edits recurring rule {string}", async function (this: BloomWorld, name: string) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.openRecurringEdit(name);
});

When(
  "the user saves recurring rule changes named {string} with amount {int}, frequency {string}, category {string}, and description {string}",
  async function (
    this: BloomWorld,
    name: string,
    amount: number,
    frequency: "Weekly" | "Biweekly" | "Monthly",
    category: string,
    description: string
  ) {
    const dashboard = new DashboardPage(this.page);
    const accountOption = await dashboard.recurringAccountSelect.locator("option").nth(1).textContent();
    await dashboard.saveRecurringRule({
      name,
      account: accountOption?.trim() ?? "",
      type: "Withdrawal",
      amount,
      frequency,
      category,
      description,
      startDate: futureDate(45),
      editing: true,
    });
  }
);

When("the user changes recurring rule fields and cancels edit", async function (this: BloomWorld) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.recurringRuleNameInput.fill("Cancelled recurring edit");
  await dashboard.recurringAmountInput.fill("999");
  await dashboard.cancelRecurringEdit();
});

When("the user pauses recurring rule {string}", async function (this: BloomWorld, name: string) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.setRecurringRulePaused(name, true);
});

When("the user resumes recurring rule {string}", async function (this: BloomWorld, name: string) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.setRecurringRulePaused(name, false);
});

When("the user cancels deletion for recurring rule {string}", async function (this: BloomWorld, name: string) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.deleteRecurringRule(name, false);
});

When("the user confirms deletion for recurring rule {string}", async function (this: BloomWorld, name: string) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.deleteRecurringRule(name, true);
});

When("the user applies due recurring rules", async function (this: BloomWorld) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.applyDueRecurringRules();
});

Then("the recurring rule {string} is visible", async function (this: BloomWorld, name: string) {
  const dashboard = new DashboardPage(this.page);
  await expect(dashboard.recurringRuleCard(name)).toBeVisible();
});

Then("the recurring rule {string} is not visible", async function (this: BloomWorld, name: string) {
  const dashboard = new DashboardPage(this.page);
  await expect(dashboard.recurringRuleCard(name)).not.toBeVisible();
});

Then(
  "the recurring rule {string} shows amount {string}, frequency {string}, account {string}, category {string}, and description {string}",
  async function (
    this: BloomWorld,
    name: string,
    amount: string,
    frequency: string,
    account: string,
    category: string,
    description: string
  ) {
    const dashboard = new DashboardPage(this.page);
    const card = dashboard.recurringRuleCard(name);
    await expect(card.getByText(amount).first()).toBeVisible();
    await expect(card.getByText(frequency.toLowerCase()).first()).toBeVisible();
    await expect(card.getByText(account).first()).toBeVisible();
    await expect(card.getByText(category).first()).toBeVisible();
    await expect(card.getByText(description).first()).toBeVisible();
    await expect(card.getByText(/Next run/).first()).toBeVisible();
  }
);

Then("the recurring rule {string} status is {string}", async function (this: BloomWorld, name: string, status: string) {
  const dashboard = new DashboardPage(this.page);
  await expect(dashboard.recurringRuleCard(name).getByText(status, { exact: true })).toBeVisible();
});

Then("the recurring rule name validation error is visible", async function (this: BloomWorld) {
  await expect(this.page.getByText("Enter a rule name")).toBeVisible();
});

Then("the recurring edit mode is visible for {string}", async function (this: BloomWorld, name: string) {
  await expect(this.page.getByText(`Editing: ${name}`)).toBeVisible();
  await expect(this.page.getByRole("button", { name: "Cancel edit" })).toBeVisible();
  await expect(this.page.getByRole("button", { name: "Save changes" })).toBeVisible();
});

Then("the recurring create mode is visible", async function (this: BloomWorld) {
  await expect(this.page.getByRole("button", { name: "Save rule" })).toBeVisible();
});
