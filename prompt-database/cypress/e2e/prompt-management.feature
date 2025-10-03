Feature: Prompt Management
  As a user of the Prompt Database
  I want to create, read, update, and delete prompts
  So that I can organize and manage my AI prompts effectively

  Background:
    Given I visit the application
    And the database is empty

  Scenario: Create first prompt with minimal data
    When I click the "Create New Prompt" button
    And I enter "My First Prompt" as the title
    And I enter "Tell me a joke about programming" as the prompt text
    And I save the prompt
    Then I should see "My First Prompt" in the prompt list
    And the prompt should have a created timestamp
    And the prompt should have an updated timestamp

  Scenario: Title uniqueness validation
    Given I have a prompt with title "Existing Prompt"
    When I try to create a new prompt with title "Existing Prompt"
    Then I should see an error message "Title must be unique"
    And the prompt should not be saved

  Scenario: Create prompt with all fields
    When I click the "Create New Prompt" button
    And I enter "Complete Prompt" as the title
    And I enter "Write a detailed technical explanation" as the prompt text
    And I select "Technical" as the category
    And I enter "documentation, technical, explanation" as tags
    And I enter "A well-structured technical document" as expected output
    And I enter "Use this for complex technical topics" as notes
    And I save the prompt
    Then I should see "Complete Prompt" in the prompt list
    And the prompt should contain all the entered information
    And the prompt should be searchable by any field

  Scenario: Update existing prompt
    Given I have a prompt with title "Original Title"
    When I select the prompt from the list
    And I change the title to "Updated Title"
    And I modify the prompt text
    And I save the changes
    Then I should see "Updated Title" in the prompt list
    And the prompt should have an updated timestamp
    And the original prompt should no longer exist

  Scenario: Delete prompt with confirmation
    Given I have a prompt with title "Prompt to Delete"
    When I select the prompt from the list
    And I click the delete button
    And I confirm the deletion
    Then the prompt should be removed from the list
    And the prompt should no longer exist in the database

  Scenario: Cancel prompt deletion
    Given I have a prompt with title "Prompt to Keep"
    When I select the prompt from the list
    And I click the delete button
    And I cancel the deletion
    Then the prompt should still exist in the list
    And the prompt should remain in the database