@UI @Subscriptions
Feature: Subscriptions

  @Smoke
  Scenario: Subscriptions page loads and shows empty state when no recurring merchants exist
    Given the user is on the dashboard
    When the user visits the subscriptions page
    Then the subscriptions empty state is visible

  @Smoke
  Scenario: Subscriptions page is reachable from the dashboard
    Given the user is on the dashboard
    When the user visits the subscriptions page
    Then the page title contains "Bloom"

  Scenario: Subscriptions page shows a recurring withdrawal as a subscription
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Subscription Owner"
    When the user creates a recurring "Withdrawal" rule named "Netflix" for "Subscription Owner" with amount 18, frequency "Monthly", category "Entertainment", and description "Streaming plan"
    And the user visits the subscriptions page
    Then the subscription "Netflix" is visible

  Scenario: Subscriptions page shows multiple subscriptions
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Multi Sub Owner"
    When the user creates a recurring "Withdrawal" rule named "Spotify" for "Multi Sub Owner" with amount 12, frequency "Monthly", category "Entertainment", and description "Music plan"
    And the user creates a recurring "Withdrawal" rule named "Gym Membership" for "Multi Sub Owner" with amount 50, frequency "Monthly", category "Healthcare", and description "Monthly gym"
    And the user visits the subscriptions page
    Then the subscription "Spotify" is visible
    And the subscription "Gym Membership" is visible
