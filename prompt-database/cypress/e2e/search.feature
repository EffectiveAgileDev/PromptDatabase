Feature: Search Functionality
  As a user managing my prompt database
  I want to search through my prompts
  So that I can quickly find specific prompts

  Background:
    Given I have a prompt database with sample data
    And I am on the main application page

  Scenario: Search by title
    Given I have prompts with titles "JavaScript Tutorial", "Python Guide", and "React Components"
    When I enter "JavaScript" in the search field
    And I select "title" as the search field
    Then I should see only prompts with "JavaScript" in the title
    And the search results should show "1 result"

  Scenario: Search by prompt text content
    Given I have prompts with different content including "API integration" and "database queries"
    When I enter "API" in the search field
    And I select "promptText" as the search field
    Then I should see only prompts containing "API" in their content
    And the search results should be highlighted

  Scenario: Search by category
    Given I have prompts categorized as "Development", "Design", and "Testing"
    When I enter "Development" in the search field
    And I select "category" as the search field
    Then I should see only prompts in the "Development" category

  Scenario: Search by tags
    Given I have prompts with tags "react, frontend" and "python, backend"
    When I enter "react" in the search field
    And I select "tags" as the search field
    Then I should see only prompts tagged with "react"

  Scenario: Search is case-insensitive
    Given I have a prompt with title "JavaScript Tutorial"
    When I enter "javascript tutorial" in the search field
    And I select "title" as the search field
    Then I should see the prompt with title "JavaScript Tutorial"

  Scenario: Search with partial matching
    Given I have a prompt with title "Advanced React Hooks"
    When I enter "React" in the search field
    And I select "title" as the search field
    Then I should see the prompt with title "Advanced React Hooks"

  Scenario: Clear search results
    Given I have performed a search with results
    When I clear the search field
    Then I should see all prompts
    And the search results count should show the total number of prompts

  Scenario: No search results found
    Given I have prompts in my database
    When I enter "nonexistent" in the search field
    And I select "title" as the search field
    Then I should see "No prompts found" message
    And the search results should show "0 results"

  Scenario: Search with debounced input
    Given I have prompts in my database
    When I quickly type "java" in the search field
    Then the search should not execute immediately
    When I stop typing for 300ms
    Then the search should execute and show results

  Scenario: Switch search fields with active search
    Given I have a prompt with title "React" and content "JavaScript framework"
    And I have searched for "React" in the title field
    When I switch the search field to "promptText"
    Then the search should re-execute for the prompt text field
    And I should see different results based on the new field