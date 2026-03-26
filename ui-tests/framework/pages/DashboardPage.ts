import { Page, Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly ownerNameInput: Locator;
  readonly openButton: Locator;
  readonly chequingTypeButton: Locator;
  readonly savingsTypeButton: Locator;
  readonly balancesChart: Locator;

  constructor(page: Page) {
    this.page = page;
    this.ownerNameInput = page.getByPlaceholder("Account holder name");
    this.openButton = page.getByRole("button", { name: "Open", exact: true });
    this.chequingTypeButton = page.getByRole("button", { name: /Chequing/i });
    this.savingsTypeButton = page.getByRole("button", { name: /Savings/i });
    this.balancesChart = page.getByText("Account Balances");
  }

  /** Navigates to the dashboard root URL. */
  async goto() {
    await this.page.goto("/");
  }

  /**
   * Fills in the account creation form and submits it.
   * Waits for the new account row to appear before resolving.
   */
  async createAccount(ownerName: string, type: "CHEQUING" | "SAVINGS" = "CHEQUING") {
    await this.ownerNameInput.fill(ownerName);
    if (type === "SAVINGS") await this.savingsTypeButton.click();
    else await this.chequingTypeButton.click();
    await this.openButton.click();
    await expect(this.page.getByRole("link", { name: new RegExp(ownerName) }).first()).toBeVisible();
  }

  /** Clicks the first matching account row text to navigate to the account detail page. */
  async clickAccount(ownerName: string) {
    await this.page.getByText(ownerName).first().click();
  }
}
