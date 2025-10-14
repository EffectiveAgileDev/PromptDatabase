# Prompt Database Application

A browser-based personal prompt management system for AI practitioners to organize, search, and reuse their prompts efficiently.

## Features

- **Complete CRUD Operations** - Create, read, update, and delete prompts
- **Prompt & Project Types** - Manage both individual prompts and multi-step project instructions
- **Dynamic Custom Fields** - Extend the database schema with custom fields
- **Advanced Search & Sort** - Search across any field with intelligent matching
- **Master-Detail Interface** - Split-view with paginated prompt list
- **Local Storage** - All data stored locally using IndexedDB
- **Dark Mode** - System-aware theme with manual toggle
- **Copy to Clipboard** - Quick action that updates "Last Used" timestamp
- **Import/Export** - CSV import/export functionality with smart field mapping
- **Auto-Save** - Changes are automatically saved as you type (1-second debounce)
- **Keyboard Shortcuts** - Efficient navigation and actions with hotkeys
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
git clone https://github.com/EffectiveAgileDev/PromptDatabase.git

# Or using SSH
git clone git@github.com:EffectiveAgileDev/PromptDatabase.git

# Navigate to the project directory
cd PromptDatabase/prompt-database
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

**Note:** Do not run the suggested line that includes 'audit fix --force' because all of the vulnerabilities are in the development dependencies and will not impact how the application runs in production.

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

## How to Build a Prompt or Project with Prompt Database

### Creating Your First Prompt

1. **Click "Create Your First Prompt"** or use the **+ New Prompt** button
2. **Choose Type:**
   - **🔤 Prompt** - For single AI prompts (e.g., "Code Review Assistant")
   - **📋 Project** - For multi-step project instructions with detailed guidance
3. **Fill in the details:**
   - **Title** * (required) - Use a descriptive, unique title for easy searching
   - **Prompt Text** - Your actual prompt content (4000 character limit)
   - **Category** * (required) - Choose from existing categories or create new ones
   - **Tags** - Comma-separated tags for filtering (e.g., "code-review, development, quality")
   - **Expected Output** - Describe what results you expect from the AI
   - **Instructions** * (required for Projects) - Detailed step-by-step project guidance
   - **Notes** - Internal notes about when/how to use this prompt
4. **Add Custom Fields** (optional) - Click "⚙️ Manage Fields" to add custom metadata like Priority, Use Case, etc.
5. **Save** - Click "Create" or press **Ctrl+S**

### Pro Tips

- **Use descriptive titles** to make prompts easy to find later
- **Add tags** for quick categorization and filtering
- **Include expected output** to remember what results you're looking for
- **Use notes** to document when and how to use each prompt effectively
- **Enable "Include Expected Output when copying"** (recommended) - This appends your expected output format when copying prompts to help guide AI responses
- **Auto-save** - For existing prompts, changes auto-save after 1 second of inactivity

### Working with Prompts

- **Search** - Use the search bar to find prompts by title, content, category, tags, or custom fields
- **Sort** - Sort by Last Modified, Created Date, Title, Category, Last Used, or custom fields
- **Copy** - Click the "Copy" button to copy prompt text to clipboard (updates Last Used timestamp)
- **Edit** - Click any prompt in the list to edit it
- **Delete** - Click "Delete" while editing a prompt (or press Delete key)
- **Navigate** - Use ↑/↓ arrow keys to move between prompts

### Keyboard Shortcuts

- **Ctrl + N** - Create new prompt
- **Ctrl + S** - Save current prompt
- **Ctrl + F** or **/** - Focus search
- **Ctrl + C** - Copy prompt text
- **↑ / ↓** - Navigate prompts
- **Delete** - Delete selected prompt
- **?** - Show keyboard shortcuts help

### Organizing Your Prompts

1. **Categories** - Click "📁 Categories" to:
   - View all categories and prompt counts
   - Rename or delete categories
   - Bulk reassign prompts to different categories

2. **Custom Fields** - Click "⚙️ Manage Fields" to:
   - Add text, textarea, number, or select fields
   - Make fields required or optional
   - Add dropdown options for select fields

3. **Import/Export** - Click "📊 Import/Export" to:
   - Export all prompts as CSV
   - Import prompts from CSV with smart field mapping
   - Choose to replace or merge with existing data

## Project Structure

```
prompt-database/
├── src/
│   ├── components/       # React components
│   │   ├── CustomFieldsApp.tsx  # Main application component
│   │   ├── Welcome.tsx          # Welcome screen with templates
│   │   ├── FieldManager.tsx     # Custom field management
│   │   ├── CategoryManager.tsx  # Category management
│   │   ├── ImportExport.tsx     # CSV import/export
│   │   └── ...
│   ├── store/            # Zustand state management
│   │   └── promptStore.ts       # Main application store
│   ├── hooks/            # Custom React hooks
│   │   ├── useAutoSave.ts       # Auto-save functionality
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useToast.ts
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   │   └── performance.ts       # Web Vitals monitoring
│   ├── lib/              # Core libraries
│   │   ├── database.ts          # Dexie IndexedDB setup
│   │   └── storage.ts           # Storage service
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── dist/                 # Production build output
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

The `dist/` folder contains your built application ready for deployment. Choose from these deployment options:

### Option 1: Netlify (Recommended - Free)

**Via Netlify CLI:**
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --dir=dist --prod
```

**Via Netlify Web UI:**
1. Go to [netlify.com](https://netlify.com) and sign up
2. Click "Add new site" → "Deploy manually"
3. Drag and drop your `dist/` folder
4. Your site will be live at `https://[your-site-name].netlify.app`

**Via GitHub Integration:**
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Netlify will auto-deploy on every push

### Option 2: Vercel (Fast & Free)

**Via Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (from prompt-database directory)
npm run build
vercel --prod
```

**Via Vercel Web UI:**
1. Go to [vercel.com](https://vercel.com) and sign up
2. Import your GitHub repository
3. Vercel will auto-detect Vite settings
4. Click "Deploy"

**Via Vercel GitHub Integration:**
1. Connect your GitHub repository
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

### Option 3: GitHub Pages (Free for Public Repos)

**Setup:**
```bash
# Install gh-pages package
npm install -D gh-pages

# Add to package.json scripts:
"deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npm run deploy
```

**Configure GitHub Pages:**
1. Go to your repository settings
2. Navigate to Pages
3. Source: Deploy from branch `gh-pages`
4. Your site will be at `https://[username].github.io/[repo-name]`

### Option 4: Static File Hosting

Simply upload the contents of the `dist/` folder to any static file hosting:
- **AWS S3** + CloudFront
- **Google Cloud Storage**
- **Azure Static Web Apps**
- **DigitalOcean App Platform**
- **Cloudflare Pages**

### Option 5: Docker + Nginx (Self-Hosted)

**Create Dockerfile:**
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
CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**
```bash
docker build -t prompt-database .
docker run -p 80:80 prompt-database
# Access at http://localhost
```

### Option 6: Local Web Server (Testing)

**Using Python:**
```bash
cd dist
python3 -m http.server 8080
# Visit http://localhost:8080
```

**Using Node http-server:**
```bash
npx http-server dist -p 8080
# Visit http://localhost:8080
```

**Using Vite preview:**
```bash
npm run preview
# Visit http://localhost:4173
```

### Deployment Checklist

- ✅ Run `npm run build` to create production build
- ✅ Test the production build locally with `npm run preview`
- ✅ Verify all features work in production mode
- ✅ Check browser console for errors
- ✅ Test on mobile devices if needed
- ✅ Configure custom domain (optional)
- ✅ Enable HTTPS (automatic on Netlify/Vercel)

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

#### 4. Build Errors
```bash
# Clean build cache
rm -rf dist node_modules/.vite

# Reinstall and rebuild
npm ci
npm run build
```

#### 5. IndexedDB Storage Issues
- Clear browser data: Settings → Privacy → Clear browsing data
- Check storage quota: DevTools → Application → Storage
- Verify IndexedDB support: Check DevTools → Application → IndexedDB

### Development Tips

1. **Browser DevTools**: Use React Developer Tools extension for debugging
2. **State Management**: Check Zustand state in DevTools console
3. **IndexedDB**: View stored data in DevTools → Application → IndexedDB → PromptDatabase
4. **Performance**: Use Lighthouse in DevTools for performance audits
5. **Dark Mode**: Toggle with the 🌙/☀️ button or use system preference

## Performance

The application is optimized for performance:
- **Web Vitals Monitoring** - Tracks Core Web Vitals (INP, FCP, LCP, CLS, TTFB)
- **Auto-save Debouncing** - 1-second delay to prevent excessive writes
- **Pagination** - 10 items per page for efficient rendering
- **IndexedDB** - Fast local storage for 1000+ prompts
- **Production Bundle** - ~314 KB JS (95 KB gzipped), ~32 KB CSS (6 KB gzipped)

## Data Privacy

This application stores all data locally in your browser using IndexedDB. No data is sent to external servers. Your prompts remain private and under your control.

**Backup Recommendations:**
- Export your prompts regularly using the "📊 Import/Export" feature
- Store exports in a secure location (cloud storage, external drive)
- Import data to restore if browser data is cleared

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/EffectiveAgileDev/PromptDatabase/issues)
- Check existing issues for solutions
- Review the CLAUDE.md file for development guidance

## Acknowledgments

- Built with React 18 and TypeScript
- Styled with Tailwind CSS
- State management by Zustand
- Local storage powered by Dexie.js
- Performance monitoring with web-vitals
- UI components from HeadlessUI
