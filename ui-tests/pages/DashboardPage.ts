import { Page, Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly ownerNameInput: Locator;
  readonly openButton: Locator;
  readonly chequingTypeButton: Locator;
  readonly savingsTypeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.ownerNameInput = page.getByPlaceholder("Account holder name");
    this.openButton = page.getByRole("button", { name: "Open", exact: true });
    this.chequingTypeButton = page.getByRole("button", { name: /Chequing/i });
    this.savingsTypeButton = page.getByRole("button", { name: /Savings/i });
  }

  async goto() {
    await this.page.goto("/");
  }

  async createAccount(ownerName: string, type: "CHEQUING" | "SAVINGS" = "CHEQUING") {
    await this.ownerNameInput.fill(ownerName);
    if (type === "SAVINGS") await this.savingsTypeButton.click();
    else await this.chequingTypeButton.click();
    await this.openButton.click();
    await expect(this.page.getByText(ownerName)).toBeVisible();
  }

  async clickAccount(ownerName: string) {
    await this.page.getByText(ownerName).first().click();
  }
}
