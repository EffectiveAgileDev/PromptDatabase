Feature: Category Management
  As a user managing my prompt database
  I want enhanced category management features
  So that I can organize and discover prompts more effectively

  Background:
    Given I have a prompt database with various prompts
    And I am on the main application page

  Scenario: View category overview and statistics
    Given I have prompts in multiple categories:
      | Category | Count | Last Used |
      | Development | 15 | 2 days ago |
      | Writing | 8 | 1 hour ago |
      | Analysis | 12 | 1 week ago |
      | Research | 5 | Never |
    When I navigate to the category management section
    Then I should see a category overview dashboard
    And I should see usage statistics for each category
    And I should see the total number of prompts per category
    And I should see the last used date for each category

  Scenario: Create custom category with color coding
    Given I am in the category management section
    When I click "Add New Category"
    And I enter "Data Science" as the category name
    And I select a blue color for the category
    And I add an optional description "Machine learning and data analysis prompts"
    And I save the category
    Then "Data Science" should appear in the category list
    And the category should have a blue color indicator
    And the category should show 0 prompts initially

  Scenario: Assign and reassign prompt categories
    Given I have a prompt titled "Code Review Helper"
    And the prompt is currently in "Development" category
    When I select the prompt
    And I change its category to "Quality Assurance"
    Then the prompt should move to the "Quality Assurance" category
    And the "Development" category count should decrease by 1
    And the "Quality Assurance" category count should increase by 1

  Scenario: Bulk category assignment
    Given I have 5 uncategorized prompts
    When I select all 5 prompts using checkboxes
    And I choose "Bulk Actions" → "Assign Category"
    And I select "Writing" as the target category
    And I confirm the bulk action
    Then all 5 prompts should be assigned to "Writing"
    And I should see a success message "5 prompts assigned to Writing"
    And the "Writing" category count should increase by 5

  Scenario: Category-based filtering and search
    Given I have prompts in various categories
    When I click on the "Development" category filter
    Then I should see only prompts from the "Development" category
    And the search should be scoped to that category
    When I type "API" in the search box
    Then I should see only "Development" prompts containing "API"
    And the category filter should remain active

  Scenario: Category suggestions based on content
    Given I am creating a new prompt
    And I enter "Write unit tests for the following function" as the prompt text
    When I focus on the category field
    Then I should see suggested categories:
      | Suggestion | Confidence | Reason |
      | Development | High | Contains programming terms |
      | Testing | High | Mentions "unit tests" |
      | Quality Assurance | Medium | Related to code quality |
    And I should be able to select a suggestion
    Or I should be able to ignore suggestions and enter a custom category

  Scenario: Category merge and rename
    Given I have categories "Code Review" and "Code Analysis"
    And I want to consolidate them
    When I select "Code Review" category
    And I choose "Merge with another category"
    And I select "Code Analysis" as the target
    Then all prompts from "Code Review" should move to "Code Analysis"
    And "Code Review" category should be deleted
    And I should see a confirmation "12 prompts merged successfully"

  Scenario: Category deletion with prompt reassignment
    Given I have a "Temporary" category with 3 prompts
    When I try to delete the "Temporary" category
    Then I should see a warning about the 3 prompts
    And I should be offered options:
      | Option | Description |
      | Move to Uncategorized | Keep prompts without category |
      | Move to existing category | Select a different category |
      | Delete prompts | Remove prompts entirely |
    When I choose "Move to existing category"
    And I select "General" as the target
    Then the prompts should be moved to "General"
    And the "Temporary" category should be deleted

  Scenario: Category hierarchy and subcategories
    Given I want to organize categories hierarchically
    When I create a parent category "Programming"
    And I create subcategories:
      | Subcategory | Parent |
      | Frontend | Programming |
      | Backend | Programming |
      | DevOps | Programming |
    Then I should see a tree structure in the category list
    And prompts can be assigned to subcategories
    And filtering by "Programming" should include all subcategories

  Scenario: Category-based templates and quick actions
    Given I have well-established categories
    When I create a new prompt
    And I select "Email Writing" category
    Then I should see category-specific templates:
      | Template | Use Case |
      | Professional Email | Business communication |
      | Follow-up Email | Client follow-up |
      | Thank You Email | Appreciation messages |
    And I should see category-specific custom fields automatically added

  Scenario: Category analytics and insights
    Given I have been using the system for several months
    When I view category analytics
    Then I should see:
      | Metric | Description |
      | Most Used Categories | Categories with highest usage |
      | Growth Trends | Categories growing over time |
      | Seasonal Patterns | Usage patterns by time |
      | Efficiency Metrics | Time saved per category |
    And I should be able to export analytics data

  Scenario: Category export and import
    Given I have a well-organized category system
    When I export my categories
    Then I should get a structured file containing:
      | Data | Format |
      | Category names | JSON/CSV |
      | Color codes | Hex values |
      | Hierarchy | Parent-child relationships |
      | Usage statistics | Numeric data |
    And I should be able to import categories to another instance
    And handle conflicts with existing categories

  Scenario: Smart category recommendations
    Given the system has learned from my usage patterns
    When I'm viewing my prompt dashboard
    Then I should see recommendations like:
      | Recommendation | Reason |
      | "Consider creating a 'Meeting' category" | Many prompts contain meeting-related terms |
      | "Merge similar categories" | Categories with overlapping content |
      | "Archive unused categories" | Categories not used in 3+ months |
    And I should be able to act on recommendations with one click

  Scenario: Category-based workspace organization
    Given I work on different types of projects
    When I create category-based workspaces:
      | Workspace | Categories |
      | Client Work | Email, Proposals, Reports |
      | Development | Code Review, Documentation, Testing |
      | Research | Analysis, Summary, Citations |
    Then I can switch between workspaces
    And see only relevant categories and prompts
    And maintain separate search contexts

  Scenario: Mobile category management
    Given I am using the app on a mobile device
    When I manage categories
    Then category operations should be touch-optimized
    And I should see a simplified category picker
    And bulk actions should work with touch gestures
    And category colors should be easily distinguishable on small screens

  Scenario: Accessibility in category management
    Given I am using assistive technology
    When I navigate categories
    Then category colors should have accessible text descriptions
    And category hierarchy should be properly announced
    And all category actions should be keyboard accessible
    And screen readers should announce category changes clearly