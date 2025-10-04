Feature: Sorting Functionality
  As a user managing my prompt database
  I want to sort prompts by different fields
  So that I can organize and find prompts more efficiently

  Background:
    Given I have a prompt database with sample data
    And I am on the main application page

  Scenario: Sort by title ascending
    Given I have prompts with titles "Zebra", "Alpha", and "Beta"
    When I click on the "Title" column header
    Then the prompts should be sorted by title in ascending order
    And I should see "Alpha", "Beta", "Zebra" in that order
    And the title column should show an ascending sort indicator

  Scenario: Sort by title descending
    Given I have prompts with titles "Alpha", "Beta", and "Zebra"
    And the prompts are currently sorted by title ascending
    When I click on the "Title" column header again
    Then the prompts should be sorted by title in descending order
    And I should see "Zebra", "Beta", "Alpha" in that order
    And the title column should show a descending sort indicator

  Scenario: Sort by creation date
    Given I have prompts created on different dates
    When I click on the "Created" column header
    Then the prompts should be sorted by creation date in ascending order
    And the most recent prompt should appear last
    And the created column should show a sort indicator

  Scenario: Sort by last used date
    Given I have prompts with different last used timestamps
    And some prompts have never been used
    When I click on the "Last Used" column header
    Then the prompts should be sorted by last used date
    And unused prompts should appear at the end
    And the last used column should show a sort indicator

  Scenario: Sort by category
    Given I have prompts in categories "Development", "Design", and "Testing"
    When I click on the "Category" column header
    Then the prompts should be sorted alphabetically by category
    And prompts without categories should appear at the end

  Scenario: Sort persistence during session
    Given I have sorted prompts by title
    When I navigate to a specific prompt
    And I return to the prompt list
    Then the sorting should be maintained
    And the sort indicator should still be visible

  Scenario: Clear sort and return to default
    Given I have sorted prompts by title
    When I click on a neutral area or default sort option
    Then the prompts should return to default order (creation date descending)
    And no sort indicators should be visible

  Scenario: Sort with search results
    Given I have searched for prompts containing "React"
    And the search returned multiple results
    When I sort the search results by title
    Then only the filtered prompts should be sorted
    And the search filter should remain active
    And the sort should apply to the search results

  Scenario: Sort indicator visual feedback
    Given I am viewing the prompt list
    When I hover over a sortable column header
    Then the column should show it is clickable
    When I click to sort by that column
    Then I should see a clear sort direction indicator (arrow up/down)
    And other columns should not show sort indicators

  Scenario: Multi-column sort behavior
    Given I have sorted prompts by title
    When I click on a different column to sort by category
    Then the previous sort should be cleared
    And only the category sort should be active
    And only the category column should show a sort indicator

  Scenario: Sort empty or null values
    Given I have prompts where some have categories and others don't
    When I sort by category
    Then prompts with categories should be sorted alphabetically
    And prompts without categories should appear at the end
    And the sorting should handle null/empty values gracefully

  Scenario: Sort performance with large dataset
    Given I have more than 100 prompts in my database
    When I sort by any column
    Then the sorting should complete in less than 200ms
    And the UI should remain responsive during sorting