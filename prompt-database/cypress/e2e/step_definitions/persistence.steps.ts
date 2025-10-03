import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Auto-save related steps
Given('I create a new prompt', () => {
  cy.get('[data-testid="create-prompt-button"]').click();
});

When('I wait for {int} milliseconds', (ms: number) => {
  cy.wait(ms);
});

Then('the prompt should be automatically saved', () => {
  cy.get('[data-testid="auto-save-indicator"]').should('be.visible');
});

Then('I should see a save indicator', () => {
  cy.get('[data-testid="save-indicator"]')
    .should('be.visible')
    .and('contain', 'Saved');
});

Then('the changes should be automatically saved', () => {
  cy.get('[data-testid="auto-save-indicator"]').should('be.visible');
});

Then('the updated timestamp should be refreshed', () => {
  cy.get('[data-testid="prompt-updated-at"]').should('exist');
});

// Browser refresh and persistence steps
Given('I create a prompt with title {string}', (title: string) => {
  cy.get('[data-testid="create-prompt-button"]').click();
  cy.get('[data-testid="prompt-title-input"]').type(title);
});

When('I refresh the page', () => {
  cy.reload();
});

Then('the prompt should contain {string}', (text: string) => {
  cy.get('[data-testid="prompt-list-item"]').first().click();
  cy.get('[data-testid="prompt-text-input"]').should('contain.value', text);
});

Then('all prompt data should be intact', () => {
  cy.get('[data-testid="prompt-list-item"]').first().click();
  cy.get('[data-testid="prompt-title-input"]').should('not.be.empty');
  cy.get('[data-testid="prompt-created-at"]').should('exist');
  cy.get('[data-testid="prompt-updated-at"]').should('exist');
});

// Browser restart simulation
When('I clear the application state', () => {
  cy.window().then((win) => {
    // Simulate a clean browser restart by clearing all state
    win.sessionStorage.clear();
    // Keep localStorage to test persistence
  });
});

When('I visit the application again', () => {
  cy.visit('/');
});

Then('the prompt should contain the original data', () => {
  cy.get('[data-testid="prompt-list-item"]').first().click();
  cy.get('[data-testid="prompt-text-input"]').should('contain.value', 'This should survive browser restart');
});

// Storage quota handling
Given('I have filled the storage to near capacity', () => {
  // Simulate near-full storage by creating many large prompts
  cy.window().then((win) => {
    const largePrompts = [];
    for (let i = 0; i < 100; i++) {
      largePrompts.push({
        id: `large-prompt-${i}`,
        title: `Large Prompt ${i}`,
        promptText: 'Large content '.repeat(1000), // Simulate large content
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    win.localStorage.setItem('promptdb_prompts', JSON.stringify(largePrompts));
  });
  cy.reload();
});

When('I try to create a new large prompt', () => {
  cy.get('[data-testid="create-prompt-button"]').click();
  cy.get('[data-testid="prompt-title-input"]').type('Large New Prompt');
  cy.get('[data-testid="prompt-text-input"]').type('Very large content '.repeat(1000));
  cy.get('[data-testid="save-prompt-button"]').click();
});

Then('I should see a storage quota warning', () => {
  cy.get('[data-testid="storage-warning"]').should('be.visible');
});

Then('I should be given options to free up space', () => {
  cy.get('[data-testid="cleanup-options"]').should('be.visible');
});

Then('the application should remain functional', () => {
  cy.get('[data-testid="prompt-list"]').should('be.visible');
  cy.get('[data-testid="create-prompt-button"]').should('be.visible');
});

// LocalStorage fallback
Given('IndexedDB is not available', () => {
  cy.window().then((win) => {
    // Mock IndexedDB to throw errors
    Object.defineProperty(win, 'indexedDB', {
      value: {
        open: () => {
          throw new Error('IndexedDB not available');
        },
      },
    });
  });
});

Then('the prompt should be saved to LocalStorage', () => {
  cy.window().then((win) => {
    const stored = win.localStorage.getItem('promptdb_prompts');
    expect(stored).to.not.be.null;
    const prompts = JSON.parse(stored!);
    expect(prompts.some((p: any) => p.title === 'LocalStorage Fallback')).to.be.true;
  });
});

// Data migration
Given('I have data stored in LocalStorage', () => {
  cy.window().then((win) => {
    const testPrompts = [
      {
        id: 'legacy-prompt-1',
        title: 'Legacy Prompt',
        promptText: 'This was saved in LocalStorage',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    win.localStorage.setItem('promptdb_prompts', JSON.stringify(testPrompts));
  });
});

When('IndexedDB becomes available', () => {
  // Restore normal IndexedDB functionality
  cy.reload();
});

Then('the data should be migrated to IndexedDB', () => {
  // This would need to be implemented in the actual application
  cy.get('[data-testid="migration-complete"]').should('exist');
});

Then('all existing prompts should remain accessible', () => {
  cy.get('[data-testid="prompt-list"]').should('contain', 'Legacy Prompt');
});

Then('the LocalStorage backup should be maintained', () => {
  cy.window().then((win) => {
    const backup = win.localStorage.getItem('promptdb_prompts_backup');
    expect(backup).to.not.be.null;
  });
});

// Concurrent tab handling
Given('I have the application open in multiple tabs', () => {
  // This is complex to test in Cypress, but we can simulate the behavior
  cy.window().then((win) => {
    // Simulate tab synchronization setup
    win.localStorage.setItem('promptdb_tab_sync', 'enabled');
  });
});

When('I create a prompt in tab 1', () => {
  cy.get('[data-testid="create-prompt-button"]').click();
  cy.get('[data-testid="prompt-title-input"]').type('Multi-tab Test');
  cy.get('[data-testid="save-prompt-button"]').click();
});

When('I switch to tab 2', () => {
  // Simulate tab switch by triggering storage event
  cy.window().then((win) => {
    win.dispatchEvent(new StorageEvent('storage', {
      key: 'promptdb_prompts',
      newValue: win.localStorage.getItem('promptdb_prompts'),
    }));
  });
});

Then('I should see the new prompt in tab 2', () => {
  cy.get('[data-testid="prompt-list"]').should('contain', 'Multi-tab Test');
});

Then('both tabs should show synchronized data', () => {
  cy.get('[data-testid="sync-status"]').should('contain', 'Synchronized');
});

// Error recovery
Given('I have prompts stored in the database', () => {
  cy.seedDatabase([
    {
      id: 'test-prompt-1',
      title: 'Test Prompt',
      promptText: 'Test content',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);
});

When('the storage becomes corrupted', () => {
  cy.window().then((win) => {
    // Simulate corrupted data
    win.localStorage.setItem('promptdb_prompts', 'corrupted-data-not-json');
  });
  cy.reload();
});

Then('I should see an error recovery message', () => {
  cy.get('[data-testid="error-recovery"]').should('be.visible');
});

Then('I should be offered options to restore from backup', () => {
  cy.get('[data-testid="restore-options"]').should('be.visible');
});

Then('the application should not crash', () => {
  cy.get('body').should('be.visible');
  cy.get('[data-testid="app-container"]').should('be.visible');
});