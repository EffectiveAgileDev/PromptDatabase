import { defineConfig } from 'cypress';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import { createBundler } from '@bahmutov/cypress-esbuild-preprocessor';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.feature',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      addCucumberPreprocessorPlugin(on, config);
      
      on(
        'file:preprocessor',
        createBundler({
          plugins: [
            {
              name: 'cucumber',
              setup(build) {
                build.onLoad({ filter: /\.feature$/ }, async (args) => {
                  return {
                    contents: '',
                    loader: 'text',
                  };
                });
              },
            },
          ],
        })
      );

      return config;
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },
});