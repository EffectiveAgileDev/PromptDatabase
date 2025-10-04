Feature: Pagination Functionality
  As a user managing my prompt database
  I want to navigate through pages of prompts
  So that I can efficiently browse large collections

  Background:
    Given I have a prompt database with more than 20 prompts
    And I am on the main application page

  Scenario: Efficient pagination with large dataset
    Given I have 100 prompts in my database
    And the items per page is set to 20
    When I view the prompt list
    Then I should see pagination controls
    And I should see "Showing 1 to 20 of 100 results"
    And I should see page numbers 1, 2, 3, 4, 5

  Scenario: Navigate to next page
    Given I am on page 1 of the prompt list
    When I click the "Next" button
    Then I should be on page 2
    And I should see "Showing 21 to 40 of 100 results"
    And the prompts displayed should be different from page 1

  Scenario: Navigate to previous page
    Given I am on page 3 of the prompt list
    When I click the "Previous" button
    Then I should be on page 2
    And I should see "Showing 21 to 40 of 100 results"

  Scenario: Navigate to specific page
    Given I am on page 1 of the prompt list
    When I click on page number "4"
    Then I should be on page 4
    And I should see "Showing 61 to 80 of 100 results"

  Scenario: Disable navigation at boundaries
    Given I am on page 1 of the prompt list
    Then the "Previous" button should be disabled
    When I navigate to the last page
    Then the "Next" button should be disabled

  Scenario: Change items per page
    Given I am viewing 20 items per page
    When I change the items per page to 50
    Then I should see 50 prompts on the current page
    And the pagination should update to reflect fewer total pages
    And I should see "Showing 1 to 50 of 100 results"

  Scenario: Pagination with search results
    Given I have searched for prompts and found 25 results
    And the items per page is set to 10
    When I view the search results
    Then I should see pagination controls for the filtered results
    And I should see "Showing 1 to 10 of 25 results"
    When I go to page 3 of the search results
    Then I should see "Showing 21 to 25 of 25 results"

  Scenario: Pagination with sorting
    Given I have sorted prompts by title
    And I am on page 2 of the sorted results
    When I change the sort direction
    Then I should remain on page 2
    But the prompts should be re-ordered according to the new sort

  Scenario: No pagination for small datasets
    Given I have only 15 prompts in my database
    And the items per page is set to 20
    When I view the prompt list
    Then I should not see pagination controls
    And I should see all 15 prompts on one page

  Scenario: Ellipsis for large page counts
    Given I have 1000 prompts in my database
    And the items per page is set to 20
    And I am on page 25
    When I view the pagination
    Then I should see page 1
    And I should see "..." (ellipsis)
    And I should see pages around the current page (24, 25, 26)
    And I should see "..." (ellipsis)
    And I should see the last page (50)

  Scenario: Pagination state persistence
    Given I am on page 3 of the prompt list
    When I select a prompt to view its details
    And I return to the prompt list
    Then I should still be on page 3
    And the pagination state should be maintained

  Scenario: Performance with large pagination
    Given I have more than 1000 prompts in my database
    When I navigate between pages
    Then each page load should complete in less than 200ms
    And the UI should remain responsive during navigation

  Scenario: Keyboard navigation
    Given I am viewing the pagination controls
    When I use the Tab key to navigate
    Then I should be able to focus on pagination buttons
    When I press Enter on a page number
    Then I should navigate to that page
    When I press Enter on the Next button
    Then I should go to the next page