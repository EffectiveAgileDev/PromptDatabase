module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:5173'],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:   http://localhost',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        chromeFlags: '--no-sandbox --headless --disable-gpu',
      },
    },
    assert: {
      assertions: {
        // Performance budgets
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 500 }],
        
        // Resource budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 500000 }], // 500KB
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }], // 100KB
        'resource-summary:image:size': ['warn', { maxNumericValue: 1000000 }], // 1MB
        'resource-summary:total:size': ['error', { maxNumericValue: 2000000 }], // 2MB
        
        // Network requests
        'resource-summary:script:count': ['warn', { maxNumericValue: 10 }],
        'resource-summary:stylesheet:count': ['warn', { maxNumericValue: 5 }],
        'resource-summary:third-party:count': ['warn', { maxNumericValue: 5 }],
        
        // Specific audits
        'unused-javascript': ['warn', { maxNumericValue: 100000 }],
        'unused-css-rules': ['warn', { maxNumericValue: 50000 }],
        'modern-image-formats': 'warn',
        'uses-webp-images': 'warn',
        'efficient-animated-content': 'warn',
        'dom-size': ['warn', { maxNumericValue: 1000 }],
        
        // Accessibility requirements
        'color-contrast': 'error',
        'heading-order': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        
        // Best practices
        'uses-https': 'error',
        'no-vulnerable-libraries': 'error',
        'errors-in-console': 'warn',
        
        // SEO requirements
        'document-title': 'error',
        'meta-description': 'error',
        'robots-txt': 'warn',
        'canonical': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: '.lighthouseci',
    },
  },
};