@Bloom @Subscriptions
Feature: Subscriptions

  @Smoke
  Scenario: Summary is empty with no charge history or recurring rules
    Given a chequing account exists for "Subs Empty Owner"
    When the subscriptions summary is fetched
    Then the response status is 200
    And the subscriptions monthly total is 0.0
    And the subscriptions count is 0

  @Smoke
  Scenario: An active withdrawal rule with a merchant surfaces as a rule-based subscription
    Given a chequing account exists for "Subs Rule Owner"
    And an active recurring "WITHDRAWAL" rule with merchant "Netflix" and amount 15.99 and frequency "MONTHLY" exists for the account
    When the subscriptions summary is fetched
    Then the response status is 200
    And the subscriptions list includes merchant "Netflix" with source "rule" and monthly cost 15.99

  @Validation
  Scenario: Fetching the subscriptions summary requires authentication
    When the subscriptions summary is fetched without authentication
    Then the response status is 401
    And the error message is "Unauthorized"
