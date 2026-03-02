@PWM
Feature: Bond Order Management

  @BondOrder
  Scenario: SCRUM-5 - Test Bond Order limit price
    Given a bond order with limit price is created
    When the order is submitted
    Then the order status should be confirmed

  @BondOrder
  Scenario: SCRUM-5-2 - Test Bond Order market price
    Given a bond order with market price is created
    When the order is submitted
    Then the order status should be confirmed

  @BondOrder
  Scenario: SCRUM-5-3 - Remove Bond Order
    Given a bond order that is cancellable
    When the order is cancelled
    Then the order status should be cancelled

  @BondOrder @RiskManagement
  Scenario: SCRUM-1 - Test Bond Order risk limit breach
    Given a bond order exceeds the risk limit
    When the order is submitted
    Then the order should be rejected