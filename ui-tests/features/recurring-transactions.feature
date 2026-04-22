@UI @Recurring_Transactions
Feature: Recurring Transactions

  @Smoke @Recurring_Create @Withdrawal
  Scenario: Create recurring withdrawal rule
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Recurring Rent Account"
    When the user creates a recurring "Withdrawal" rule named "Monthly rent" for "Recurring Rent Account" with amount 1200, frequency "Monthly", category "Rent", and description "Apartment rent"
    Then the recurring rule "Monthly rent" is visible
    And the recurring rule "Monthly rent" shows amount "$1,200.00", frequency "Monthly", account "Recurring Rent Account", category "Rent", and description "Apartment rent"
    And the recurring rule "Monthly rent" status is "Active"

  @Smoke @Recurring_Create @Deposit
  Scenario: Create recurring deposit rule
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Recurring Payroll Account"
    When the user creates a recurring "Deposit" rule named "Main payroll" for "Recurring Payroll Account" with amount 2500, frequency "Biweekly", category "Salary", and description "Payroll deposit"
    Then the recurring rule "Main payroll" is visible
    And the recurring rule "Main payroll" status is "Active"

  @Recurring_Transactions @Validation
  Scenario: Recurring rule requires a name
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Recurring Validation Account"
    When the user attempts to save a recurring rule without a name
    Then the recurring rule name validation error is visible

  @Recurring_Edit @Regression
  Scenario: Edit recurring rule
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Recurring Edit Account"
    When the user creates a recurring "Withdrawal" rule named "Old utility bill" for "Recurring Edit Account" with amount 95, frequency "Monthly", category "Utilities", and description "Old utility payment"
    And the user edits recurring rule "Old utility bill"
    Then the recurring edit mode is visible for "Old utility bill"
    When the user saves recurring rule changes named "Updated utilities" with amount 125, frequency "Weekly", category "Utilities", and description "Updated utility payment"
    Then the recurring rule "Updated utilities" is visible
    And the recurring rule "Old utility bill" is not visible
    And the recurring rule "Updated utilities" shows amount "$125.00", frequency "Weekly", account "Recurring Edit Account", category "Utilities", and description "Updated utility payment"

  @Recurring_Edit
  Scenario: Cancel recurring rule edit
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Recurring Cancel Account"
    When the user creates a recurring "Withdrawal" rule named "Original subscription" for "Recurring Cancel Account" with amount 45, frequency "Monthly", category "Entertainment", and description "Streaming subscription"
    And the user edits recurring rule "Original subscription"
    And the user changes recurring rule fields and cancels edit
    Then the recurring create mode is visible
    And the recurring rule "Original subscription" is visible
    And the recurring rule "Cancelled recurring edit" is not visible

  @Recurring_Pause_Resume
  Scenario: Pause and resume recurring rule
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Recurring Pause Account"
    When the user creates a recurring "Deposit" rule named "Weekly allowance" for "Recurring Pause Account" with amount 75, frequency "Weekly", category "Gift", and description "Allowance"
    And the user pauses recurring rule "Weekly allowance"
    Then the recurring rule "Weekly allowance" status is "Paused"
    When the user resumes recurring rule "Weekly allowance"
    Then the recurring rule "Weekly allowance" status is "Active"

  @Recurring_Delete @Delete
  Scenario: Delete recurring rule after confirmation
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Recurring Delete Account"
    When the user creates a recurring "Withdrawal" rule named "Monthly rent" for "Recurring Delete Account" with amount 1200, frequency "Monthly", category "Rent", and description "Apartment rent"
    And the user cancels deletion for recurring rule "Monthly rent"
    Then the recurring rule "Monthly rent" is visible
    When the user confirms deletion for recurring rule "Monthly rent"
    Then the recurring rule "Monthly rent" is not visible

  @Recurring_Apply_Due @Regression
  Scenario: Apply due recurring deposit
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Recurring Due Account"
    When the user creates a due recurring "Deposit" rule named "Due payroll" for "Recurring Due Account" with amount 300, frequency "Weekly", category "Salary", and description "Due payroll deposit"
    And the user applies due recurring rules
    And the user opens the account for "Recurring Due Account"
    Then the available balance shows "$300.00"
    And the transaction category "Salary" is visible
