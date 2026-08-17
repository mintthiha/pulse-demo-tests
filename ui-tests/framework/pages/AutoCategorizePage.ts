import { Page, Locator, expect } from "@playwright/test";

export class AutoCategorizePage {
  readonly page: Page;
  readonly merchantInput: Locator;
  readonly addRuleButton: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.merchantInput = page.getByPlaceholder("Merchant name, e.g. Loblaws");
    this.addRuleButton = page.getByRole("button", { name: "Add rule" });
    this.emptyState = page.getByText("No rules yet. Add one above or use AI suggestions.");
  }

  async goto() {
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/categorization-rules") &&
          response.request().method() === "GET"
      ),
      this.page.goto("/auto-categorize"),
    ]);
  }

  ruleRow(merchant: string): Locator {
    return this.page.locator("li").filter({ hasText: merchant }).last();
  }

  async createRule(merchant: string, category: string) {
    await this.merchantInput.fill(merchant);
    await this.page.getByPlaceholder("Merchant name, e.g. Loblaws").locator("..").getByRole("combobox").selectOption(category);
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/categorization-rules") &&
          response.request().method() === "PUT" &&
          response.ok()
      ),
      this.addRuleButton.click(),
    ]);
    await expect(this.ruleRow(merchant)).toBeVisible();
  }

  async editRule(merchant: string, newMerchant: string, newCategory: string) {
    await this.ruleRow(merchant).getByRole("button", { name: `Edit rule for ${merchant}` }).click();
    const editRow = this.page.locator("li").filter({ has: this.page.getByPlaceholder("Merchant name") });
    await editRow.getByPlaceholder("Merchant name").fill(newMerchant);
    await editRow.getByRole("combobox").selectOption(newCategory);
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          /\/api\/bloom\/categorization-rules\/[^/]+$/.test(response.url()) &&
          response.request().method() === "PATCH" &&
          response.ok()
      ),
      editRow.getByRole("button", { name: "Save" }).click(),
    ]);
    await expect(this.ruleRow(newMerchant)).toBeVisible();
  }

  async deleteRule(merchant: string) {
    await this.ruleRow(merchant).getByRole("button", { name: `Delete rule for ${merchant}` }).click();
    await expect(this.page.getByRole("button", { name: /^Delete$/ }).last()).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          /\/api\/bloom\/categorization-rules\/[^/]+$/.test(response.url()) &&
          response.request().method() === "DELETE" &&
          (response.status() === 200 || response.status() === 204)
      ),
      this.page.getByRole("button", { name: /^Delete$/ }).last().click(),
    ]);
    await expect(this.ruleRow(merchant)).not.toBeVisible();
  }
}
