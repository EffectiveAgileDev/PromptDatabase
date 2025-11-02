# TDD Lesson Learned: Strict Test-First Principle

## The Mistake

When the test `should render all available seed packs` failed with:
```
Found multiple elements with the text: /Development/i
```

I immediately changed the test from:
```typescript
expect(screen.getByText('Development')).toBeInTheDocument()
```

To:
```typescript
expect(screen.getByLabelText(/Development/i)).toBeInTheDocument()
```

**This was wrong.**

## The Core Principle I Violated

**In strict Test-Driven Development:**
- ✅ Tests define the contract/specification
- ✅ If a test fails, the implementation is wrong
- ❌ **NEVER modify the test to make it pass** (unless the test itself is fundamentally flawed)

## What Should Have Happened

1. **Accept the test failure** - The test was correct
2. **Analyze the failure** - Why are there multiple matches?
3. **Fix the implementation** - Remove duplication in the component
4. **Verify the test passes** - With correct implementation

## The Root Cause

The component was rendering "Development" twice:
1. As `aria-label={pack.name}` on the checkbox
2. As visible text in the label

This violated the DRY principle and created the test failure.

## The Proper Fix

**Implementation change:**
```typescript
// BEFORE (Wrong - duplicate text)
<input
  type="checkbox"
  aria-label={pack.name}  // ← Redundant
/>
<div className="font-semibold text-gray-900">{pack.name}</div>

// AFTER (Correct - single source)
<input
  type="checkbox"
  // Removed aria-label - let label element provide accessible name
/>
<div className="font-semibold text-gray-900">{pack.name}</div>
```

**Test stays the same:**
```typescript
expect(screen.getByText('Development')).toBeInTheDocument()
```

## Benefits of Proper TDD

✅ **Tests remain stable** - They don't change with implementation details
✅ **Better code** - Semantic HTML > aria-label duplication
✅ **Accessibility** - Using proper HTML structures
✅ **Maintainability** - Clear contract between test and implementation
✅ **Confidence** - Tests genuinely verify the code works

## Commit Details

```
42fdc26 - Refactor(SeedPackSelector): fix implementation following strict TDD
```

**Changes:**
- Removed `aria-label={pack.name}` from checkbox
- Rely on semantic `<label>` element for accessibility
- Test reverted to original `getByText` pattern
- All 14 tests passing ✅

## Key Takeaway

**The test is the specification. Never bend the specification to fit the implementation. Instead, fix the implementation to meet the specification.**

This is the heart of Test-Driven Development.
