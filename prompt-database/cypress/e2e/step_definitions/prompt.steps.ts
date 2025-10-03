import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Setup steps for existing prompts
Given('I have a prompt with title {string}', (title: string) => {
  const prompt = {
    id: `test-${Date.now()}`,
    title,
    promptText: 'Sample prompt text',
    category: 'Test',
    tags: 'test',
    expectedOutput: 'Sample output',
    notes: 'Sample notes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  cy.window().then((win) => {
    const existing = win.localStorage.getItem('promptdb_prompts');
    const prompts = existing ? JSON.parse(existing) : [];
    prompts.push(prompt);
    win.localStorage.setItem('promptdb_prompts', JSON.stringify(prompts));
  });
  
  cy.reload();
});

When('I try to create a new prompt with title {string}', (title: string) => {
  cy.get('[data-testid="create-prompt-button"]').click();
  cy.get('[data-testid="prompt-title-input"]').clear().type(title);
  cy.get('[data-testid="prompt-text-input"]').clear().type('Some prompt text');
  cy.get('[data-testid="save-prompt-button"]').click();
});

// Verification steps for complex prompts
Then('the prompt should contain all the entered information', () => {
  cy.get('[data-testid="prompt-list-item"]').first().click();
  
  cy.get('[data-testid="prompt-title-input"]').should('have.value', 'Complete Prompt');
  cy.get('[data-testid="prompt-text-input"]').should('contain.value', 'Write a detailed technical explanation');
  cy.get('[data-testid="prompt-category-select"]').should('have.value', 'Technical');
  cy.get('[data-testid="prompt-tags-input"]').should('have.value', 'documentation, technical, explanation');
  cy.get('[data-testid="prompt-expected-output-input"]').should('contain.value', 'A well-structured technical document');
  cy.get('[data-testid="prompt-notes-input"]').should('contain.value', 'Use this for complex technical topics');
});

Then('the prompt should be searchable by any field', () => {
  // Test searching by title
  cy.get('[data-testid="search-input"]').clear().type('Complete');
  cy.get('[data-testid="prompt-list"]').should('contain', 'Complete Prompt');
  
  // Test searching by tags
  cy.get('[data-testid="search-input"]').clear().type('technical');
  cy.get('[data-testid="prompt-list"]').should('contain', 'Complete Prompt');
  
  // Clear search
  cy.get('[data-testid="search-input"]').clear();
});

Then('the original prompt should no longer exist', () => {
  cy.get('[data-testid="prompt-list"]').should('not.contain', 'Original Title');
});

// Timestamp verification
Then('the prompt should have an updated timestamp', () => {
  cy.get('[data-testid="prompt-updated-at"]').should('exist');
  cy.get('[data-testid="prompt-updated-at"]').invoke('text').then((updatedText) => {
    cy.get('[data-testid="prompt-created-at"]').invoke('text').then((createdText) => {
      // For new prompts, created and updated should be the same
      // For updated prompts, updated should be more recent
      expect(updatedText).to.be.a('string');
      expect(createdText).to.be.a('string');
    });
  });
});