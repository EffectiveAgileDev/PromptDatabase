Feature: First-Time User Experience
  As a new user of the Prompt Database
  I want a welcoming and guided experience
  So that I can quickly understand and start using the application

  Background:
    Given I am a first-time user
    And the application database is empty
    And I navigate to the application

  Scenario: Welcome screen for new users
    Given I have no prompts in my database
    When I load the application for the first time
    Then I should see a welcome screen
    And I should see a helpful introduction message
    And I should see sample prompts or templates
    And I should see a prominent "Create Your First Prompt" button

  Scenario: Guided first prompt creation
    Given I am on the welcome screen
    When I click "Create Your First Prompt"
    Then I should see a guided prompt creation form
    And I should see helpful tooltips for each field
    And I should see placeholder text with examples
    And I should see tips about best practices

  Scenario: Sample prompt templates
    Given I am on the welcome screen
    When I view the sample prompt templates
    Then I should see at least 3 different prompt categories:
      | Category | Example Title | Purpose |
      | Code Review | "Review this code for best practices" | Development assistance |
      | Writing | "Improve this email for clarity" | Communication help |
      | Analysis | "Summarize this document" | Data processing |
    And each template should have realistic example content
    And I should be able to use any template as a starting point

  Scenario: Quick setup wizard
    Given I am a new user
    When I start the quick setup wizard
    Then I should be guided through:
      | Step | Description |
      | 1 | Welcome and app overview |
      | 2 | Create first prompt |
      | 3 | Tour of key features |
      | 4 | Import existing prompts (optional) |
    And I should be able to skip any step
    And I should be able to go back to previous steps

  Scenario: Feature tour after first prompt
    Given I have just created my first prompt
    When the prompt is successfully saved
    Then I should see a brief feature tour highlighting:
      | Feature | Description |
      | Search | How to find prompts quickly |
      | Categories | How to organize prompts |
      | Copy | How to use prompts in other apps |
      | Custom Fields | How to extend the database |
    And the tour should be dismissible
    And I should be able to replay the tour later

  Scenario: Help hints and progressive disclosure
    Given I am exploring the interface
    When I hover over or focus on various UI elements
    Then I should see contextual help hints
    And complex features should have "Learn more" links
    And I should see progress indicators for multi-step processes
    And tooltips should be informative but not overwhelming

  Scenario: Onboarding progress tracking
    Given I am going through the onboarding process
    When I complete each step
    Then my progress should be saved
    And I should see a progress indicator
    And if I reload the page, I should resume where I left off
    And completed steps should be marked as done

  Scenario: Skip onboarding option
    Given I am an experienced user
    When I see the welcome screen
    Then I should see a "Skip Tour" or "I'm Experienced" option
    And clicking it should take me directly to the main interface
    And I should still be able to access the tour later from settings

  Scenario: Import prompts during onboarding
    Given I am in the onboarding wizard
    And I have existing prompts from another tool
    When I reach the import step
    Then I should see options to import from:
      | Source | Format |
      | File | CSV, JSON |
      | Text | Bulk paste |
      | Template | Pre-made collections |
    And the import should validate the data
    And show a preview before importing

  Scenario: Onboarding completion celebration
    Given I have completed the onboarding process
    When I finish the last step
    Then I should see a congratulations message
    And a summary of what I've accomplished
    And quick links to next actions:
      | Action | Description |
      | Create Another | Add more prompts |
      | Explore Features | Tour advanced capabilities |
      | Customize | Set up preferences |
    And I should be taken to my new prompt database

  Scenario: Re-access onboarding help
    Given I have completed onboarding
    And I am using the main application
    When I want to review the getting started information
    Then I should find a "Getting Started" or "Help" link
    And I should be able to replay any part of the onboarding
    And I should see a knowledge base or FAQ section

  Scenario: Mobile onboarding experience
    Given I am accessing the app on a mobile device
    When I go through the onboarding process
    Then the experience should be optimized for touch
    And text should be readable without zooming
    And steps should be appropriately sized for mobile screens
    And navigation should be thumb-friendly

  Scenario: Onboarding accessibility
    Given I am using assistive technology
    When I navigate through the onboarding process
    Then all steps should be keyboard accessible
    And screen readers should announce progress and instructions
    And high contrast mode should be respected
    And text should be scalable without breaking the layout