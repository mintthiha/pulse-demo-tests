@UI @Goals
Feature: Savings Goals

  @Smoke
  Scenario: Goals page shows empty state when no goals exist
    Given the user is on the dashboard
    When the user visits the goals page
    Then the goals empty state is visible

  @Smoke
  Scenario: Create a savings goal
    Given the user is on the dashboard
    And a "SAVINGS" account exists for "Goal Owner"
    When the user visits the goals page
    And the user creates a goal named "Emergency Fund" with a target of 5000
    Then the goal "Emergency Fund" is visible
    And the goal "Emergency Fund" shows "$0.00" of "$5,000.00"
    And the goal "Emergency Fund" shows 0%

  Scenario: Goal progress reflects current account balance
    Given the user is on the dashboard
    And a "SAVINGS" account exists for "Saver Sam"
    When the user opens the account for "Saver Sam"
    And the user deposits 2000
    And the user returns to the dashboard
    And the user visits the goals page
    And the user creates a goal named "House Fund" with a target of 4000
    Then the goal "House Fund" shows "$2,000.00" of "$4,000.00"
    And the goal "House Fund" shows 50%

  Scenario: Goal shows completed state when target is reached
    Given the user is on the dashboard
    And a "SAVINGS" account exists for "Funded Sally"
    When the user opens the account for "Funded Sally"
    And the user deposits 1000
    And the user returns to the dashboard
    And the user visits the goals page
    And the user creates a goal named "Vacation" with a target of 500
    Then the goal "Vacation" shows 100%
    And the goal "Vacation" is marked as complete

  Scenario: Edit a savings goal
    Given the user is on the dashboard
    And a "SAVINGS" account exists for "Edit Owner"
    When the user visits the goals page
    And the user creates a goal named "Old Goal" with a target of 1000
    And the user edits the goal "Old Goal" to be named "New Goal" with a target of 2000
    Then the goal "New Goal" is visible
    And the goal "Old Goal" is not visible

  Scenario: Delete a savings goal
    Given the user is on the dashboard
    And a "SAVINGS" account exists for "Delete Owner"
    When the user visits the goals page
    And the user creates a goal named "Temp Goal" with a target of 500
    And the user deletes the goal "Temp Goal"
    Then the goal "Temp Goal" is not visible
