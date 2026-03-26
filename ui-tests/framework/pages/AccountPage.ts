import { Page, Locator, expect } from "@playwright/test";

export class AccountPage {
  readonly page: Page;
  readonly amountInput: Locator;
  readonly descriptionInput: Locator;
  readonly analyticsPanel: Locator;
  readonly balanceHistoryChart: Locator;
  readonly transactionTypeChart: Locator;

  constructor(page: Page) {
    this.page = page;
    this.amountInput = page.locator('input[type="number"]');
    this.descriptionInput = page.getByPlaceholder("Description (optional)");
    this.analyticsPanel = page.getByText("Analytics");
    this.balanceHistoryChart = page.getByText("Balance History");
    this.transactionTypeChart = page.getByText("Transaction Types");
  }

  /**
   * Clicks the operation selector tab (Deposit, Withdraw, or Transfer).
   */
  async selectOperation(op: "deposit" | "withdraw" | "transfer") {
    const label = op.charAt(0).toUpperCase() + op.slice(1);
    await this.page.getByRole("button", { name: new RegExp(`^${label}$`, "i") }).first().click();
  }

  /**
   * Performs a deposit and waits for the success message.
   *
   * @param amount      the amount to deposit
   * @param description optional description to attach to the transaction
   */
  async deposit(amount: number, description?: string) {
    await this.selectOperation("deposit");
    await this.amountInput.fill(String(amount));
    if (description) await this.descriptionInput.fill(description);
    await this.page.getByRole("button", { name: /^Deposit$/i }).last().click();
    await expect(this.page.getByText(/Deposit successful/i)).toBeVisible();
  }

  /**
   * Performs a withdrawal and waits for the success message.
   *
   * @param amount      the amount to withdraw
   * @param description optional description to attach to the transaction
   */
  async withdraw(amount: number, description?: string) {
    await this.selectOperation("withdraw");
    await this.amountInput.fill(String(amount));
    if (description) await this.descriptionInput.fill(description);
    await this.page.getByRole("button", { name: /^Withdraw$/i }).last().click();
    await expect(this.page.getByText(/Withdraw successful/i)).toBeVisible();
  }

  /**
   * Performs a transfer to the given account ID and waits for the success message.
   *
   * @param toAccountId the destination account ID
   * @param amount      the amount to transfer
   * @param description optional description to attach to the transaction
   */
  async transfer(toAccountId: string, amount: number, description?: string) {
    await this.selectOperation("transfer");
    await this.page.getByPlaceholder("Destination account ID").fill(toAccountId);
    await this.amountInput.fill(String(amount));
    if (description) await this.descriptionInput.fill(description);
    await this.page.getByRole("button", { name: /^Transfer$/i }).last().click();
    await expect(this.page.getByText(/Transfer successful/i)).toBeVisible();
  }

  /**
   * Asserts that an error message is visible on the page.
   *
   * @param message the expected error text
   */
  async expectError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  /** Clicks the back link and waits for navigation to the dashboard. */
  async goBack() {
    await this.page.getByRole("link", { name: /Accounts/i }).click();
    await this.page.waitForURL("/");
  }
}
