import { Page, Locator, expect } from "@playwright/test";

export class TransactionsExplorerPage {
  readonly page: Page;
  readonly typeFilter: Locator;
  readonly clearFiltersButton: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.typeFilter = page.getByLabel("Filter by type");
    this.clearFiltersButton = page.getByRole("button", { name: "Clear" });
    this.emptyState = page.getByText("No transactions", { exact: true });
  }

  async goto() {
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          /\/api\/bloom\/transactions/.test(response.url()) &&
          response.request().method() === "GET"
      ),
      this.page.goto("/transactions"),
    ]);
  }

  tableRows() {
    return this.page.locator("table tbody tr");
  }

  async filterByType(type: string) {
    await this.typeFilter.selectOption(type);
    await this.page.waitForResponse(
      (response) =>
        /\/api\/bloom\/transactions/.test(response.url()) &&
        response.request().method() === "GET"
    );
  }

  async clearFilters() {
    await this.clearFiltersButton.click();
    await this.page.waitForResponse(
      (response) =>
        /\/api\/bloom\/transactions/.test(response.url()) &&
        response.request().method() === "GET"
    );
  }
}
