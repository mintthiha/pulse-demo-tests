import { Page, Locator, expect } from "@playwright/test";

export class BudgetPage {
  readonly page: Page;
  readonly categorySelect: Locator;
  readonly limitInput: Locator;
  readonly saveButton: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.categorySelect = page.getByLabel("Budget category");
    this.limitInput = page.getByPlaceholder("Monthly limit");
    this.saveButton = page.getByRole("button", { name: "Save Budget" });
    this.emptyState = page.getByText("No budgets yet");
  }

  metricCard(label: string): Locator {
    return this.page.getByText(label, { exact: true }).locator("..");
  }

  async goto() {
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/budgets") &&
          response.request().method() === "GET"
      ),
      this.page.goto("/budgets"),
    ]);
  }

  budgetRow(category: string): Locator {
    return this.page.locator("div").filter({ hasText: category }).filter({ hasText: "spent of" }).last();
  }

  async createBudget(category: string, monthlyLimit: number): Promise<string> {
    await this.categorySelect.selectOption(category);
    await this.limitInput.fill(String(monthlyLimit));
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/budgets") &&
          response.request().method() === "PUT" &&
          response.ok()
      ),
      this.saveButton.click(),
    ]);
    await expect(this.budgetRow(category)).toBeVisible();
    const body = await response.json();
    return body.id as string;
  }

  async deleteBudget(category: string) {
    await this.budgetRow(category).getByRole("button", { name: "Delete" }).click();
    await expect(this.page.getByRole("button", { name: /^Delete$/ }).last()).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          /\/api\/bloom\/budgets\/[^/]+$/.test(response.url()) &&
          response.request().method() === "DELETE" &&
          (response.status() === 200 || response.status() === 204)
      ),
      this.page.getByRole("button", { name: /^Delete$/ }).last().click(),
    ]);
    await expect(this.budgetRow(category)).not.toBeVisible();
  }

  async openBudgetDetail(budgetId: string) {
    // Direct navigation avoids the Next.js dev-server chunk-loading flakiness seen with
    // client-side <Link> navigation to a dynamic route (see accountSteps.ts's fast path).
    await this.page.goto(`/budgets/${budgetId}`);
    await this.page.waitForURL(/\/budgets\//);
  }
}
