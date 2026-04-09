@Bloom @Profile
Feature: Profile

  @Smoke
  Scenario: New user profile is initially null
    When the current profile is fetched
    Then the response status is 200
    And the profile response is null

  @Smoke
  Scenario: Save and fetch profile
    When the profile is saved with first name "Priya", last name "Shah", and a unique username
    Then the response status is 200
    And the profile first name is "Priya"
    And the profile username matches the saved username
    When the current profile is fetched
    Then the response status is 200
    And the profile first name is "Priya"
