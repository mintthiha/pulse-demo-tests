@UI @Budgets
Feature: Category Budgets

  @Smoke
  Scenario: Budgets page shows empty state when no budgets exist
    Given the user is on the dashboard
    When the user visits the budgets page
    Then the budgets empty state is visible

  @Smoke
  Scenario: Budgets page is reachable from the dashboard
    Given the user is on the dashboard
    When the user visits the budgets page
    Then the page title contains "Bloom"

  Scenario: Create a category budget
    Given the user is on the dashboard
    When the user visits the budgets page
    And the user creates a budget for category "Groceries" with a monthly limit of 400
    Then the budget "Groceries" is visible
    And the budget "Groceries" shows a monthly limit of "$400.00"

  Scenario: Budgets page shows multiple budgets
    Given the user is on the dashboard
    When the user visits the budgets page
    And the user creates a budget for category "Dining" with a monthly limit of 150
    And the user creates a budget for category "Transport" with a monthly limit of 100
    Then the budget "Dining" is visible
    And the budget "Transport" is visible

  Scenario: Delete a category budget
    Given the user is on the dashboard
    When the user visits the budgets page
    And the user creates a budget for category "Shopping" with a monthly limit of 200
    And the user deletes the budget "Shopping"
    Then the budget "Shopping" is not visible

  Scenario: Opening a budget navigates to its detail page
    Given the user is on the dashboard
    When the user visits the budgets page
    And the user creates a budget for category "Entertainment" with a monthly limit of 80
    And the user opens the budget "Entertainment"
    Then the budget detail heading shows "Entertainment"
