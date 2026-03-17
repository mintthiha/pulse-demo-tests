import { Page, Locator, expect } from "@playwright/test";

export class AccountPage {
  readonly page: Page;
  readonly amountInput: Locator;
  readonly descriptionInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.amountInput = page.locator('input[type="number"]');
    this.descriptionInput = page.getByPlaceholder("Description (optional)");
  }

  async selectOperation(op: "deposit" | "withdraw" | "transfer") {
    const label = op.charAt(0).toUpperCase() + op.slice(1);
    await this.page.getByRole("button", { name: new RegExp(`^${label}$`, "i") }).first().click();
  }

  async deposit(amount: number, description?: string) {
    await this.selectOperation("deposit");
    await this.amountInput.fill(String(amount));
    if (description) await this.descriptionInput.fill(description);
    await this.page.getByRole("button", { name: /^Deposit$/i }).last().click();
    await expect(this.page.getByText(/Deposit successful/i)).toBeVisible();
  }

  async withdraw(amount: number, description?: string) {
    await this.selectOperation("withdraw");
    await this.amountInput.fill(String(amount));
    if (description) await this.descriptionInput.fill(description);
    await this.page.getByRole("button", { name: /^Withdraw$/i }).last().click();
    await expect(this.page.getByText(/Withdraw successful/i)).toBeVisible();
  }

  async transfer(toAccountId: string, amount: number, description?: string) {
    await this.selectOperation("transfer");
    await this.page.getByPlaceholder("Destination account ID").fill(toAccountId);
    await this.amountInput.fill(String(amount));
    if (description) await this.descriptionInput.fill(description);
    await this.page.getByRole("button", { name: /^Transfer$/i }).last().click();
    await expect(this.page.getByText(/Transfer successful/i)).toBeVisible();
  }

  async expectError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  async goBack() {
    await this.page.getByRole("link", { name: /Accounts/i }).click();
    await this.page.waitForURL("/");
  }
}
