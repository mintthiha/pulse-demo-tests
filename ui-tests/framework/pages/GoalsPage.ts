import { Page, Locator, expect } from "@playwright/test";

export class GoalsPage {
  readonly page: Page;
  readonly newGoalButton: Locator;
  readonly goalNameInput: Locator;
  readonly goalTargetInput: Locator;
  readonly saveGoalButton: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newGoalButton = page.getByRole("button", { name: /\+ New goal/i });
    this.goalNameInput = page.getByLabel("Goal name");
    this.goalTargetInput = page.getByLabel("Target amount");
    this.saveGoalButton = page.getByRole("button", { name: "Save goal" });
    this.emptyState = page.getByText("No savings goals yet");
  }

  async goto() {
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/savings-goals") &&
          response.request().method() === "GET"
      ),
      this.page.goto("/goals"),
    ]);
  }

  goalCard(name: string) {
    return this.page.locator("div").filter({ hasText: name }).filter({ hasText: "%" }).last();
  }

  async createGoal(name: string, targetAmount: number) {
    await this.newGoalButton.click();
    await expect(this.goalNameInput).toBeVisible();
    await this.goalNameInput.fill(name);
    await this.goalTargetInput.fill(String(targetAmount));
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/savings-goals") &&
          response.request().method() === "POST" &&
          response.ok()
      ),
      this.saveGoalButton.click(),
    ]);
    await expect(this.goalCard(name)).toBeVisible();
  }

  async editGoal(currentName: string, newName: string, newTargetAmount: number) {
    await this.goalCard(currentName).getByRole("button", { name: "Edit" }).click();
    await expect(this.goalNameInput).toBeVisible();
    await this.goalNameInput.fill(newName);
    await this.goalTargetInput.fill(String(newTargetAmount));
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/savings-goals") &&
          response.request().method() === "PUT" &&
          response.ok()
      ),
      this.saveGoalButton.click(),
    ]);
    await expect(this.goalCard(newName)).toBeVisible();
  }

  async deleteGoal(name: string) {
    await this.goalCard(name).getByRole("button", { name: "Delete" }).click();
    await expect(this.page.getByRole("button", { name: /^Delete$/ }).last()).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/savings-goals") &&
          response.request().method() === "DELETE" &&
          (response.status() === 200 || response.status() === 204)
      ),
      this.page.getByRole("button", { name: /^Delete$/ }).last().click(),
    ]);
    await expect(this.goalCard(name)).not.toBeVisible();
  }
}
