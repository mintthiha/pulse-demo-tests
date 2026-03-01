@Technology
Feature: Equity Order Management

  @EquityOrder
  Scenario: SCRUM-2 - Test Equity Order creation
    Given an equity order is created
    When the order is submitted
    Then the order status should be confirmed

  @EquityOrder @RiskManagement
  Scenario: SCRUM-3 - Test Equity Order risk limit breach
    Given an equity order exceeds the risk limit
    When the order is submitted
    Then the order should be rejected

  @EquityOrder
  Scenario: SCRUM-4 - Test Equity Order cancellation
    Given an equity order is created and confirmed
    When the order is cancelled
    Then the order status should be cancelled