@Bloom
Feature: Account Management

  @Accounts @Smoke
  Scenario: Create a chequing account
    When a chequing account is created for "Alice Martin"
    Then the response status is 201
    And the account owner is "Alice Martin"
    And the account type is "CHEQUING"
    And the account balance is 0.0
    And the account is not frozen

  @Accounts @Smoke
  Scenario: Create a savings account
    When a savings account is created for "Bob Tremblay"
    Then the response status is 201
    And the account owner is "Bob Tremblay"
    And the account type is "SAVINGS"
    And the account balance is 0.0

  @Accounts
  Scenario Outline: Create all supported account types
    When a "<type>" account is created for "<owner>"
    Then the response status is 201
    And the account owner is "<owner>"
    And the account type is "<type>"
    And the account balance is 0.0

    Examples:
      | type   | owner             |
      | TFSA   | Taylor Investor   |
      | RRSP   | Riley Retirement  |
      | FHSA   | Frankie Home      |
      | CREDIT | Casey Cardholder  |

  @Accounts
  Scenario: Cannot create account without an owner name
    When an account is created with an empty owner name
    Then the response status is 400
    And the error message is "ownerName is required"

  @Accounts @Smoke
  Scenario: Retrieve an existing account by ID
    Given a chequing account exists for "Carol Dubois"
    When the account is fetched by ID
    Then the response status is 200
    And the account owner is "Carol Dubois"

  @Accounts
  Scenario: Fetching a non-existent account returns 404
    When account "nonexistent-id-000" is fetched
    Then the response status is 404

  @Accounts @Smoke
  Scenario: List all accounts returns a non-empty array
    Given a chequing account exists for "Pierre Gagnon"
    When all accounts are listed
    Then the response status is 200
    And the response contains at least 1 account

  @Accounts
  Scenario: List all accounts includes both chequing and savings accounts
    Given a chequing account exists for "Sophie Martin"
    And a savings account exists for "Louis Tremblay"
    When all accounts are listed
    Then the response status is 200
    And the list includes an account for "Sophie Martin"
    And the list includes an account for "Louis Tremblay"

  @Accounts @RiskManagement
  Scenario: Freeze an account
    Given a chequing account exists for "Ryan Cote"
    When the account is frozen
    Then the response status is 200
    And the account is now frozen

  @Accounts @RiskManagement
  Scenario: Unfreeze a frozen account
    Given a frozen chequing account exists for "Emma Paquette"
    When the account is unfrozen
    Then the response status is 200
    And the account is not frozen

  @Accounts @Smoke
  Scenario: Update account nickname
    Given a chequing account exists for "Nick Name Owner"
    When the account nickname is updated to "Emergency Fund"
    Then the response status is 200
    And the account nickname is "Emergency Fund"

  @Accounts @Smoke
  Scenario: Monthly summary counts deposits and categorized withdrawals
    Given a chequing account exists for "Summary Owner"
    And 1000.00 is deposited into the account with category "Salary"
    And 250.00 is withdrawn from the account with category "Groceries"
    When the monthly summary is fetched
    Then the response status is 200
    And the monthly summary income is 1000.0
    And the monthly summary spending is 250.0
    And the monthly summary net cash flow is 750.0
    And the monthly summary includes category "Groceries" with spending 250.0

  @Accounts
  Scenario: Monthly summary excludes transfers
    Given a chequing account exists for "Summary Source"
    And 1000.00 is deposited into the account with category "Salary"
    And a second chequing account exists for "Summary Target"
    When 300.00 is transferred to the second account
    And the monthly summary is fetched
    Then the response status is 200
    And the monthly summary income is 1000.0
    And the monthly summary spending is 0.0
    And the monthly summary net cash flow is 1000.0
