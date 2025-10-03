# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Prompt Database Application - a browser-based personal prompt management system for AI practitioners to organize, search, and reuse their prompts efficiently. The application emphasizes simplicity, local storage, and quick access to prompts.

## Architecture Overview

### Core Features
- **CRUD Operations**: Complete prompt management with title (required/unique), prompt text, category, tags, expected output, and notes fields
- **Dynamic Field Management**: Users can extend the database schema with custom fields
- **Search & Sort**: Single-field search with intelligent matching and sortable columns
- **Master-Detail Interface**: Split-view with paginated prompt list and detail panel
- **Local Storage**: IndexedDB for primary storage with LocalStorage fallback
- **Copy to Clipboard**: Quick action that updates "Last Used" timestamp

### Data Model
```typescript
interface Prompt {
  id: string;                    // UUID
  title: string;                 // Required, unique
  promptText?: string;
  category?: string;
  tags?: string;                 // Comma-separated
  expectedOutput?: string;
  lastUsed?: Date;
  notes?: string;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Recommended Tech Stack
- **Frontend**: React with TypeScript
- **UI**: Tailwind CSS with HeadlessUI
- **State Management**: Zustand
- **Storage**: IndexedDB with Dexie.js
- **Build Tool**: Vite

## Development Commands

Since this is a new project without established commands yet, here are the typical commands for a React/TypeScript/Vite project:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests (when implemented)
npm run test
```

## Key Implementation Considerations

### Storage Strategy
- Use IndexedDB for datasets > 10MB (supports 1000+ prompts)
- Implement debounced auto-save (500ms) on all changes
- Monitor storage quota and warn users approaching limits

### Performance Requirements
- Initial load < 2 seconds
- Search results < 200ms
- Sort operations < 100ms
- Navigation between prompts < 50ms

### Browser Support
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile Chrome and Safari
- Progressive enhancement with fallbacks

### Security
- All data stored locally (no external APIs in v1)
- Sanitize user inputs to prevent XSS
- Implement CSP headers
- HTTPS only for deployment

## Development Phases

The PRD outlines 5 development phases:
1. **Core Foundation**: Data model, IndexedDB, basic CRUD
2. **Full CRUD and UI**: Master-detail layout, responsive design
3. **Search and Sort**: Field search, column sorting, pagination
4. **Enhanced Features**: Clipboard, categories, custom fields, onboarding
5. **Polish and Deploy**: Testing, optimization, documentation

## State Management Structure

```javascript
{
  prompts: {
    items: Map<string, Prompt>,
    selectedId: string | null,
    searchQuery: string,
    searchField: string,
    sortField: string,
    sortDirection: 'asc' | 'desc',
    currentPage: number
  },
  categories: {
    items: Category[],
    custom: string[]
  },
  settings: AppSettings,
  ui: {
    isCreating: boolean,
    isLoading: boolean,
    error: string | null
  }
}
```