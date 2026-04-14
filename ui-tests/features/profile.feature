@UI @Profile
Feature: Profile Management

  @Smoke
  Scenario: User edits profile and sees the saved identity across the app
    Given the user is on the dashboard
    When the user visits the profile page
    And the user saves the profile with first name "Jordan", last name "Lee", and username prefix "jordanlee"
    Then the profile save confirmation is visible
    When the user visits the home page
    Then the dashboard greeting says "Good morning, Jordan."

  @Smoke
  Scenario: Profile page loads the saved Prisma-backed profile
    Given the user is on the dashboard
    When the user visits the profile page
    And the user saves the profile with first name "Nora", last name "Sato", and username prefix "norasato"
    Then the profile save confirmation is visible
    When the user reloads the profile page
    Then the profile form shows the saved values
