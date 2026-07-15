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

  @Smoke @Create
  Scenario: Create account with nickname
    Given the user is on the dashboard
    When the user creates a "CHEQUING" account called "Rent Money" for "Alice Martin"
    Then an account row for "Rent Money" is visible
    And the account row for "Rent Money" shows owner "Alice Martin"

  @Create
  Scenario: Creating an account confirms with a toast and reveals the new row
    Given the user is on the dashboard
    When the user creates a "SAVINGS" account for "Grace Hopper"
    Then a confirmation toast "Account opened" is shown
    And the account row for "Grace Hopper" is visible in the viewport

  @Smoke @Saving @Account
  Scenario: Create a savings account
    Given the user is on the dashboard
    When the user creates a "SAVINGS" account for "Bob Tremblay"
    Then an account row for "Bob Tremblay" is visible
    And the account row shows type "SAVINGS"

  @Smoke
  Scenario Outline: Create additional supported account types
    Given the user is on the dashboard
    When the user creates a "<type>" account for "<owner>"
    Then an account row for "<owner>" is visible

    Examples:
      | type   | owner            |
      | TFSA   | Taylor Investor  |
      | RRSP   | Riley Retirement |
      | FHSA   | Frankie Home     |
      | CREDIT | Casey Card       |

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

  Scenario: Edit account nickname on account detail page
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Nina Patel"
    When the user opens the account for "Nina Patel"
    And the user changes the account nickname to "Travel Fund"
    When the user navigates back to accounts
    Then an account row for "Travel Fund" is visible
    And the account row for "Travel Fund" shows owner "Nina Patel"
