@Bloom @SavingsGoals
Feature: Savings Goals

  @Smoke
  Scenario: Create and list a savings goal
    Given a chequing account exists for "Goals API Owner"
    When a savings goal named "Vacation Fund" is created for the account with target amount 1000.00
    Then the response status is 201
    And the goal name is "Vacation Fund"
    And the goal target amount is 1000.0
    And the goal percentage reached is 0.0
    When all savings goals are listed
    Then the response status is 200
    And the goal list includes name "Vacation Fund"

  Scenario: Percentage reached reflects the linked account's live balance
    Given a chequing account exists for "Goals Progress Owner"
    And the account has been funded with 250.00
    When a savings goal named "Emergency Fund" is created for the account with target amount 500.00
    Then the response status is 201
    And the goal percentage reached is 50.0

  @Smoke
  Scenario: Update and delete a savings goal
    Given a chequing account exists for "Goals Lifecycle Owner"
    And a savings goal named "Old Goal" exists for the account with target amount 300.00
    When the savings goal is updated to name "New Goal", target amount 600.00
    Then the response status is 200
    And the goal name is "New Goal"
    And the goal target amount is 600.0
    When the savings goal is deleted
    Then the response status is 204
    When all savings goals are listed
    Then the goal list has 0 goal

  @Validation
  Scenario: Creating a goal for a nonexistent account is rejected
    When a savings goal named "Orphan Goal" is created for account "does-not-exist" with target amount 100.00
    Then the response status is 404
    And the error message is "Account not found"

  @Validation
  Scenario: Updating a goal to a nonexistent account is rejected
    Given a chequing account exists for "Goals Reassign Owner"
    And a savings goal named "Portable Goal" exists for the account with target amount 100.00
    When the savings goal is updated to account "does-not-exist", name "Portable Goal", target amount 100.00
    Then the response status is 404
    And the error message is "Account not found"

  @Validation
  Scenario: Updating a nonexistent savings goal returns 404
    When the savings goal "does-not-exist" is updated to account "irrelevant", name "Ghost Goal", target amount 100.00
    Then the response status is 404
    And the error message is "Savings goal does-not-exist not found"

  @Validation
  Scenario: Deleting a nonexistent savings goal returns 404
    When the savings goal "does-not-exist" is deleted
    Then the response status is 404
    And the error message is "Savings goal does-not-exist not found"

  @Validation
  Scenario: Creating a goal without an accountId is rejected
    When a savings goal is created without an accountId
    Then the response status is 400
    And the error message is "accountId must be a string"

  @Validation
  Scenario: Creating a goal without a name is rejected
    Given a chequing account exists for "Goals Validation Owner"
    When a savings goal is created without a name
    Then the response status is 400
    And the error message is "name must be a string"

  @Validation
  Scenario: Creating a goal with a non-positive target amount is rejected
    Given a chequing account exists for "Goals Target Owner"
    When a savings goal named "Zero Target" is created for the account with target amount 0.00
    Then the response status is 400
    And the error message is "targetAmount must be positive"

  @Validation
  Scenario: Listing savings goals requires authentication
    When savings goals are listed without authentication
    Then the response status is 401
    And the error message is "Unauthorized"
