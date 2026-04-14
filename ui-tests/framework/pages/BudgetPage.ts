import { Locator, Page } from "@playwright/test";

export class BudgetPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  metricCard(label: string): Locator {
    return this.page.getByText(label, { exact: true }).locator("..");
  }
}
