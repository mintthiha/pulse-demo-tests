import { Page, Locator, expect } from "@playwright/test";

export class AccountPage {
  readonly page: Page;
  readonly amountInput: Locator;
  readonly categorySelect: Locator;
  readonly destinationAccountSelect: Locator;
  readonly customCategoryInput: Locator;
  readonly descriptionInput: Locator;
  readonly nicknameInput: Locator;
  readonly analyticsPanel: Locator;
  readonly balanceHistoryChart: Locator;
  readonly transactionTypeChart: Locator;
  readonly freezeButton: Locator;
  readonly unfreezeButton: Locator;
  readonly frozenBadge: Locator;
  readonly frozenMessage: Locator;
  readonly newTransactionPanel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.amountInput = page.locator('input[type="number"]');
    this.categorySelect = page.locator("form select").first();
    this.destinationAccountSelect = page.getByLabel("Destination account");
    this.customCategoryInput = page.getByPlaceholder("Enter custom category");
    this.descriptionInput = page.getByPlaceholder("Description (optional)");
    this.nicknameInput = page.getByPlaceholder("Optional nickname");
    this.analyticsPanel = page.getByText("Analytics");
    this.balanceHistoryChart = page.getByText("Balance History");
    this.transactionTypeChart = page.getByText("Transaction Types");
    this.freezeButton = page.getByRole("button", { name: /^Freeze$/i });
    this.unfreezeButton = page.getByRole("button", { name: /^Unfreeze$/i });
    this.frozenBadge = page.getByText("FROZEN", { exact: true });
    this.frozenMessage = page.getByText("This account is frozen");
    this.newTransactionPanel = page.getByText("New Transaction");
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
   * @param category optional category to attach to the transaction
   */
  async deposit(amount: number, category?: string) {
    await this.selectOperation("deposit");
    await this.amountInput.fill(String(amount));
    if (category) {
      await this.selectCategory(category);
    }
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          /\/api\/bloom\/accounts\/.+\/deposit$/.test(response.url()) &&
          response.request().method() === "POST" &&
          response.ok()
      ),
      this.page.getByRole("button", { name: /^Deposit$/i }).last().click(),
    ]);
  }

  /**
   * Performs a withdrawal and waits for the success message.
   *
   * @param amount      the amount to withdraw
   * @param category optional category to attach to the transaction
   */
  async withdraw(amount: number, category?: string) {
    await this.selectOperation("withdraw");
    await this.amountInput.fill(String(amount));
    if (category) {
      await this.selectCategory(category);
    }
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          /\/api\/bloom\/accounts\/.+\/withdraw$/.test(response.url()) &&
          response.request().method() === "POST" &&
          response.ok()
      ),
      this.page.getByRole("button", { name: /^Withdraw$/i }).last().click(),
    ]);
  }

  /**
   * Performs a transfer to the destination account whose option text contains the given label.
   *
   * @param destinationAccountLabel text displayed in the destination account picker
   * @param amount      the amount to transfer
   * @param description optional description to attach to the transaction
   */
  async transfer(destinationAccountLabel: string, amount: number, description?: string) {
    await this.selectOperation("transfer");
    const destinationOption = this.destinationAccountSelect
      .locator("option")
      .filter({ hasText: destinationAccountLabel })
      .first();
    const destinationValue = await destinationOption.getAttribute("value");
    if (!destinationValue) {
      throw new Error(`Destination account option not found: ${destinationAccountLabel}`);
    }
    await this.destinationAccountSelect.selectOption(destinationValue);
    await this.amountInput.fill(String(amount));
    if (description) await this.descriptionInput.fill(description);
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          /\/api\/bloom\/accounts\/.+\/transfer$/.test(response.url()) &&
          response.request().method() === "POST" &&
          response.ok()
      ),
      this.page.getByRole("button", { name: /^Transfer$/i }).last().click(),
    ]);
  }

  /** Selects an existing category option, or uses the Custom flow for free-form categories. */
  async selectCategory(category: string) {
    const matchingOption = this.categorySelect.locator("option", { hasText: category }).first();
    if (await matchingOption.count()) {
      await this.categorySelect.selectOption({ label: category });
      return;
    }

    await this.categorySelect.selectOption("Custom...");
    await this.customCategoryInput.fill(category);
  }

  async updateNickname(nickname: string) {
    await this.page.getByRole("button", { name: "Edit" }).first().click();
    await expect(this.nicknameInput).toBeVisible();
    await this.nicknameInput.fill(nickname);
    await this.page.getByRole("button", { name: "Save" }).first().click({ force: true });
  }

  /**
   * Asserts that an error message is visible on the page.
   *
   * @param message the expected error text
   */
  async expectError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  /**
   * Clicks the Freeze button and waits for the Unfreeze button to confirm the state change.
   */
  async freeze() {
    await this.freezeButton.click();
    await expect(this.unfreezeButton).toBeVisible();
  }

  /**
   * Clicks the Unfreeze button and waits for the Freeze button to confirm the state change.
   */
  async unfreeze() {
    await this.unfreezeButton.click();
    await expect(this.freezeButton).toBeVisible();
  }

  /** Clicks the back link and waits for navigation to the dashboard. */
  async goBack() {
    await this.page.getByRole("link", { name: /Accounts/i }).click();
    await this.page.waitForURL("/");
  }
}
