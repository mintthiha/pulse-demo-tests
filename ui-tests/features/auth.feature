@UI @Auth
Feature: Authentication Entry Flows

  @Smoke @Unauthenticated
  Scenario: Unauthenticated user is redirected to login
    Given the user visits the home page
    Then the user is redirected to the login page

  @Smoke
  Scenario: Signed-in first-time user sees onboarding
    Given the user visits the home page
    Then the onboarding screen is visible

  @Smoke
  Scenario: Signed-in returning user sees the dashboard
    Given the signed-in user has completed onboarding
    Then the dashboard greeting is visible
