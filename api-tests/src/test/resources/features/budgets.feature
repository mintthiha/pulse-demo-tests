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

  Scenario: Budget monthly limit can be updated
    When a "Transport" budget is saved with monthly limit 200.00
    Then the response status is 200
    And the budget monthly limit is 200.0
    When a "Transport" budget is saved with monthly limit 350.00
    Then the response status is 200
    And the budget monthly limit is 350.0
    When all budgets are listed
    Then the budget list includes category "Transport"
    And the budget list has 1 budget

  Scenario: Multiple budgets can be created and listed together
    When a "Groceries" budget is saved with monthly limit 400.00
    And a "Utilities" budget is saved with monthly limit 150.00
    When all budgets are listed
    Then the response status is 200
    And the budget list has 2 budget
    And the budget list includes category "Groceries"
    And the budget list includes category "Utilities"

  @Validation
  Scenario: Budget with missing category is rejected
    When a budget is saved without a category
    Then the response status is 400
    And the error message is "category is required"

  @Validation
  Scenario: Budget with missing monthly limit is rejected
    When a budget is saved without a monthly limit
    Then the response status is 400
    And the error message is "monthlyLimit is required"
