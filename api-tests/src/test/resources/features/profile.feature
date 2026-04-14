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

  Scenario: Duplicate usernames are rejected
    When another user saves a profile with username "shared_profile_name"
    Then the response status is 200
    When the current user attempts to save a duplicate username
    Then the response status is 409
    And the error message is "Username is already taken"
