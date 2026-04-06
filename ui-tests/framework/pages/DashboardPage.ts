import { Page, Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly nicknameInput: Locator;
  readonly ownerNameInput: Locator;
  readonly openButton: Locator;
  readonly accountTypeSelect: Locator;
  readonly balancesChart: Locator;
  readonly onboardingHeading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly continueToBloomButton: Locator;
  readonly greetingHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nicknameInput = page.getByPlaceholder("Account nickname");
    this.ownerNameInput = page.getByPlaceholder("Account holder name");
    this.openButton = page.getByRole("button", { name: "Open", exact: true });
    this.accountTypeSelect = page.getByLabel("Account type");
    this.balancesChart = page.getByText("Account Balances");
    this.onboardingHeading = page.getByRole("heading", { name: "Create your profile" });
    this.firstNameInput = page.getByPlaceholder("Your first name");
    this.lastNameInput = page.getByPlaceholder("Your last name");
    this.usernameInput = page.getByPlaceholder("unique_username");
    this.emailInput = page.getByPlaceholder("you@example.com");
    this.continueToBloomButton = page.getByRole("button", { name: "Continue to Bloom" });
    this.greetingHeading = page.getByRole("heading", { name: /Good morning/i });
  }

  accountRow(text: string) {
    return this.page.locator('a[href^="/account/"]').filter({ hasText: text }).first();
  }

  /** Navigates to the dashboard root URL. */
  async goto() {
    await this.gotoHome();
    await this.completeOnboardingIfNeeded();
    await expect(this.ownerNameInput).toBeVisible();
  }

  /** Navigates to the home page and waits for initial profile/account bootstrap requests. */
  async gotoHome() {
    await this.page.goto("/");

    if (/\/login(?:\?|$)/.test(this.page.url())) {
      return;
    }

    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/profile") &&
          response.request().method() === "GET"
      ),
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/accounts") &&
          response.request().method() === "GET"
      ),
    ]);
  }

  /**
   * Creates a profile when the signed-in user reaches the onboarding screen.
   * This keeps existing dashboard scenarios working after Bloom added profile setup.
   */
  async completeOnboardingIfNeeded() {
    if (!(await this.onboardingHeading.isVisible().catch(() => false))) {
      return;
    }

    const username = `ui_${Math.random().toString(36).slice(2, 10)}`;

    await this.firstNameInput.fill("UI");
    await this.lastNameInput.fill("Tester");
    await this.usernameInput.fill(username);

    if (!(await this.emailInput.inputValue()).trim()) {
      await this.emailInput.fill(`${username}@example.com`);
    }

    await this.continueToBloomButton.click();
    await expect(this.onboardingHeading).not.toBeVisible();
    await expect(this.ownerNameInput).toBeVisible();
  }

  async completeOnboarding(firstName = "UI", lastName = "Tester") {
    const username = `ui_${Math.random().toString(36).slice(2, 10)}`;

    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.usernameInput.fill(username);

    if (!(await this.emailInput.inputValue()).trim()) {
      await this.emailInput.fill(`${username}@example.com`);
    }

    await this.continueToBloomButton.click();
    await expect(this.onboardingHeading).not.toBeVisible();
    await expect(this.ownerNameInput).toBeVisible();
  }

  /**
   * Fills in the account creation form and submits it.
   * Waits for the new account row to appear before resolving.
   */
  async createAccount(ownerName: string, type: "CHEQUING" | "SAVINGS" = "CHEQUING", nickname?: string) {
    if (nickname) {
      await this.nicknameInput.fill(nickname);
    }
    await this.ownerNameInput.fill(ownerName);
    await this.accountTypeSelect.selectOption(type);
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/accounts") &&
          response.request().method() === "POST" &&
          response.status() === 201
      ),
      this.openButton.click({ force: true }),
    ]);
    await expect(this.accountRow(ownerName)).toBeVisible();
  }

  /** Clicks the first matching account row text to navigate to the account detail page. */
  async clickAccount(ownerName: string) {
    await this.accountRow(ownerName).click();
  }
}
