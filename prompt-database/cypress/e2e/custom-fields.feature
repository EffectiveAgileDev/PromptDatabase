Feature: Custom Fields Management
  As a user
  I want to add custom fields to my prompts
  So that I can track additional information specific to my needs

  Background:
    Given I am on the prompt database page
    And the database is empty

  Scenario: Add custom text field
    Given I navigate to the field manager
    When I click "Add Custom Field"
    And I enter "Model Version" as the field name
    And I select "text" as the field type
    And I click "Save Field"
    Then I should see "Model Version" in the custom fields list
    And the prompt form should include a "Model Version" field

  Scenario: Custom field in search
    Given I have a custom field "Model Version"
    And I have created a prompt with Model Version "GPT-4"
    And I have created another prompt with Model Version "Claude-3"
    When I search for "GPT-4" in the "Model Version" field
    Then I should see only prompts with "GPT-4" in Model Version
    And I should not see prompts with "Claude-3" in Model Version

  Scenario: Add custom number field
    Given I navigate to the field manager
    When I click "Add Custom Field"
    And I enter "Token Count" as the field name
    And I select "number" as the field type
    And I click "Save Field"
    Then the prompt form should include a "Token Count" number input

  Scenario: Add custom select field with options
    Given I navigate to the field manager
    When I click "Add Custom Field"
    And I enter "Difficulty" as the field name
    And I select "select" as the field type
    And I enter "Easy,Medium,Hard" as the options
    And I click "Save Field"
    Then the prompt form should include a "Difficulty" dropdown
    And the dropdown should have options "Easy", "Medium", and "Hard"

  Scenario: Custom fields persist with prompts
    Given I have a custom field "Project"
    When I create a prompt with title "API Design"
    And I set the "Project" field to "Backend Services"
    And I save the prompt
    And I reload the page
    Then the prompt "API Design" should have "Backend Services" in the "Project" field

  Scenario: Delete custom field
    Given I have a custom field "Deprecated Field"
    And I have created 3 prompts with values in "Deprecated Field"
    When I navigate to the field manager
    And I delete the "Deprecated Field"
    And I confirm the deletion
    Then "Deprecated Field" should not appear in the custom fields list
    And the prompt form should not include "Deprecated Field"
    But existing prompts should retain their "Deprecated Field" data

  Scenario: Custom field validation
    Given I navigate to the field manager
    When I click "Add Custom Field"
    And I leave the field name empty
    And I click "Save Field"
    Then I should see an error "Field name is required"

  Scenario: Duplicate field name prevention
    Given I have a custom field "Priority"
    When I navigate to the field manager
    And I click "Add Custom Field"
    And I enter "Priority" as the field name
    And I click "Save Field"
    Then I should see an error "Field name already exists"

  Scenario: Sort by custom field
    Given I have a custom field "Priority" of type "number"
    And I have created prompts with Priority values 1, 3, and 2
    When I click on the "Priority" column header
    Then prompts should be sorted by Priority in ascending order
    When I click on the "Priority" column header again
    Then prompts should be sorted by Priority in descending order

  Scenario: Export includes custom fields
    Given I have custom fields "Project" and "Token Count"
    And I have created prompts with custom field values
    When I export prompts to CSV
    Then the CSV should include columns for "Project" and "Token Count"
    And the custom field values should be exported correctly