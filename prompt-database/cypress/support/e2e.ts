// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add global types
declare global {
  namespace Cypress {
    interface Chainable {
      resetDatabase(): Chainable<void>;
      seedDatabase(prompts: any[]): Chainable<void>;
    }
  }
}