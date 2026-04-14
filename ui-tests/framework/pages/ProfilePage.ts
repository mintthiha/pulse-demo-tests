import { Locator, Page, expect } from "@playwright/test";

export class ProfilePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly saveButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Profile", exact: true });
    this.firstNameInput = page.getByPlaceholder("Your first name");
    this.lastNameInput = page.getByPlaceholder("Your last name");
    this.usernameInput = page.getByPlaceholder("unique_username");
    this.emailInput = page.getByPlaceholder("you@example.com");
    this.saveButton = page.getByRole("button", { name: "Save profile" });
    this.successMessage = page.getByText("Profile saved");
  }

  async goto() {
    await this.page.goto("/profile");
    await expect(this.heading).toBeVisible();
    await expect(this.firstNameInput).toBeVisible();
  }

  async saveProfile(firstName: string, lastName: string, username: string, email: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.saveButton.click();
    await expect(this.successMessage).toBeVisible();
  }
}
