import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { BloomWorld } from "../support/world";
import { DashboardPage } from "../pages/DashboardPage";

Given("the user visits the home page", async function (this: BloomWorld) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.gotoHome();
});

Given("the signed-in user has completed onboarding", async function (this: BloomWorld) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.gotoHome();

  if (await dashboard.onboardingHeading.isVisible().catch(() => false)) {
    await dashboard.completeOnboarding();
  }
});

Then("the user is redirected to the login page", async function (this: BloomWorld) {
  await expect(this.page).toHaveURL(/\/login$/);
  await expect(this.page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
});

Then("the onboarding screen is visible", async function (this: BloomWorld) {
  const dashboard = new DashboardPage(this.page);
  await expect(dashboard.onboardingHeading).toBeVisible();
  await expect(dashboard.continueToBloomButton).toBeVisible();
});

Then("the dashboard greeting is visible", async function (this: BloomWorld) {
  const dashboard = new DashboardPage(this.page);
  await expect(dashboard.greetingHeading).toBeVisible();
  await expect(dashboard.ownerNameInput).toBeVisible();
});
