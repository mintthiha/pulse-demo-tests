import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { BloomWorld } from "../support/world";
import { ProfilePage } from "../pages/ProfilePage";
import { DashboardPage } from "../pages/DashboardPage";
import { BudgetPage } from "../pages/BudgetPage";

When("the user visits the profile page", async function (this: BloomWorld) {
  const profilePage = new ProfilePage(this.page);
  await profilePage.goto();
});

When(
  "the user saves the profile with first name {string}, last name {string}, and username prefix {string}",
  async function (this: BloomWorld, firstName: string, lastName: string, usernamePrefix: string) {
    const profilePage = new ProfilePage(this.page);
    const username = `${usernamePrefix}_${Math.random().toString(36).slice(2, 8)}`.toLowerCase();
    const email = `${username}@example.com`;
    await profilePage.saveProfile(firstName, lastName, username, email);
    this.savedProfile = { firstName, lastName, username, email };
  }
);

When("the user reloads the profile page", async function (this: BloomWorld) {
  await this.page.reload();
  await expect(this.page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
});

Then("the onboarding form is prefilled from the Google session", async function (this: BloomWorld) {
  const dashboard = new DashboardPage(this.page);
  await expect(dashboard.firstNameInput).toHaveValue("UI");
  await expect(dashboard.lastNameInput).toHaveValue("Automation");
  await expect(dashboard.emailInput).toHaveValue(this.testUser.email);
});

Then("the profile save confirmation is visible", async function (this: BloomWorld) {
  await expect(this.page.getByText("Profile saved")).toBeVisible();
});

Then("the profile form shows the saved values", async function (this: BloomWorld) {
  const profilePage = new ProfilePage(this.page);
  const savedProfile = this.savedProfile;
  if (!savedProfile) {
    throw new Error("No saved profile values are available in the test world.");
  }

  await expect(profilePage.firstNameInput).toHaveValue(savedProfile.firstName);
  await expect(profilePage.lastNameInput).toHaveValue(savedProfile.lastName);
  await expect(profilePage.usernameInput).toHaveValue(savedProfile.username);
  await expect(profilePage.emailInput).toHaveValue(savedProfile.email);
});

Then("the sidebar shows the saved profile identity", async function (this: BloomWorld) {
  const savedProfile = this.savedProfile;
  if (!savedProfile) {
    throw new Error("No saved profile values are available in the test world.");
  }

  // Profile identity now lives in the header's account menu (ProfileMenu), not the
  // sidebar. ProfileMenu only fetches the Prisma profile when the session user id
  // changes, so it still holds stale (empty) data right after a save — reload to
  // pick up the fresh profile, then open the menu to reveal the name/handle text.
  await this.page.reload();
  await this.page.getByRole("button", { name: "Account menu" }).click();
  await expect(this.page.getByText(`${savedProfile.firstName} ${savedProfile.lastName}`)).toBeVisible();
  await expect(this.page.getByText(`@${savedProfile.username}`)).toBeVisible();
});

When("the user opens the {string} budget details", async function (this: BloomWorld, category: string) {
  await this.page.getByRole("link", { name: new RegExp(category) }).first().click();
  await this.page.waitForURL(/\/budgets\//);
});

Then("the budget detail heading shows {string}", async function (this: BloomWorld, category: string) {
  await expect(this.page.getByRole("heading", { name: category })).toBeVisible();
});

Then(
  "the budget detail shows limit {string}, spent {string}, remaining {string}, and usage {string}",
  async function (
    this: BloomWorld,
    limit: string,
    spent: string,
    remaining: string,
    usage: string
  ) {
    const budgetPage = new BudgetPage(this.page);
    await expect(budgetPage.metricCard("Limit").getByText(limit)).toBeVisible();
    await expect(budgetPage.metricCard("Spent").getByText(spent)).toBeVisible();
    await expect(budgetPage.metricCard("Remaining").getByText(remaining)).toBeVisible();
    await expect(budgetPage.metricCard("Usage").getByText(usage)).toBeVisible();
  }
);

Then("the budget detail shows account {string}", async function (this: BloomWorld, accountName: string) {
  await expect(this.page.getByText(accountName, { exact: true }).first()).toBeVisible();
});

Then("the budget detail shows {int} transaction", async function (this: BloomWorld, count: number) {
  await expect(this.page.getByText(new RegExp(`^${count} transaction`))).toBeVisible();
});

Then("the budget detail sections are visible", async function (this: BloomWorld) {
  await expect(this.page.getByText("Daily Spending", { exact: true })).toBeVisible();
  await expect(this.page.getByText("By Account", { exact: true })).toBeVisible();
  // Scope to the section heading paragraph so the sidebar's "Transactions" nav link
  // doesn't cause a strict-mode multiple-element match.
  await expect(this.page.getByRole("paragraph").filter({ hasText: /^Transactions$/ })).toBeVisible();
});
