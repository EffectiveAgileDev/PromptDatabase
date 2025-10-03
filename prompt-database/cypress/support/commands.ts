/// <reference types="cypress" />

// Custom commands for database operations
Cypress.Commands.add('resetDatabase', () => {
  cy.window().then((win) => {
    // Clear IndexedDB
    const deleteDB = win.indexedDB.deleteDatabase('PromptDatabase');
    deleteDB.onsuccess = () => {
      console.log('Database deleted successfully');
    };
    
    // Clear localStorage
    win.localStorage.clear();
  });
});

Cypress.Commands.add('seedDatabase', (prompts: any[]) => {
  cy.window().then((win) => {
    prompts.forEach((prompt) => {
      win.localStorage.setItem(
        `promptdb_prompts`, 
        JSON.stringify(prompts)
      );
    });
  });
});