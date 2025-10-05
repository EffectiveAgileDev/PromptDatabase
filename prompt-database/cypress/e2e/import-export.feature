Feature: Import/Export Functionality
  As a user managing my prompt database
  I want to import and export my prompts
  So that I can backup my data and share prompts with others

  Background:
    Given I have a prompt database with sample prompts
    And I am on the main application page

  Scenario: Export prompts to JSON format
    Given I have 25 prompts in my database
    When I click "Export" in the main menu
    And I select "JSON" as the export format
    And I choose "All prompts" as the export scope
    And I click "Download Export"
    Then a JSON file should be downloaded
    And the file should contain all 25 prompts
    And each prompt should include:
      | Field | Required |
      | id | Yes |
      | title | Yes |
      | promptText | Yes |
      | category | No |
      | tags | No |
      | customFields | No |
      | createdAt | Yes |
      | updatedAt | Yes |

  Scenario: Export prompts to CSV format
    Given I have prompts with various fields
    When I export to CSV format
    Then the CSV should have headers for all standard fields
    And custom fields should be included as separate columns
    And complex data should be properly escaped
    And the file should be readable in Excel/Google Sheets

  Scenario: Selective export by category
    Given I have prompts in categories "Development", "Writing", and "Research"
    When I choose to export only "Development" category
    Then only prompts from the "Development" category should be exported
    And the export count should match the category filter

  Scenario: Selective export by date range
    Given I have prompts created over the past 6 months
    When I set export date range to "Last 30 days"
    Then only prompts created in the last 30 days should be exported
    And older prompts should be excluded

  Scenario: Import prompts from JSON file
    Given I have an empty database
    When I click "Import" in the main menu
    And I select a valid JSON file containing 10 prompts
    And I click "Import Prompts"
    Then I should see a preview of the 10 prompts to be imported
    And I should see validation status for each prompt
    When I confirm the import
    Then all 10 prompts should be added to my database
    And I should see a success message "10 prompts imported successfully"

  Scenario: Import prompts from CSV file
    Given I have a CSV file with prompt data
    When I import the CSV file
    Then I should see a column mapping interface
    And I should be able to map CSV columns to prompt fields:
      | CSV Column | Prompt Field |
      | Title | title |
      | Content | promptText |
      | Category | category |
      | Tags | tags |
    And unmapped columns should be offered as custom fields
    When I confirm the mapping
    Then prompts should be imported with the mapped data

  Scenario: Handle duplicate prompts during import
    Given I have existing prompts in my database
    And I import a file containing some duplicate titles
    When I process the import
    Then I should see a conflict resolution dialog
    And I should have options for each duplicate:
      | Option | Description |
      | Skip | Don't import the duplicate |
      | Rename | Add suffix like "(imported)" |
      | Overwrite | Replace existing prompt |
      | Keep Both | Import with modified title |
    And I should be able to apply the same action to all duplicates

  Scenario: Import validation and error handling
    Given I import a file with invalid data
    When the system validates the import
    Then I should see errors for:
      | Error Type | Example |
      | Missing title | Prompt without title field |
      | Invalid date | Malformed createdAt timestamp |
      | Invalid JSON | Corrupted file structure |
      | Size limit | File too large (>10MB) |
    And valid prompts should still be importable
    And I should see a summary of what can/cannot be imported

  Scenario: Backup and restore entire database
    Given I have a complete prompt database with custom fields
    When I create a full backup
    Then the backup should include:
      | Component | Description |
      | Prompts | All prompt data |
      | Custom Fields | Field definitions |
      | Categories | Category information |
      | Settings | User preferences |
      | Metadata | Version info |
    When I restore from this backup on a new device
    Then my entire prompt database should be recreated exactly

  Scenario: Share individual prompts
    Given I have a prompt I want to share
    When I right-click on the prompt
    And I select "Share Prompt"
    Then I should see sharing options:
      | Option | Format |
      | Copy Link | Shareable URL |
      | Export JSON | Single prompt file |
      | Copy Text | Formatted text |
      | QR Code | For mobile sharing |
    And the shared format should be importable by other users

  Scenario: Import from other prompt management tools
    Given I have prompts exported from another tool
    When I use the "Import from..." option
    Then I should see support for:
      | Tool | Format |
      | ChatGPT | Conversation export |
      | Notion | Database export |
      | Obsidian | Markdown files |
      | Plain text | Bulk text import |
    And each import should have appropriate field mapping

  Scenario: Scheduled automatic backups
    Given I want to protect my data
    When I enable automatic backups
    Then I should be able to configure:
      | Setting | Options |
      | Frequency | Daily, Weekly, Monthly |
      | Location | Local download, Cloud storage |
      | Retention | Keep last N backups |
      | Format | JSON, CSV, or both |
    And backups should run in the background
    And I should be notified of backup success/failure

  Scenario: Import progress and cancellation
    Given I am importing a large file with 1000+ prompts
    When the import begins
    Then I should see a progress bar
    And estimated time remaining
    And the ability to cancel the import
    When I cancel midway
    Then no partial data should be imported
    And I should return to the pre-import state

  Scenario: Export with custom formatting
    Given I want to export prompts for use in another system
    When I choose "Custom Export"
    Then I should be able to define:
      | Setting | Options |
      | Field selection | Choose which fields to include |
      | Field order | Drag to reorder columns |
      | Field naming | Custom column headers |
      | Data format | How dates/arrays are formatted |
      | File naming | Template for export filename |
    And I should be able to save export templates for reuse

  Scenario: Import template library
    Given I want to start with professional prompt templates
    When I access the template library
    Then I should see curated prompt collections:
      | Collection | Description |
      | Business Writing | Professional communication |
      | Code Development | Programming assistance |
      | Creative Writing | Content creation |
      | Data Analysis | Research and analysis |
      | Education | Teaching and learning |
    And I should be able to preview before importing
    And select specific prompts from each collection

  Scenario: Version control and change tracking
    Given I regularly update my prompt database
    When I export with version control
    Then each export should include:
      | Metadata | Purpose |
      | Export timestamp | When backup was created |
      | Version number | Sequential backup number |
      | Change summary | What changed since last export |
      | Hash/checksum | Data integrity verification |
    And I should be able to compare different versions
    And see what changed between exports

  Scenario: Collaborative sharing and merging
    Given I work with a team that shares prompts
    When we each maintain our own databases
    Then we should be able to:
      | Action | Description |
      | Share changes | Export only new/modified prompts |
      | Merge updates | Import changes from team members |
      | Resolve conflicts | Handle duplicate or conflicting prompts |
      | Track attribution | Know who created/modified prompts |
    And maintain a unified team prompt library

  Scenario: Import/Export accessibility
    Given I am using assistive technology
    When I use import/export features
    Then all dialogs should be keyboard accessible
    And screen readers should announce progress
    And file selection should work with assistive technology
    And error messages should be clearly announced
    And complex operations should have clear instructions