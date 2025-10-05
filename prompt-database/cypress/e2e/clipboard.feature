Feature: Clipboard Functionality
  As a user managing my prompt database
  I want to copy prompts to my clipboard
  So that I can easily use them in other applications

  Background:
    Given I have a prompt database with sample prompts
    And I am on the main application page

  Scenario: Successful copy with feedback
    Given I have a prompt with title "Test Prompt" and content "Test content"
    When I select the prompt
    And I click the "Copy to Clipboard" button
    Then the prompt content should be copied to my clipboard
    And I should see a success notification "Copied to clipboard!"
    And the notification should disappear after 3 seconds

  Scenario: Copy updates last used timestamp
    Given I have a prompt that has never been used
    And the prompt's lastUsed field is null
    When I copy the prompt to clipboard
    Then the prompt's lastUsed timestamp should be updated to the current time
    And the prompt should show as "recently used" in the list

  Scenario: Copy button visibility and state
    Given I am viewing a prompt in the detail panel
    Then I should see a "Copy to Clipboard" button
    And the button should have a copy icon
    When I hover over the button
    Then I should see a tooltip "Copy prompt to clipboard"

  Scenario: Copy with browser compatibility fallback
    Given I am using a browser that doesn't support the Clipboard API
    When I click the "Copy to Clipboard" button
    Then I should see a fallback dialog with the prompt text
    And I should see instructions to manually copy the text
    And there should be a "Select All" button to help with manual copying

  Scenario: Copy different content types
    Given I have a prompt with title "API Request" and content "Make a POST request"
    When I select the prompt
    And I choose to copy "prompt text only"
    Then only the prompt content should be copied
    When I choose to copy "title and prompt"
    Then both title and content should be copied with formatting

  Scenario: Copy keyboard shortcut
    Given I have selected a prompt
    When I press Ctrl+C (or Cmd+C on Mac)
    Then the prompt should be copied to clipboard
    And I should see the same success feedback as clicking the button

  Scenario: Copy from search results
    Given I have searched for prompts and found multiple results
    When I copy a prompt from the search results
    Then the copy functionality should work normally
    And the lastUsed timestamp should be updated
    And the search results should reflect the updated timestamp

  Scenario: Copy error handling
    Given I am viewing a prompt
    When I click copy and the clipboard operation fails
    Then I should see an error notification "Failed to copy to clipboard"
    And the lastUsed timestamp should not be updated
    And I should be offered the fallback copy option

  Scenario: Copy analytics and usage tracking
    Given I have multiple prompts in my database
    When I copy different prompts over time
    Then the most frequently copied prompts should be identifiable
    And recently used prompts should appear prominently in the interface

  Scenario: Copy with custom fields
    Given I have a prompt with custom fields
    When I copy the prompt
    Then I should have options for what to include:
      - Prompt text only
      - Title and prompt text
      - All fields including custom fields
    And the copied format should be readable and well-structured

  Scenario: Accessibility for copy functionality
    Given I am using screen reader technology
    When I navigate to the copy button
    Then the button should be properly labeled
    And copy success/failure should be announced
    When I use keyboard navigation
    Then I should be able to copy without using a mouse

  Scenario: Copy button states and feedback
    Given I am viewing a prompt
    When I click the copy button
    Then the button should show a loading state briefly
    And then change to a success state with a checkmark
    And return to normal state after 2 seconds
    When the copy fails
    Then the button should show an error state briefly