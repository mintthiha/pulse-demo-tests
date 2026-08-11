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
