import { Page, Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly nicknameInput: Locator;
  readonly ownerNameInput: Locator;
  readonly openButton: Locator;
  readonly accountTypeSelect: Locator;
  readonly monthlySnapshotPanel: Locator;
  readonly budgetsPanel: Locator;
  readonly budgetCategorySelect: Locator;
  readonly budgetLimitInput: Locator;
  readonly saveBudgetButton: Locator;
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
    this.monthlySnapshotPanel = page.getByText("Monthly Snapshot").locator("..");
    this.budgetsPanel = page.getByText("Budgets").locator("..");
    this.budgetCategorySelect = page.getByLabel("Budget category");
    this.budgetLimitInput = page.getByPlaceholder("Monthly limit");
    this.saveBudgetButton = page.getByRole("button", { name: "Save Budget" });
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

  budgetRow(category: string) {
    return this.page
      .locator("div")
      .filter({ has: this.page.getByText(category, { exact: true }), hasText: "used" })
      .last();
  }

  /** Navigates to the dashboard root URL. */
  async goto() {
    await this.gotoHome();
    await this.completeOnboardingIfNeeded();
    await expect(this.ownerNameInput).toBeVisible({ timeout: 10000 });
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
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/accounts/summary/monthly") &&
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
  async createAccount(
    ownerName: string,
    type: "CHEQUING" | "SAVINGS" | "TFSA" | "RRSP" | "FHSA" | "CREDIT" = "CHEQUING",
    nickname?: string
  ) {
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

  async saveBudget(category: string, monthlyLimit: number) {
    await this.budgetCategorySelect.selectOption({ label: category });
    await this.budgetLimitInput.fill(String(monthlyLimit));
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/budgets") &&
          response.request().method() === "PUT" &&
          response.ok()
      ),
      this.saveBudgetButton.click(),
    ]);
    await this.page.waitForResponse(
      (response) =>
        response.url().includes("/api/bloom/budgets") &&
        response.request().method() === "GET" &&
        response.ok()
    );
    await expect(this.budgetRow(category)).toBeVisible();
  }

  async deleteBudget(category: string) {
    const row = this.budgetRow(category);
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "Delete" }).click();
    await expect(row).not.toBeVisible();
  }

  async chooseSingleDashboardView() {
    await this.page.getByTitle("Single column").click();
  }

  async chooseDoubleDashboardView() {
    await this.page.getByTitle("Two columns").click();
  }

  /** Clicks the first matching account row text to navigate to the account detail page. */
  async clickAccount(ownerName: string) {
    await this.accountRow(ownerName).click();
  }
}
