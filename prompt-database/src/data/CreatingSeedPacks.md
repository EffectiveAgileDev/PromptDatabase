# Creating Seed Packs

## What is a Seed Pack?

A seed pack is a collection of pre-made prompts organized by category. Currently, we have 3 seed packs:
- **Development** (6 prompts for coding tasks)
- **Writing** (6 prompts for writing tasks)
- **Analysis** (6 prompts for analysis tasks)

---

## Options for Creating Seed Packs

### Option 1: Add to Existing Seed Pack (Easiest)

Add more prompts to an existing pack:

**File**: `src/data/development.ts`

```typescript
export const developmentPrompts = [
  {
    title: "Code Review Assistant",
    promptText: "Please review the following code...",
    category: "Development",
    tags: "code-review, development",
    expectedOutput: "Detailed analysis...",
    notes: "Great for reviewing PRs..."
  },
  // ADD NEW PROMPTS HERE:
  {
    title: "Your New Prompt Title",
    promptText: "Your prompt text...",
    category: "Development",
    tags: "tag1, tag2",
    expectedOutput: "Expected output description",
    notes: "Notes about this prompt"
  }
];
```

**Steps**:
1. Open `src/data/development.ts` (or writing.ts, analysis.ts)
2. Add a new object to the array
3. Fill in: title, promptText, category, tags, expectedOutput, notes

---

### Option 2: Create New Seed Pack (More Work)

Create an entirely new seed pack category:

**Steps**:
1. Create new file: `src/data/marketing.ts`
2. Define prompts array
3. Export it
4. Add to `src/data/seedData.ts`
5. Update loader functions
6. Update UI selector

**Example structure**:

`src/data/marketing.ts`:
```typescript
export const marketingPrompts = [
  {
    title: "Campaign Brainstormer",
    promptText: "Help me brainstorm marketing campaign ideas for...",
    category: "Marketing",
    tags: "marketing, campaign, brainstorm",
    expectedOutput: "List of 5-10 campaign ideas with descriptions",
    notes: "Use for generating creative marketing campaigns"
  },
  // More prompts...
];
```

---

### Option 3: Modify Existing Pack Categories

Change which categories are available:

**File**: `src/data/categories.ts`

```typescript
export const seedCategories = [
  { 
    name: "Development", 
    color: "#3B82F6", 
    description: "Programming, coding, and development tasks" 
  },
  // ADD OR MODIFY HERE
];
```

---

## Required Changes for New Pack

If you create a **new seed pack**, you need to update:

1. **Create prompt file**: `src/data/yourpack.ts`
2. **Export in seedData.ts**:
   ```typescript
   export { yourPackPrompts } from './yourpack';
   ```
3. **Update seedLoader.ts** - Add type and loading logic
4. **Update SeedPackSelector.tsx** - Add to SEED_PACK_INFO
5. **Update tests** - Add tests for new pack

---

## Structure of a Prompt

Each prompt object must have:

```typescript
{
  title: string;              // Short title (e.g., "Code Review Assistant")
  promptText: string;         // Full prompt text
  category: string;           // Must match a category
  tags: string;              // Comma-separated tags
  expectedOutput: string;    // What the user can expect
  notes: string;            // Help text for the user
}
```
