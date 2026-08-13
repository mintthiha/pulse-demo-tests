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
  readonly recurringRuleNameInput: Locator;
  readonly recurringMerchantInput: Locator;
  readonly recurringAccountSelect: Locator;
  readonly recurringTypeSelect: Locator;
  readonly recurringAmountInput: Locator;
  readonly recurringFrequencySelect: Locator;
  readonly recurringCategorySelect: Locator;
  readonly recurringStartDateInput: Locator;
  readonly recurringEndDateInput: Locator;
  readonly recurringDescriptionInput: Locator;
  readonly saveRecurringRuleButton: Locator;
  readonly applyDueRecurringButton: Locator;
  readonly cancelRecurringEditButton: Locator;

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
    this.greetingHeading = page.getByRole("heading", { name: /Good (morning|afternoon|evening)/i });
    this.recurringRuleNameInput = page.getByLabel("Recurring rule name");
    this.recurringMerchantInput = page.getByLabel("Recurring merchant");
    this.recurringAccountSelect = page.getByLabel("Recurring account");
    this.recurringTypeSelect = page.getByLabel("Recurring transaction type");
    this.recurringAmountInput = page.getByPlaceholder("Amount");
    this.recurringFrequencySelect = page.getByLabel("Recurring frequency");
    this.recurringCategorySelect = page.getByLabel("Recurring category");
    this.recurringStartDateInput = page.getByLabel("Recurring start date");
    this.recurringEndDateInput = page.getByLabel("Recurring end date");
    this.recurringDescriptionInput = page.getByPlaceholder("Description (optional)");
    this.saveRecurringRuleButton = page.getByRole("button", { name: "Save rule" });
    this.applyDueRecurringButton = page.getByRole("button", { name: /^Apply due/ });
    this.cancelRecurringEditButton = page.getByRole("button", { name: "Cancel edit" });
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

  recurringRuleCard(name: string) {
    return this.page.locator("div").filter({ hasText: name }).filter({ hasText: "Next run" }).last();
  }

  /** Navigates to the dashboard root URL. */
  async goto() {
    await this.gotoHome();
    await this.completeOnboardingIfNeeded();
    await expect(this.ownerNameInput).toBeVisible({ timeout: 35000 });
  }

  /** Navigates to the home page and waits for initial profile/account bootstrap requests. */
  async gotoHome() {
    // Attach the response waiters BEFORE navigating. On a warm second navigation
    // (e.g. returning to the dashboard) the bootstrap GETs can resolve before a
    // post-goto waiter would attach, causing it to hang until timeout.
    const bootstrapResponses = Promise.all([
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

    await this.page.goto("/");

    if (/\/login(?:\?|$)/.test(this.page.url())) {
      // Unauthenticated: the dashboard bootstrap GETs never fire. Swallow the
      // pending waiters so they don't surface as unhandled timeout rejections.
      bootstrapResponses.catch(() => {});
      return;
    }

    await bootstrapResponses;
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
    await expect(this.onboardingHeading).not.toBeVisible({ timeout: 30000 });
    await expect(this.ownerNameInput).toBeVisible({ timeout: 35000 });
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
   * Returns the new account ID captured from the POST response body.
   * Account rows now live at /accounts, not on the dashboard, so this
   * method no longer asserts row visibility — call gotoAccounts() first
   * when you need to check the list.
   */
  async createAccount(
    ownerName: string,
    type: "CHEQUING" | "SAVINGS" | "TFSA" | "RRSP" | "FHSA" | "CREDIT" = "CHEQUING",
    nickname?: string
  ): Promise<string> {
    if (nickname) {
      await this.nicknameInput.fill(nickname);
    }
    await this.ownerNameInput.fill(ownerName);
    await this.accountTypeSelect.selectOption(type);
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/accounts") &&
          response.request().method() === "POST" &&
          response.status() === 201
      ),
      this.openButton.click({ force: true }),
    ]);
    // Wait for the accounts-list to reload after creation (exact endpoint match to
    // avoid catching /accounts/summary/monthly which shares the same URL prefix).
    await this.page.waitForResponse(
      (response) =>
        /\/api\/bloom\/accounts$/.test(response.url()) &&
        response.request().method() === "GET" &&
        response.ok()
    );
    const body = await response.json();
    return body.id as string;
  }

  /** Navigates to the /accounts list page and waits for it to load. */
  async gotoAccounts() {
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/accounts") &&
          response.request().method() === "GET" &&
          response.ok()
      ),
      this.page.goto("/accounts"),
    ]);
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
    // Base UI's Dialog renders with role="dialog", not role="alertdialog"
    const dialog = this.page.getByRole("alertdialog").or(this.page.getByRole("dialog"));
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          /\/api\/bloom\/budgets\/[^/]+$/.test(response.url()) &&
          response.request().method() === "DELETE" &&
          response.ok()
      ),
      dialog.getByRole("button", { name: "Delete" }).click(),
    ]);
    await expect(row).not.toBeVisible();
  }

  async saveRecurringRule(input: {
    name: string;
    merchant?: string;
    account: string;
    type: "Deposit" | "Withdrawal";
    amount: number;
    frequency: "Weekly" | "Biweekly" | "Monthly";
    category: string;
    startDate: string;
    description?: string;
    endDate?: string;
    editing?: boolean;
  }) {
    // The "New recurring rule" form section is collapsed by default — open it for new rules.
    // Also waits for RecurringTransactionsCard to mount (only rendered once accounts load).
    if (!input.editing) {
      const toggle = this.page.getByRole("button", { name: "New recurring rule" });
      await expect(toggle).toBeVisible({ timeout: 25000 });
      if ((await toggle.getAttribute("aria-expanded")) !== "true") {
        await toggle.click();
      }
    }
    await this.recurringRuleNameInput.fill(input.name);
    // Subscription detection keys off the distinct "merchant" field, not the rule name —
    // default it to the rule name so subscription-page scenarios can find it without
    // every recurring-rule scenario having to say so explicitly.
    await this.recurringMerchantInput.fill(input.merchant ?? input.name);
    await this.recurringAccountSelect.selectOption({ label: input.account });
    await this.recurringTypeSelect.selectOption({ label: input.type });
    await this.recurringAmountInput.fill(String(input.amount));
    await this.recurringFrequencySelect.selectOption({ label: input.frequency });
    await this.recurringCategorySelect.selectOption({ label: input.category });
    await this.recurringStartDateInput.fill(input.startDate);
    if (input.endDate) {
      await this.recurringEndDateInput.fill(input.endDate);
    }
    if (input.description) {
      await this.recurringDescriptionInput.fill(input.description);
    }

    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/recurring") &&
          response.request().method() === (input.editing ? "PUT" : "POST") &&
          response.ok()
      ),
      this.page.getByRole("button", { name: input.editing ? "Save changes" : "Save rule" }).click(),
    ]);

    await expect(this.recurringRuleCard(input.name)).toBeVisible();
  }

  async openRecurringEdit(name: string) {
    await this.recurringRuleCard(name).getByRole("button", { name: "Edit" }).click();
    await expect(this.page.getByText(`Editing: ${name}`)).toBeVisible();
    await expect(this.cancelRecurringEditButton).toBeVisible();
    await expect(this.page.getByRole("button", { name: "Save changes" })).toBeVisible();
  }

  async cancelRecurringEdit() {
    await this.cancelRecurringEditButton.click();
    await expect(this.page.getByRole("button", { name: "Save rule" })).toBeVisible();
  }

  async setRecurringRulePaused(name: string, paused: boolean) {
    const buttonName = paused ? "Pause" : "Resume";
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          /\/api\/bloom\/recurring\/[^/]+$/.test(response.url()) &&
          response.request().method() === "PATCH" &&
          response.ok()
      ),
      this.recurringRuleCard(name).getByRole("button", { name: buttonName }).click(),
    ]);
  }

  async deleteRecurringRule(name: string, confirm: boolean) {
    await this.recurringRuleCard(name).getByRole("button", { name: "Delete" }).click();
    const dialog = this.page.getByRole("alertdialog").or(this.page.getByRole("dialog"));
    await expect(this.page.getByText(`Delete recurring rule "${name}"?`)).toBeVisible();

    if (!confirm) {
      await this.page.getByRole("button", { name: "Cancel" }).click();
      await expect(this.recurringRuleCard(name)).toBeVisible();
      return;
    }

    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          /\/api\/bloom\/recurring\/[^/]+$/.test(response.url()) &&
          response.request().method() === "DELETE" &&
          response.status() === 204
      ),
      dialog.getByRole("button", { name: "Delete" }).click(),
    ]);
    await expect(this.recurringRuleCard(name)).not.toBeVisible();
  }

  async applyDueRecurringRules() {
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/bloom/recurring/apply-due") &&
          response.request().method() === "POST" &&
          response.ok()
      ),
      this.applyDueRecurringButton.click(),
    ]);
  }

  /** Opens the "New recurring rule" form section if it is currently collapsed. */
  async openNewRecurringForm() {
    const toggle = this.page.getByRole("button", { name: "New recurring rule" });
    await expect(toggle).toBeVisible({ timeout: 25000 });
    if ((await toggle.getAttribute("aria-expanded")) !== "true") {
      await toggle.click();
    }
  }

  async openCustomizePanel() {
    const heading = this.page.getByRole("heading", { name: /Customize/i }).first();
    if (await heading.isVisible()) return;
    await this.page.getByRole("button", { name: /Customize/i }).first().click();
    await expect(heading).toBeVisible();
  }

  async chooseSingleDashboardView() {
    await this.openCustomizePanel();
    await this.page.getByRole("button", { name: "Single", exact: true }).click();
  }

  async chooseDoubleDashboardView() {
    await this.openCustomizePanel();
    await this.page.getByRole("button", { name: "Double", exact: true }).click();
  }

  /** Clicks the first matching account row text to navigate to the account detail page. */
  async clickAccount(ownerName: string) {
    await this.accountRow(ownerName).click();
  }
}
