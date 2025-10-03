import { http, HttpResponse } from 'msw';

// Since our app uses IndexedDB locally, we'll mainly use MSW for any future API calls
// For now, we'll set up basic handlers that could be useful for testing

export const handlers = [
  // Health check endpoint (for testing purposes)
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),

  // Future API endpoints can be added here
  // Example: Export/Import functionality
  http.post('/api/export', () => {
    return HttpResponse.json({ message: 'Export successful' });
  }),

  http.post('/api/import', () => {
    return HttpResponse.json({ message: 'Import successful' });
  }),

  // Catch-all handler for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.error();
  }),
];