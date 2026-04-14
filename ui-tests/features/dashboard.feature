@UI @Dashboard
Feature: Dashboard Insights

  @Smoke
  Scenario: Dashboard view toggle persists selected layout
    Given the user is on the dashboard
    When the user selects the single dashboard view
    Then the dashboard view preference is "single"
    When the user selects the double dashboard view
    Then the dashboard view preference is "double"

  @Smoke
  Scenario: User saves and deletes a budget
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Budget Owner"
    When the user saves a "Groceries" budget with a monthly limit of 500
    Then the "Groceries" budget shows "$0.00" spent of "$500.00"
    And the "Groceries" budget shows "$500.00" remaining
    And the "Groceries" budget shows 0% used
    When the user deletes the "Groceries" budget
    Then the "Groceries" budget is not visible

  @Smoke
  Scenario: Budget shows over-budget state
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Overspend Owner"
    When the user opens the account for "Overspend Owner"
    And the user deposits 500 with category "Salary"
    And the user withdraws 250 with category "Dining"
    And the user returns to the dashboard
    And the user saves a "Dining" budget with a monthly limit of 100
    Then the "Dining" budget shows "$250.00" spent of "$100.00"
    And the "Dining" budget shows "$150.00" over budget
    And the "Dining" budget shows 250% used

  @Smoke
  Scenario: Budget detail page shows monthly activity breakdown
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Budget Detail Owner"
    When the user opens the account for "Budget Detail Owner"
    And the user deposits 1000 with category "Salary"
    And the user withdraws 80 with category "Dining"
    And the user withdraws 25 with category "Dining"
    And the user returns to the dashboard
    And the user saves a "Dining" budget with a monthly limit of 200
    And the user opens the "Dining" budget details
    Then the budget detail heading shows "Dining"
    And the budget detail sections are visible
    And the budget detail shows limit "$200.00", spent "$105.00", remaining "$95.00", and usage "53%"
    And the budget detail shows account "Budget Detail Owner"
    And the budget detail shows 2 transaction
