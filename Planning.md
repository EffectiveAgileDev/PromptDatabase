# Planning: Test-First BDD Implementation Strategy

## Overview

This document outlines our test-first approach using Behavior-Driven Development (BDD) with the Red-Green-Refactor paradigm. Tests will serve as the living specification for the Prompt Database application.

## Testing Philosophy

### Core Principles
1. **Tests as Specification**: Tests define application behavior before implementation
2. **Red-Green-Refactor Cycle**: 
   - RED: Write failing acceptance test
   - GREEN: Implement minimal code to pass
   - REFACTOR: Improve code quality while maintaining green tests
3. **Outside-In Development**: Start with user-facing acceptance tests, drive down to unit tests
4. **Living Documentation**: BDD scenarios serve as executable documentation

## Technology Stack for Testing

### Testing Framework
- **Cypress** for E2E/acceptance testing (supports BDD syntax via cypress-cucumber-preprocessor)
- **Vitest** for unit and component testing
- **React Testing Library** for component behavior testing
- **MSW (Mock Service Worker)** for mocking storage layer

### BDD Tools
- **Gherkin** syntax for feature definitions
- **cypress-cucumber-preprocessor** for Cypress BDD integration
- **@badeball/cypress-cucumber-preprocessor** (TypeScript support)

## Feature Files Organization

```
tests/
├── e2e/
│   ├── features/
│   │   ├── prompt-management.feature
│   │   ├── search.feature
│   │   ├── sorting.feature
│   │   ├── clipboard.feature
│   │   ├── persistence.feature
│   │   ├── first-time-user.feature
│   │   ├── custom-fields.feature
│   │   └── responsive-design.feature
│   └── step-definitions/
│       ├── common.steps.ts
│       ├── prompt.steps.ts
│       ├── search.steps.ts
│       └── ui.steps.ts
├── unit/
│   ├── stores/
│   ├── utils/
│   └── hooks/
└── integration/
    ├── storage/
    └── components/
```

## BDD Scenarios Mapped from PRD

### Phase 1: Core Foundation

#### Feature: Prompt Management - Create and View

```gherkin
Feature: Prompt Management
  As an AI practitioner
  I want to manage my prompt library
  So that I can organize and reuse my prompts efficiently

  Background:
    Given I am on the Prompt Database application
    And the database is empty

  Scenario: Create first prompt with minimal data
    When I see the new prompt form
    And I enter "Email Reply Template" as the title
    And I click the save button
    Then I should see "Email Reply Template" in the prompt list
    And the prompt should be automatically selected
    And the detail panel should show the prompt details

  Scenario: Title uniqueness validation
    Given I have a prompt with title "Email Template"
    When I try to create a new prompt with title "Email Template"
    Then I should see an error "A prompt with this title already exists"
    And the prompt should not be saved

  Scenario: Create prompt with all fields
    When I create a new prompt with:
      | Field           | Value                                    |
      | Title           | Code Review Prompt                       |
      | Prompt Text     | Review this code for best practices...   |
      | Category        | Code Review                              |
      | Tags            | review, code, quality                    |
      | Expected Output | Detailed analysis with suggestions       |
      | Notes           | Use for PR reviews                       |
    Then the prompt should be saved with all fields
    And all fields should be visible in the detail panel
```

#### Feature: Data Persistence

```gherkin
Feature: Data Persistence
  As a user
  I want my prompts to persist across sessions
  So that I don't lose my work

  Scenario: Auto-save on field change
    Given I have a prompt selected
    When I modify the prompt text to "Updated prompt content"
    And I wait 500 milliseconds
    Then the changes should be saved to IndexedDB
    And no save button should be visible

  Scenario: Data persists after refresh
    Given I have created 3 prompts
    When I refresh the browser
    Then I should see all 3 prompts
    And their content should be unchanged

  Scenario: Handle storage quota warning
    Given I have used 90% of available storage
    When I create a new prompt
    Then I should see a warning "Storage nearly full (90% used)"
```

### Phase 2: Full CRUD and UI

#### Feature: Master-Detail Interface

```gherkin
Feature: Master-Detail Interface
  As a user
  I want a split-view interface
  So that I can browse prompts while viewing details

  Scenario: Desktop layout
    Given I am on a desktop browser (1920x1080)
    Then I should see a split-panel layout
    And the left panel should show the prompt list
    And the right panel should show the selected prompt details
    And the panels should have a 30/70 split ratio

  Scenario: Mobile responsive layout
    Given I am on a mobile device (375x667)
    Then I should see a stacked layout
    And the prompt list should be visible first
    When I select a prompt
    Then the detail view should replace the list view
    And I should see a back button to return to the list

  Scenario: Update existing prompt
    Given I have a prompt "Test Prompt" selected
    When I change the title to "Updated Test Prompt"
    And I change the category to "Task Prompts"
    Then the changes should auto-save after 500ms
    And the list should reflect the new title
    And the sort order should update if sorting by title

  Scenario: Delete prompt with confirmation
    Given I have 5 prompts in my database
    And I have selected the prompt "Prompt to Delete"
    When I click the delete button
    Then I should see a confirmation dialog
    When I confirm the deletion
    Then the prompt should be removed from the list
    And the next prompt should be selected
    And the database should contain 4 prompts
```

### Phase 3: Search and Sort

#### Feature: Search Functionality

```gherkin
Feature: Search Functionality
  As a user
  I want to search my prompts
  So that I can quickly find what I need

  Scenario: Search by title
    Given I have 50 prompts in my database
    And I select "Title" from the search field dropdown
    When I type "email" in the search box
    Then I should see only prompts with "email" in the title
    And the results should update within 200ms
    And the result count should be displayed

  Scenario: Search is case-insensitive
    Given I have a prompt with title "Email Template"
    When I search for "EMAIL" in titles
    Then I should see "Email Template" in the results

  Scenario: Clear search
    Given I have an active search with 3 results
    When I click the clear search button
    Then I should see all prompts again
    And the search box should be empty
```

#### Feature: Sorting

```gherkin
Feature: Sorting and Organization
  As a user
  I want to sort my prompts
  So that I can organize them effectively

  Scenario: Sort by column click
    Given I have 10 prompts with various titles
    When I click the "Title" column header
    Then prompts should be sorted alphabetically by title
    And an up arrow should appear next to "Title"
    When I click the "Title" column header again
    Then prompts should be sorted in reverse alphabetical order
    And a down arrow should appear next to "Title"

  Scenario: Sort by last used date
    Given I have prompts with different last used dates
    When I click the "Last Used" column header
    Then prompts should be sorted by date (newest first)
    And recently used prompts should appear at the top

  Scenario: Sort persistence during session
    Given I have sorted by "Category" ascending
    When I navigate to a different prompt
    And I perform a search
    Then the sort order should remain "Category" ascending
```

### Phase 4: Enhanced Features

#### Feature: Copy to Clipboard

```gherkin
Feature: Copy to Clipboard
  As a user
  I want to quickly copy prompt text
  So that I can use it in other applications

  Scenario: Successful copy with feedback
    Given I have a prompt selected with text "Generate a summary"
    When I click the "Copy to Clipboard" button
    Then the text should be copied to my clipboard
    And I should see "Copied!" message for 2 seconds
    And the "Last Used" field should update to the current time

  Scenario: Copy updates last used timestamp
    Given I have a prompt that was last used "30 days ago"
    When I copy the prompt to clipboard
    Then the "Last Used" should show "just now"
    And the prompt should move up if sorted by "Last Used"
```

#### Feature: Custom Fields

```gherkin
Feature: Dynamic Field Management
  As a power user
  I want to add custom fields
  So that I can track additional information

  Scenario: Add custom text field
    Given I am in the settings page
    When I add a custom field with name "AI Model" and type "text"
    Then the field should appear in all prompt forms
    And the field should be optional
    And existing prompts should have this field empty

  Scenario: Custom field in search
    Given I have a custom field "AI Model"
    And I have prompts with "GPT-4" in that field
    When I search for "GPT-4" in the "AI Model" field
    Then I should see only prompts with "GPT-4" in that field
```

#### Feature: First-Time User Experience

```gherkin
Feature: First-Time User Experience
  As a new user
  I want guided onboarding
  So that I can start using the app immediately

  Scenario: Empty database shows create form
    Given this is my first visit to the application
    Then I should see the new prompt form immediately
    And the form should have helpful placeholder text
    And example content should be visible

  Scenario: Smooth transition after first prompt
    Given I am a new user on the create form
    When I create my first prompt
    Then the prompt should appear in the list
    And it should be automatically selected
    And I should see options to create another prompt
```

### Phase 5: Polish and Performance

#### Feature: Performance Requirements

```gherkin
Feature: Performance Requirements
  As a user
  I want fast, responsive interactions
  So that my workflow isn't interrupted

  Scenario: Fast initial load
    When I navigate to the application URL
    Then the app should be interactive within 3 seconds
    And the initial render should complete within 2 seconds

  Scenario: Handle large dataset
    Given I have 1000 prompts in my database
    When I load the application
    Then the first page should render within 2 seconds
    And scrolling should remain smooth (60 fps)
    And search should return results within 200ms

  Scenario: Efficient pagination
    Given I have 500 prompts
    And I have 50 prompts per page
    When I navigate to page 3
    Then the page should load within 100ms
    And I should see prompts 101-150
```

## Red-Green-Refactor Workflow

### Development Process

1. **RED Phase**
   - Write BDD scenario based on PRD acceptance criteria
   - Run test to confirm it fails (no implementation exists)
   - Write component/unit tests that will drive the implementation

2. **GREEN Phase**
   - Write minimal implementation to pass the test
   - Focus on making it work, not perfect
   - All tests should pass

3. **REFACTOR Phase**
   - Improve code quality while keeping tests green
   - Extract components, utilities, and hooks
   - Optimize performance
   - Ensure accessibility

### Example Workflow: Creating First Prompt

```typescript
// 1. RED: Write failing E2E test (Cypress)
describe('Create First Prompt', () => {
  it('should show create form for new users', () => {
    cy.visit('/')
    cy.get('[data-testid="prompt-form"]').should('be.visible')
    cy.get('[data-testid="title-input"]').should('have.attr', 'placeholder')
  })
})

// 2. RED: Write failing component test
test('PromptForm validates required title', () => {
  render(<PromptForm />)
  const saveButton = screen.getByRole('button', { name: /save/i })
  fireEvent.click(saveButton)
  expect(screen.getByText(/title is required/i)).toBeInTheDocument()
})

// 3. GREEN: Implement minimal solution
const PromptForm = () => {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  
  const handleSave = () => {
    if (!title) {
      setError('Title is required')
      return
    }
    // Save logic
  }
  
  return (
    <form data-testid="prompt-form">
      <input 
        data-testid="title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter prompt title"
      />
      {error && <span>{error}</span>}
      <button onClick={handleSave}>Save</button>
    </form>
  )
}

// 4. REFACTOR: Extract validation, improve structure
const usePromptValidation = () => {
  const validateTitle = (title: string) => {
    if (!title.trim()) return 'Title is required'
    if (title.length > 100) return 'Title too long'
    return null
  }
  return { validateTitle }
}
```

## Implementation Priority

### Week 1-2: Foundation
1. Project setup with Vite, React, TypeScript
2. Configure Cypress with BDD preprocessor
3. Implement first BDD scenarios for create/read
4. Set up IndexedDB with Dexie
5. Create basic form and list components

### Week 3-4: CRUD & Layout
1. Complete update/delete scenarios
2. Implement master-detail layout
3. Add responsive design tests
4. Implement auto-save functionality

### Week 5: Search & Sort
1. Implement search scenarios
2. Add sorting functionality
3. Create pagination tests
4. Optimize for performance

### Week 6: Enhanced Features
1. Clipboard functionality
2. Custom fields
3. First-time user experience
4. Category management

### Week 7: Polish
1. Performance optimization
2. Cross-browser testing
3. Accessibility testing
4. Documentation

## Testing Guidelines

### Test Naming Conventions
- Feature files: `kebab-case.feature`
- Step definitions: `camelCase.steps.ts`
- Unit tests: `ComponentName.test.tsx`
- Integration tests: `feature.integration.test.ts`

### Test Data Management
- Use factories for test data generation
- Reset database before each test
- Use deterministic data for reproducible tests

### Continuous Integration
- Run unit tests on every commit
- Run E2E tests on pull requests
- Generate test coverage reports
- Fail builds if coverage drops below 80%

## Success Criteria

### Test Coverage Goals
- Unit test coverage: 90%+
- Integration test coverage: 80%+
- E2E coverage: All critical user paths
- Accessibility: 100% WCAG 2.1 AA compliance

### Performance Benchmarks
- All E2E tests complete within 5 minutes
- Unit test suite runs in under 30 seconds
- Component tests run in under 1 minute

## Next Steps

1. Initialize project with testing infrastructure
2. Create first feature file: `prompt-management.feature`
3. Implement step definitions
4. Write first failing test
5. Begin RED-GREEN-REFACTOR cycle

## Notes on PRD Adjustments

Based on the test-first approach, consider these refinements to the PRD:

1. **Testable Acceptance Criteria**: All criteria are now expressed as BDD scenarios
2. **Performance Metrics**: Specific, measurable targets for each interaction
3. **Error States**: Added scenarios for validation and error handling
4. **Edge Cases**: Tests cover empty states, large datasets, and storage limits
5. **Accessibility**: Each feature includes keyboard navigation and screen reader tests

The BDD scenarios serve as the living specification, ensuring the implementation matches user expectations exactly.