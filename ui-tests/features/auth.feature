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
    And the onboarding form is prefilled from the Google session

  @Smoke
  Scenario: Signed-in returning user sees the dashboard
    Given the signed-in user has completed onboarding
    Then the dashboard greeting is visible

  @Smoke
  Scenario: Saving onboarding profile opens personalized dashboard
    Given the user visits the home page
    When the user completes onboarding with first name "Priya"
    Then the dashboard greeting says "Good morning, Priya."
