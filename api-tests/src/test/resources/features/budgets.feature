@Bloom @Budgets
Feature: Category Budgets

  @Smoke
  Scenario: Save, list, and delete a budget
    When a "Groceries" budget is saved with monthly limit 500.00
    Then the response status is 200
    And the budget category is "Groceries"
    And the budget monthly limit is 500.0
    When all budgets are listed
    Then the response status is 200
    And the budget list includes category "Groceries"
    When the saved budget is deleted
    Then the response status is 204
    When all budgets are listed
    Then the budget list has 0 budget

  @Smoke
  Scenario: Budget list includes current spending
    Given a chequing account exists for "Budget Api User"
    And the account has been funded with 600.00
    And 125.00 is withdrawn from the account with category "Dining"
    When a "Dining" budget is saved with monthly limit 300.00
    Then the response status is 200
    When all budgets are listed
    Then the response status is 200
    And the "Dining" budget current spending is 125.0
