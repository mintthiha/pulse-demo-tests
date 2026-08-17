@UI @AutoCategorize @CategorizationRules
Feature: Auto-Categorization Rules

  @Smoke
  Scenario: Auto-categorize page shows empty state when no rules exist
    Given the user is on the dashboard
    When the user visits the auto-categorize page
    Then the categorization rules empty state is visible

  @Smoke
  Scenario: Auto-categorize page is reachable from the dashboard
    Given the user is on the dashboard
    When the user visits the auto-categorize page
    Then the page title contains "Bloom"

  Scenario: Create a categorization rule
    Given the user is on the dashboard
    When the user visits the auto-categorize page
    And the user creates a categorization rule for merchant "Loblaws" with category "Groceries"
    Then the categorization rule for "Loblaws" is visible

  Scenario: Auto-categorize page shows multiple rules
    Given the user is on the dashboard
    When the user visits the auto-categorize page
    And the user creates a categorization rule for merchant "Netflix" with category "Entertainment"
    And the user creates a categorization rule for merchant "Uber" with category "Transport"
    Then the categorization rule for "Netflix" is visible
    And the categorization rule for "Uber" is visible

  Scenario: Edit a categorization rule
    Given the user is on the dashboard
    When the user visits the auto-categorize page
    And the user creates a categorization rule for merchant "Starbucks" with category "Dining"
    And the user edits the categorization rule for "Starbucks" to merchant "Tim Hortons" with category "Dining"
    Then the categorization rule for "Tim Hortons" is visible
    And the categorization rule for "Starbucks" is not visible

  Scenario: Delete a categorization rule
    Given the user is on the dashboard
    When the user visits the auto-categorize page
    And the user creates a categorization rule for merchant "Amazon" with category "Shopping"
    And the user deletes the categorization rule for "Amazon"
    Then the categorization rule for "Amazon" is not visible
