import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { BloomWorld } from "../support/world";

When("the user visits the subscriptions page", async function (this: BloomWorld) {
  await Promise.all([
    this.page.waitForResponse(
      (response) =>
        response.url().includes("/api/bloom/subscriptions") &&
        response.request().method() === "GET"
    ),
    this.page.goto("/subscriptions"),
  ]);
});

Then("the subscriptions empty state is visible", async function (this: BloomWorld) {
  await expect(this.page.getByText("No subscriptions detected yet")).toBeVisible();
});

Then("the subscription {string} is visible", async function (this: BloomWorld, name: string) {
  await expect(this.page.getByText(name, { exact: false }).first()).toBeVisible();
});
