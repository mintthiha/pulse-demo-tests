@Bloom @API_Recurring
Feature: Recurring Transactions API

  @Smoke @Recurring_Create
  Scenario: Create and list recurring rule with account metadata
    Given a chequing account exists for "Recurring API Owner"
    When a recurring "WITHDRAWAL" rule named "Monthly rent" is created for the account with amount 1200.00, category "Rent", frequency "MONTHLY", due in 30 days
    Then the response status is 201
    And the recurring rule name is "Monthly rent"
    And the recurring rule type is "WITHDRAWAL"
    And the recurring rule amount is 1200.0
    And the recurring rule category is "Rent"
    And the recurring rule frequency is "MONTHLY"
    And the recurring rule is active
    And the recurring rule next run matches the start date
    And the recurring rule includes account metadata for "Recurring API Owner"
    When recurring rules are listed
    Then the response status is 200
    And the recurring list includes rule "Monthly rent"

  @Validation
  Scenario: Recurring list requires authentication
    When recurring rules are listed without authentication
    Then the response status is 401
    And the error message is "Unauthorized"

  @Recurring_Create @Validation
  Scenario: Recurring rule validates required name
    Given a chequing account exists for "Recurring Validation Owner"
    When a recurring rule is created without a name
    Then the response status is 400
    And the error message is "name is required"

  @Recurring_Create @Validation
  Scenario: Recurring rule validates frequency
    Given a chequing account exists for "Recurring Frequency Owner"
    When a recurring rule is created with invalid frequency "YEARLY"
    Then the response status is 400
    And the error message is "frequency must be WEEKLY, BIWEEKLY, or MONTHLY"

  @Recurring_Create @Validation
  Scenario: Recurring rule validates end date
    Given a chequing account exists for "Recurring Date Owner"
    When a recurring rule is created with an end date before the start date
    Then the response status is 400
    And the error message is "endDate must be on or after startDate"

  @Recurring_Edit @Recurring_Pause_Resume @Recurring_Delete
  Scenario: Update, pause, resume, and delete recurring rule
    Given a chequing account exists for "Recurring Lifecycle Owner"
    And a due recurring "DEPOSIT" rule named "Lifecycle payroll" is created for the account with amount 500.00, category "Salary", and frequency "BIWEEKLY"
    When the recurring rule is updated to name "Updated payroll", amount 650.00, category "Salary", frequency "MONTHLY"
    Then the response status is 200
    And the recurring rule name is "Updated payroll"
    And the recurring rule amount is 650.0
    And the recurring rule frequency is "MONTHLY"
    When the recurring rule active state is set to false
    Then the response status is 200
    And the recurring rule is paused
    When the recurring rule active state is set to true
    Then the response status is 200
    And the recurring rule is active
    When the recurring rule active state is set to a non-boolean value
    Then the response status is 400
    And the error message is "active must be a boolean"
    When the recurring rule is deleted
    Then the response status is 204
    When recurring rules are listed
    Then the recurring list has 0 rule

  @Recurring_Apply_Due @Regression
  Scenario: Apply due recurring deposit creates a normal transaction
    Given a chequing account exists for "Recurring Due Deposit Owner"
    And a due recurring "DEPOSIT" rule named "Due salary" is created for the account with amount 900.00, category "Salary", and frequency "WEEKLY"
    When due recurring rules are applied
    Then the response status is 200
    And the recurring apply result has 1 applied and 0 failed
    When the transaction history is fetched
    Then the response status is 200
    And there are 1 transactions
    And at least one transaction has category "Salary"

  @Recurring_Apply_Due @Validation
  Scenario: Apply due recurring withdrawal reports insufficient funds
    Given a chequing account exists for "Recurring Due Withdrawal Owner"
    And a due recurring "WITHDRAWAL" rule named "Due rent" is created for the account with amount 900.00, category "Rent", and frequency "MONTHLY"
    When due recurring rules are applied
    Then the response status is 200
    And the recurring apply result has 0 applied and 1 failed
    And the recurring apply failure message is "Insufficient funds"
    When the transaction history is fetched
    Then the response status is 200
    And there are 0 transactions
