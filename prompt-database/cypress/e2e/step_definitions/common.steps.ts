import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Common navigation steps
Given('I visit the application', () => {
  cy.visit('/');
});

Given('the database is empty', () => {
  cy.resetDatabase();
});

// Form interaction steps
When('I click the {string} button', (buttonText: string) => {
  cy.contains('button', buttonText).click();
});

When('I enter {string} as the title', (title: string) => {
  cy.get('[data-testid="prompt-title-input"]').clear().type(title);
});

When('I enter {string} as the prompt text', (promptText: string) => {
  cy.get('[data-testid="prompt-text-input"]').clear().type(promptText);
});

When('I select {string} as the category', (category: string) => {
  cy.get('[data-testid="prompt-category-select"]').select(category);
});

When('I enter {string} as tags', (tags: string) => {
  cy.get('[data-testid="prompt-tags-input"]').clear().type(tags);
});

When('I enter {string} as expected output', (expectedOutput: string) => {
  cy.get('[data-testid="prompt-expected-output-input"]').clear().type(expectedOutput);
});

When('I enter {string} as notes', (notes: string) => {
  cy.get('[data-testid="prompt-notes-input"]').clear().type(notes);
});

When('I save the prompt', () => {
  cy.get('[data-testid="save-prompt-button"]').click();
});

When('I save the changes', () => {
  cy.get('[data-testid="save-prompt-button"]').click();
});

// Verification steps
Then('I should see {string} in the prompt list', (title: string) => {
  cy.get('[data-testid="prompt-list"]').should('contain', title);
});

Then('I should see an error message {string}', (errorMessage: string) => {
  cy.get('[data-testid="error-message"]').should('contain', errorMessage);
});

Then('the prompt should not be saved', () => {
  cy.get('[data-testid="prompt-form"]').should('be.visible');
});

Then('the prompt should have a created timestamp', () => {
  cy.get('[data-testid="prompt-created-at"]').should('exist');
});

Then('the prompt should have an updated timestamp', () => {
  cy.get('[data-testid="prompt-updated-at"]').should('exist');
});

// List interaction steps
When('I select the prompt from the list', () => {
  cy.get('[data-testid="prompt-list-item"]').first().click();
});

When('I change the title to {string}', (newTitle: string) => {
  cy.get('[data-testid="prompt-title-input"]').clear().type(newTitle);
});

When('I modify the prompt text', () => {
  cy.get('[data-testid="prompt-text-input"]').clear().type('This is updated prompt text');
});

// Delete operations
When('I click the delete button', () => {
  cy.get('[data-testid="delete-prompt-button"]').click();
});

When('I confirm the deletion', () => {
  cy.get('[data-testid="confirm-delete-button"]').click();
});

When('I cancel the deletion', () => {
  cy.get('[data-testid="cancel-delete-button"]').click();
});

Then('the prompt should be removed from the list', () => {
  cy.get('[data-testid="prompt-list"]').should('not.contain', 'Prompt to Delete');
});

Then('the prompt should no longer exist in the database', () => {
  cy.window().then((win) => {
    const stored = win.localStorage.getItem('promptdb_prompts');
    if (stored) {
      const prompts = JSON.parse(stored);
      expect(prompts.find((p: any) => p.title === 'Prompt to Delete')).to.be.undefined;
    }
  });
});

Then('the prompt should still exist in the list', () => {
  cy.get('[data-testid="prompt-list"]').should('contain', 'Prompt to Keep');
});

Then('the prompt should remain in the database', () => {
  cy.window().then((win) => {
    const stored = win.localStorage.getItem('promptdb_prompts');
    if (stored) {
      const prompts = JSON.parse(stored);
      expect(prompts.find((p: any) => p.title === 'Prompt to Keep')).to.exist;
    }
  });
});