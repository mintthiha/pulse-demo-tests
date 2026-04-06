@UI
Feature: Account Management

  @Smoke
  Scenario: Dashboard loads with the current app shell
    Given the user is on the dashboard
    Then the page title contains "Bloom"
    And the header shows "All systems operational"

  @Smoke
  Scenario: Create a chequing account
    Given the user is on the dashboard
    When the user creates a "CHEQUING" account for "Alice Martin"
    Then an account row for "Alice Martin" is visible
    And the account row shows type "CHEQUING"

  @Smoke
  Scenario: Create a savings account
    Given the user is on the dashboard
    When the user creates a "SAVINGS" account for "Bob Tremblay"
    Then an account row for "Bob Tremblay" is visible
    And the account row shows type "SAVINGS"

  Scenario: Cannot create account with empty name
    Given the user is on the dashboard
    Then the open button is disabled

  @Smoke
  Scenario: Account detail page shows correct info
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Carol Dubois"
    When the user opens the account for "Carol Dubois"
    Then the account heading shows "Carol Dubois"
    And the account type badge shows "CHEQUING"
    And the available balance shows "$0.00"

  Scenario: Balance bar chart appears after creating multiple accounts
    Given the user is on the dashboard
    When the user creates a "CHEQUING" account for "Noah Bergeron"
    And the user creates a "SAVINGS" account for "Olivia Tremblay"
    Then the account balances chart is visible

  Scenario: Account page has back navigation
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "David Lavoie"
    When the user opens the account for "David Lavoie"
    And the user navigates back to accounts
    Then the user should be back on the dashboard