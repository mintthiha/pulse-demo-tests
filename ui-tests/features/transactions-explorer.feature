@UI @TransactionsExplorer
Feature: Transactions Explorer

  @Smoke
  Scenario: Transactions page loads and shows empty state when no transactions exist
    Given the user is on the dashboard
    When the user visits the transactions explorer
    Then the transactions explorer empty state is visible

  @Smoke
  Scenario: Transactions explorer lists transactions across all accounts
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Explorer Alice"
    When the user opens the account for "Explorer Alice"
    And the user deposits 500 with description "First deposit"
    And the user withdraws 100 with description "Coffee run"
    And the user visits the transactions explorer
    Then the transactions table shows 2 rows

  Scenario: Transactions explorer shows transaction details
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Explorer Bob"
    When the user opens the account for "Explorer Bob"
    And the user deposits 750 with category "Salary"
    And the user visits the transactions explorer
    Then the transactions table shows the category "Salary"

  Scenario: Filter transactions explorer by type
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Explorer Carol"
    When the user opens the account for "Explorer Carol"
    And the user deposits 400 with description "Income"
    And the user withdraws 50 with description "Expense"
    And the user visits the transactions explorer
    When the user filters the transactions explorer by type "DEPOSIT"
    Then the transactions table shows 1 rows

  Scenario: Clear filters in transactions explorer
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Explorer Dave"
    When the user opens the account for "Explorer Dave"
    And the user deposits 300 with description "Pay"
    And the user withdraws 75 with description "Lunch"
    And the user visits the transactions explorer
    When the user filters the transactions explorer by type "DEPOSIT"
    And the user clears the transactions explorer filters
    Then the transactions table shows 2 rows
