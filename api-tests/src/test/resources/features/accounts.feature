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