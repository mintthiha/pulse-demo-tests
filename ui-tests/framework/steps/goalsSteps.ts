import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { BloomWorld } from "../support/world";
import { GoalsPage } from "../pages/GoalsPage";

When("the user visits the goals page", async function (this: BloomWorld) {
  const goals = new GoalsPage(this.page);
  await goals.goto();
});

When("the user creates a goal named {string} with a target of {int}", async function (
  this: BloomWorld,
  name: string,
  target: number
) {
  const goals = new GoalsPage(this.page);
  await goals.createGoal(name, target);
});

When("the user edits the goal {string} to be named {string} with a target of {int}", async function (
  this: BloomWorld,
  currentName: string,
  newName: string,
  newTarget: number
) {
  const goals = new GoalsPage(this.page);
  await goals.editGoal(currentName, newName, newTarget);
});

When("the user deletes the goal {string}", async function (this: BloomWorld, name: string) {
  const goals = new GoalsPage(this.page);
  await goals.deleteGoal(name);
});

Then("the goals empty state is visible", async function (this: BloomWorld) {
  const goals = new GoalsPage(this.page);
  await expect(goals.emptyState).toBeVisible();
});

Then("the goal {string} is visible", async function (this: BloomWorld, name: string) {
  const goals = new GoalsPage(this.page);
  await expect(goals.goalCard(name)).toBeVisible();
});

Then("the goal {string} is not visible", async function (this: BloomWorld, name: string) {
  const goals = new GoalsPage(this.page);
  await expect(goals.goalCard(name)).not.toBeVisible();
});

Then("the goal {string} shows {string} of {string}", async function (
  this: BloomWorld,
  name: string,
  current: string,
  target: string
) {
  const goals = new GoalsPage(this.page);
  await expect(goals.goalCard(name).getByText(`${current} of ${target}`)).toBeVisible();
});

Then("the goal {string} shows {int}%", async function (this: BloomWorld, name: string, percent: number) {
  const goals = new GoalsPage(this.page);
  await expect(goals.goalCard(name).getByText(`${percent}%`)).toBeVisible();
});

Then("the goal {string} is marked as complete", async function (this: BloomWorld, name: string) {
  const goals = new GoalsPage(this.page);
  await expect(goals.goalCard(name).getByText("Goal reached!")).toBeVisible();
});
