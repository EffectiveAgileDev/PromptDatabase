# Prompt Database Application

A browser-based personal prompt management system for AI practitioners to organize, search, and reuse their prompts efficiently.

## Features

- **Complete CRUD Operations** - Create, read, update, and delete prompts
- **Dynamic Custom Fields** - Extend the database schema with custom fields
- **Advanced Search & Sort** - Search across any field with intelligent matching
- **Master-Detail Interface** - Split-view with paginated prompt list
- **Local Storage** - All data stored locally using IndexedDB
- **Dark Mode** - System-aware theme with manual toggle
- **Copy to Clipboard** - Quick action that updates "Last Used" timestamp
- **Import/Export** - CSV import/export functionality
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Accessibility** - WCAG 2.1 AA compliant with screen reader support

## Prerequisites

Before setting up this project, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **Git** - [Download Git](https://git-scm.com/)

To verify your installations:
```bash
node --version  # Should output v18.x.x or higher
npm --version   # Should output 9.x.x or higher
git --version   # Should output git version x.x.x
```

## Installation

### 1. Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/yourusername/prompt-database.git

# Or using SSH
git clone git@github.com:yourusername/prompt-database.git

# Navigate to the project directory
cd prompt-database/prompt-database
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Dexie.js (IndexedDB wrapper)

**Note:** Do not run the suggested line that includes the 'audit fix --force' because all of the vulnerabilities are in the development of the application and will not impact how it runs.

### 3. Verify Installation

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests (optional)
npm test
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the development server. Open your browser and navigate to:
- **Local**: http://localhost:5173
- **Network**: http://[your-ip]:5173 (for testing on other devices)

The application will automatically reload when you make changes to the code.

### Production Build

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment.

## Project Structure

```
prompt-database/
├── src/
│   ├── components/       # React components
│   │   ├── CustomFieldsApp.tsx  # Main application component
│   │   ├── PromptForm.tsx       # Form for creating/editing prompts
│   │   ├── PromptList.tsx       # List view of prompts
│   │   └── ...
│   ├── store/            # Zustand state management
│   │   └── promptStore.ts       # Main application store
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── cypress/              # E2E tests
├── package.json          # Project dependencies
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── eslint.config.js      # ESLint configuration
```

## Available Scripts

```bash
# Development
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build

# Code Quality
npm run lint        # Run ESLint
npm run typecheck   # Run TypeScript type checking
npm test            # Run unit tests

# Testing
npm run cypress:open    # Open Cypress test runner
npm run cypress:run     # Run Cypress tests headlessly
```

## Environment Setup

### VS Code (Recommended)

If using VS Code, install these recommended extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

### Browser Requirements

The application supports:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Chrome and Safari

## Deployment

### Option 1: Static Hosting (Netlify/Vercel)

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist/` folder to your hosting service

### Option 2: Docker

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

Build and run:
```bash
docker build -t prompt-database .
docker run -p 80:80 prompt-database
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
If port 5173 is already in use:
```bash
# Kill the process using the port
npx kill-port 5173

# Or run on a different port
npm run dev -- --port 3000
```

#### 2. Dependencies Installation Fails
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript Errors
```bash
# Check TypeScript version
npx tsc --version

# Run type checking
npm run typecheck

# If errors persist, restart TS server in VS Code
# Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

#### 4. IndexedDB Storage Issues
- Clear browser data: Settings → Privacy → Clear browsing data
- Check storage quota: DevTools → Application → Storage

#### 5. Build Failures
```bash
# Clean build cache
rm -rf dist node_modules/.vite

# Reinstall and rebuild
npm ci
npm run build
```

### Development Tips

1. **Browser DevTools**: Use React Developer Tools extension for debugging
2. **State Management**: Check Zustand state in DevTools console: `window.store.getState()`
3. **IndexedDB**: View stored data in DevTools → Application → IndexedDB
4. **Performance**: Use Lighthouse in DevTools for performance audits

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Data Privacy

This application stores all data locally in your browser using IndexedDB. No data is sent to external servers. Your prompts remain private and under your control.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the CLAUDE.md file for development guidance

## Acknowledgments

- Built with React and TypeScript
- Styled with Tailwind CSS
- State management by Zustand
- Local storage powered by Dexie.js