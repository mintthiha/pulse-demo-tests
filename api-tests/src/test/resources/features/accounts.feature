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