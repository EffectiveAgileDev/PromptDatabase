Feature: Data Persistence
  As a user of the Prompt Database
  I want my data to be automatically saved and persist between sessions
  So that I never lose my work and can rely on the application's data integrity

  Background:
    Given I visit the application
    And the database is empty

  Scenario: Auto-save on field change
    Given I create a new prompt
    When I enter "Auto-save Test" as the title
    And I wait for 500 milliseconds
    Then the prompt should be automatically saved
    And I should see a save indicator
    When I enter "This content should auto-save" as the prompt text
    And I wait for 500 milliseconds
    Then the changes should be automatically saved
    And the updated timestamp should be refreshed

  Scenario: Data persists after browser refresh
    Given I create a prompt with title "Persistence Test"
    And I enter "This should survive a refresh" as the prompt text
    And I save the prompt
    When I refresh the page
    Then I should see "Persistence Test" in the prompt list
    And the prompt should contain "This should survive a refresh"
    And all prompt data should be intact

  Scenario: Data persists after browser restart (simulation)
    Given I create a prompt with title "Browser Restart Test"
    And I enter "This should survive browser restart" as the prompt text
    And I save the prompt
    When I clear the application state
    And I visit the application again
    Then I should see "Browser Restart Test" in the prompt list
    And the prompt should contain the original data

  Scenario: Handle storage quota warning
    Given I have filled the storage to near capacity
    When I try to create a new large prompt
    Then I should see a storage quota warning
    And I should be given options to free up space
    And the application should remain functional

  Scenario: IndexedDB fallback to LocalStorage
    Given IndexedDB is not available
    When I create a prompt with title "LocalStorage Fallback"
    And I enter "This should save to LocalStorage" as the prompt text
    And I save the prompt
    Then the prompt should be saved to LocalStorage
    And I should see "LocalStorage Fallback" in the prompt list
    When I refresh the page
    Then the prompt should still be available

  Scenario: Data migration between storage types
    Given I have data stored in LocalStorage
    When IndexedDB becomes available
    And I visit the application
    Then the data should be migrated to IndexedDB
    And all existing prompts should remain accessible
    And the LocalStorage backup should be maintained

  Scenario: Concurrent tab handling
    Given I have the application open in multiple tabs
    When I create a prompt in tab 1
    And I switch to tab 2
    Then I should see the new prompt in tab 2
    And both tabs should show synchronized data

  Scenario: Recovery from storage corruption
    Given I have prompts stored in the database
    When the storage becomes corrupted
    And I visit the application
    Then I should see an error recovery message
    And I should be offered options to restore from backup
    And the application should not crash