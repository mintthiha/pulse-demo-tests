@UI @RiskManagement
Feature: Risk Management

  @Freeze
  Scenario: Freeze an account
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Paul Tremblay"
    When the user opens the account for "Paul Tremblay"
    And the user freezes the account
    Then the frozen badge is visible
    And the frozen account message is visible

  @Freeze
  Scenario: Frozen account hides the transaction form
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Quinn Gagnon"
    When the user opens the account for "Quinn Gagnon"
    And the user freezes the account
    Then the transaction form is hidden

  @Freeze
  Scenario: Unfreeze a frozen account
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Rachel Bouchard"
    When the user opens the account for "Rachel Bouchard"
    And the user freezes the account
    And the user unfreezes the account
    Then the frozen badge is not visible
    And the transaction form is visible
