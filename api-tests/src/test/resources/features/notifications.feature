@Bloom @Notifications
Feature: Notifications

  @Smoke
  Scenario: A freshly created cash account with a low balance raises a notification
    Given a chequing account exists for "Notify Owner"
    When notifications are fetched
    Then the response status is 200
    And the notification list includes kind "LOW_BALANCE" with title "Notify Owner"
    And the unread count is at least 1

  @Smoke
  Scenario: Mark a single notification as read
    Given a chequing account exists for "Notify Read Owner"
    When the "LOW_BALANCE" notification is marked read
    Then the response status is 200
    And the notification status is "READ"

  Scenario: Mark all notifications as read
    Given a chequing account exists for "Notify Read All Owner"
    When notifications are fetched
    Then the unread count is at least 1
    When all notifications are marked read
    Then the response status is 200
    And the read count is at least 1
    When notifications are fetched
    Then the notifications unread count is 0

  @Smoke
  Scenario: Dismiss a notification so it no longer appears
    Given a chequing account exists for "Notify Dismiss Owner"
    When the "LOW_BALANCE" notification is dismissed
    Then the response status is 204
    When notifications are fetched
    Then the notification list does not include kind "LOW_BALANCE"

  @Validation
  Scenario: Marking a nonexistent notification as read returns 404
    When the notification "does-not-exist" is marked read
    Then the response status is 404
    And the error message is "Notification does-not-exist not found"

  @Validation
  Scenario: Dismissing a nonexistent notification returns 404
    When the notification "does-not-exist" is dismissed
    Then the response status is 404
    And the error message is "Notification does-not-exist not found"

  @Validation
  Scenario: Fetching notifications requires authentication
    When notifications are fetched without authentication
    Then the response status is 401
    And the error message is "Unauthorized"
