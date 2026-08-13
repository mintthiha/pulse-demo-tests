@Bloom @AutoCategorize
Feature: AI Merchant Auto-Categorization

  # The happy path calls a live Ollama server (OLLAMA_URL) which isn't available in CI.
  # Tagged @Pending so it's excluded from the default run; exercise it manually against
  # a local Ollama instance.
  @Pending
  Scenario: AI suggests an allowed category for each merchant
    When merchant suggestions are requested for "Walmart, Tim Hortons, Shell"
    Then the response status is 200
    And every suggestion has an allowed category

  @Validation
  Scenario: Requesting suggestions without authentication is rejected
    When merchant suggestions are requested without authentication
    Then the response status is 401
    And the error message is "Unauthorized"

  @Validation
  Scenario: Requesting suggestions with a missing merchants field is rejected
    When merchant suggestions are requested with no merchants field
    Then the response status is 400
    And the error message is "merchants must be an array"

  @Validation
  Scenario: Requesting suggestions with an empty merchants list is rejected
    When merchant suggestions are requested for ""
    Then the response status is 400
    And the error message is "merchants must not be empty"

  @Validation
  Scenario: Requesting suggestions for more than 20 merchants is rejected
    When merchant suggestions are requested for 21 merchants
    Then the response status is 400
    And the error message is "merchants must contain at most 20 items"

  @Validation
  Scenario: Requesting suggestions with a blank merchant entry is rejected
    When merchant suggestions are requested with a blank merchant in the list
    Then the response status is 400
    And the error message is "each merchant must be a non-empty string"
