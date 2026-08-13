@Bloom @CategorizationRules
Feature: Auto-Categorization Rules

  @Smoke
  Scenario: Save a rule and see it in the list
    When a categorization rule is saved for merchant "Netflix" with category "Entertainment"
    Then the response status is 200
    And the rule merchant is "Netflix"
    And the rule category is "Entertainment"
    When all categorization rules are listed
    Then the response status is 200
    And the rule list includes merchant "Netflix"

  Scenario: Saving a rule for an existing merchant updates its category
    When a categorization rule is saved for merchant "Uber" with category "Transport"
    Then the response status is 200
    When a categorization rule is saved for merchant "Uber" with category "Rideshare"
    Then the response status is 200
    And the rule category is "Rideshare"
    When all categorization rules are listed
    Then the response status is 200
    And the rule list has 1 rule

  @Smoke
  Scenario: Rename a rule's merchant and category, then delete it
    Given a categorization rule exists for merchant "Spotify" with category "Entertainment"
    When the rule is updated to merchant "Spotify Premium", category "Music"
    Then the response status is 200
    And the rule merchant is "Spotify Premium"
    And the rule category is "Music"
    When the rule is deleted
    Then the response status is 204
    When all categorization rules are listed
    Then the rule list has 0 rule

  @Validation
  Scenario: Updating a nonexistent rule returns 404
    When the rule "does-not-exist" is updated to merchant "Ghost", category "Other"
    Then the response status is 404
    And the error message is "Rule not found"

  @Validation
  Scenario: Deleting a nonexistent rule returns 404
    When the rule "does-not-exist" is deleted
    Then the response status is 404
    And the error message is "Rule not found"

  @Validation
  Scenario: Renaming a rule into a merchant that already has a rule is rejected
    Given a categorization rule exists for merchant "Amazon" with category "Shopping"
    And a categorization rule exists for merchant "Amazon Prime" with category "Entertainment"
    When the "Amazon Prime" rule is renamed to merchant "Amazon", category "Entertainment"
    Then the response status is 409
    And the error message is "A rule for \"Amazon\" already exists"

  @Validation
  Scenario: Saving a rule without a merchant is rejected
    When a categorization rule is saved without a merchant
    Then the response status is 400
    And the error message is "merchant must be a string"

  @Validation
  Scenario: Saving a rule without a category is rejected
    When a categorization rule is saved without a category
    Then the response status is 400
    And the error message is "category must be a string"

  @Validation
  Scenario: Listing rules requires authentication
    When categorization rules are listed without authentication
    Then the response status is 401
    And the error message is "Unauthorized"
