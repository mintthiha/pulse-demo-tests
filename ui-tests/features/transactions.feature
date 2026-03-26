@UI
Feature: Transactions

  @Smoke
  Scenario: Deposit funds into an account
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Emma Gagnon"
    When the user opens the account for "Emma Gagnon"
    And the user deposits 500
    Then the available balance shows "$500.00"

  @Smoke
  Scenario: Withdraw funds from an account
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Felix Roy"
    When the user opens the account for "Felix Roy"
    And the user deposits 1000
    And the user withdraws 300
    Then the available balance shows "$700.00"

  Scenario: Cannot withdraw more than balance
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Gabrielle Bouchard"
    When the user opens the account for "Gabrielle Bouchard"
    And the user deposits 100
    And the user attempts to withdraw 500
    Then an error message shows "Insufficient funds"

  @Smoke
  Scenario: Transfer funds between two accounts
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Hugo Cote"
    And a "CHEQUING" account exists for "Isabelle Morin"
    When the user opens the account for "Hugo Cote"
    And the user deposits 800
    And the user transfers 250 to "Isabelle Morin"'s account
    Then the available balance shows "$550.00"

  Scenario: Transaction history is recorded
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Jacques Pelletier"
    When the user opens the account for "Jacques Pelletier"
    And the user deposits 1000 with description "Initial deposit"
    And the user withdraws 200 with description "Coffee run"
    Then the transaction history shows 2 records

  Scenario: Transaction description appears in history
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Karen Leblanc"
    When the user opens the account for "Karen Leblanc"
    And the user deposits 500 with description "Salary payment"
    Then the transaction description "Salary payment" is visible

  Scenario: Analytics panel appears after a transaction
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Nathan Beaulieu"
    When the user opens the account for "Nathan Beaulieu"
    And the user deposits 500
    Then the analytics panel is visible

  Scenario: Balance history and transaction type charts are visible after multiple transactions
    Given the user is on the dashboard
    And a "CHEQUING" account exists for "Olivia Bergeron"
    When the user opens the account for "Olivia Bergeron"
    And the user deposits 600
    And the user withdraws 200
    Then the balance history chart is visible
    And the transaction type breakdown is visible

  Scenario: Dashboard stats update after account creation
    Given the user is on the dashboard
    When the user creates a "CHEQUING" account for "Liam Fortin"
    And the user creates a "SAVINGS" account for "Marie Lefebvre"
    Then the stats section shows "Chequing"
    And the stats section shows "Savings"