# Empty State Guide

## Overview

This guide explains how to reset the Prompt Database to an empty state to experience the first-time user onboarding flow with seed data selection.

---

## Why Reset to Empty State?

- ✅ See the beautiful Welcome screen
- ✅ Test the "Load Seed Prompts" feature
- ✅ Choose which seed data packs to load
- ✅ Experience first-time user setup flow
- ✅ Start fresh for testing

---

## Method 1: Clear Browser Storage (Easiest)

### Step 1: Open DevTools
Press **F12** on your keyboard

### Step 2: Navigate to Local Storage
- **Chrome/Edge/Firefox**: Application tab → Local Storage
- **Safari**: Storage tab → Local Storage

### Step 3: Find Your Site
- Look for **http://localhost:5173** (dev)
- Or your deployed domain

### Step 4: Delete Storage Key
- Find the key: **`prompt-storage`**
- Right-click and select **Delete**
- Or click the **X** button

### Step 5: Refresh
- Press **F5** or **Ctrl+R** to refresh
- Welcome screen should appear! 🎉

---

## Method 2: Console Command (Fastest)

1. Open DevTools: **F12**
2. Go to **Console** tab
3. Copy and paste:
```javascript
localStorage.removeItem('prompt-storage');
location.reload();
```
4. Press **Enter**

Done! ✅

---

## Method 3: Import Empty State File

We've provided an empty state JSON file for reference:

**File**: `public/empty-state.json`

**Contents**:
```json
{
  "prompts": [],
  "customFields": [],
  "categories": [],
  "selectedPromptId": null
}
```

This file shows the exact structure of an empty database state.

---

## What You'll See After Reset

### Welcome Screen
The Welcome screen will appear with:

1. **Header**: Welcome to Prompt Database
2. **Features Overview**: Smart Search, Custom Fields, Quick Copy
3. **Load Seed Prompts Section** ⭐ NEW
   - Select from 3 seed pack options:
     - Development (6 prompts)
     - Writing (6 prompts)
     - Analysis (6 prompts)
   - "Load All" button - select all packs at once
   - "Skip" button - skip seed data setup
   - "Continue with Selected Packs" button - load chosen seeds

4. **Sample Templates**: 3 example prompts to start with
5. **Pro Tips**: Getting started advice

---

## Testing the Seed Data Flow

### Test Scenario 1: Load All Seeds
1. Reset to empty state
2. Click "Load All" button
3. Click "Continue with Selected Packs"
4. Wait for loading (⏳ spinner)
5. **Expected**: 18 prompts loaded (6 from each pack), Welcome disappears

### Test Scenario 2: Load Single Pack
1. Reset to empty state
2. Click Development checkbox (1 pack selected)
3. Click "Continue with Selected Packs"
4. **Expected**: 6 prompts loaded, Welcome disappears

### Test Scenario 3: Skip Setup
1. Reset to empty state
2. Click "Skip Setup" button
3. **Expected**: Empty database, Welcome disappears

### Test Scenario 4: Use Template
1. Reset to empty state
2. Click "Use This Template" on any template
3. **Expected**: 1 prompt loaded, Welcome disappears

---

## Stored Data Structure

When you load seed data, this is stored in `prompt-storage`:

```json
{
  "prompts": [
    {
      "id": "unique-id",
      "title": "Code Review Assistant",
      "promptText": "...",
      "category": "Development",
      "tags": "code-review, development",
      "expectedOutput": "...",
      "notes": "...",
      "createdAt": "2024-01-01T...",
      "updatedAt": "2024-01-01T..."
    }
    // ... more prompts
  ],
  "categories": [
    {
      "id": "cat-id",
      "name": "Development",
      "color": "#3B82F6",
      "description": "Programming, coding..."
    }
    // ... more categories
  ],
  "customFields": [],
  "selectedPromptId": null
}
```

---

## Troubleshooting

### Problem: Welcome screen doesn't appear after reset
**Solution**:
1. Make sure you deleted the correct storage key: `prompt-storage`
2. Try hard refresh: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
3. Check DevTools → Application → Cache Storage and clear if needed

### Problem: Seed data doesn't load
**Solution**:
1. Check browser console (F12) for errors
2. Make sure all 3 checkboxes are visible
3. Try selecting just one pack instead of all

### Problem: Prompts saved but storage says empty
**Solution**:
1. Storage is persisted - it should remain even after refresh
2. If lost, check if using Private/Incognito mode (doesn't persist storage)

---

## See Also

- **Seed Data Documentation**: `PHASE_3_COMPLETION_REPORT.md`
- **Development Setup**: `README.md`
- **Testing Guide**: Run `npm test` to see all tests including seed data tests

---

## Summary

To experience the full first-time user onboarding with seed data:

1. **Reset Storage**: Use Method 1 or 2 above
2. **Refresh Browser**: F5
3. **See Welcome Screen**: Beautiful seed data selection interface
4. **Choose Your Seeds**: Select from Development, Writing, Analysis packs
5. **Load Data**: Click "Continue" to populate your database
6. **Start Using**: Welcome closes, main app displays your new prompts!

Enjoy! 🚀
