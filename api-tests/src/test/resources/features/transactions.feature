@Bloom
Feature: Account Transactions

  @Transactions @Smoke
  Scenario: Deposit funds into an account
    Given a chequing account exists for "David Lavoie"
    When 500.00 is deposited into the account
    Then the response status is 200
    And the account balance is 500.0

  @Transactions
  Scenario: Cannot deposit a negative amount
    Given a chequing account exists for "Emma Gagnon"
    When -100.00 is deposited into the account
    Then the response status is 400
    And the error message is "amount must be positive"

  @Transactions
  Scenario: Cannot deposit zero
    Given a chequing account exists for "Felix Roy"
    When 0.00 is deposited into the account
    Then the response status is 400

  @Transactions @Smoke
  Scenario: Withdraw funds from an account
    Given a chequing account exists for "Gabrielle Bouchard"
    And the account has been funded with 1000.00
    When 300.00 is withdrawn from the account
    Then the response status is 200
    And the account balance is 700.0

  @Transactions
  Scenario: Cannot withdraw more than the balance
    Given a chequing account exists for "Hugo Cote"
    And the account has been funded with 200.00
    When 500.00 is withdrawn from the account
    Then the response status is 400
    And the error message is "Insufficient funds"

  @Transactions @Smoke
  Scenario: Transfer funds between two accounts
    Given a chequing account exists for "Isabelle Morin"
    And the account has been funded with 800.00
    And a second chequing account exists for "Jacques Pelletier"
    When 250.00 is transferred to the second account
    Then the response status is 200
    And the account balance is 550.0

  @Transactions
  Scenario: Cannot transfer to a non-existent account
    Given a chequing account exists for "Karen Leblanc"
    And the account has been funded with 500.00
    When 100.00 is transferred to account "nonexistent-id-000"
    Then the response status is 404

  @Transactions
  Scenario: Cannot transfer to the same account
    Given a chequing account exists for "Liam Fortin"
    And the account has been funded with 500.00
    When 100.00 is transferred to itself
    Then the response status is 400
    And the error message is "Cannot transfer to the same account"

  @Transactions @Smoke
  Scenario: Transaction history is recorded after operations
    Given a chequing account exists for "Marie Lefebvre"
    And 1000.00 is deposited into the account with description "Initial deposit"
    And 400.00 is withdrawn from the account with description "Grocery run"
    When the transaction history is fetched
    Then the response status is 200
    And there are 2 transactions

  @Transactions @Smoke
  Scenario: Transaction category is recorded in history
    Given a chequing account exists for "Category Api User"
    And 700.00 is deposited into the account with category "Salary"
    And 80.00 is withdrawn from the account with category "Groceries"
    When the transaction history is fetched
    Then the response status is 200
    And there are 2 transactions
    And at least one transaction has category "Salary"
    And at least one transaction has category "Groceries"

  @Transactions @RiskManagement
  Scenario: Frozen account rejects a deposit
    Given a frozen chequing account exists for "Nathan Beaulieu"
    When 100.00 is deposited into the account
    Then the response status is 403
    And the error message is "Account is frozen"

  @Transactions @RiskManagement
  Scenario: Frozen account rejects a withdrawal
    Given a frozen chequing account exists for "Olivia Bergeron"
    When 100.00 is withdrawn from the account
    Then the response status is 403
    And the error message is "Account is frozen"
