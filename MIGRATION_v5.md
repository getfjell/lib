# Migration Guide: v4.x to v5.0

## Overview

Version 5.0 centralizes the Operations interface in `@fjell/core`. This is a breaking change in terms of dependencies, but the API remains backward compatible for most use cases.

## Breaking Changes

### Dependency Updates

You must install the latest `@fjell/core`:

```bash
npm install @fjell/core@latest @fjell/lib@latest
```

### Type Imports

If you were importing operation method types, update imports:

```typescript
// Before
import { FinderMethod, ActionMethod } from '@fjell/lib';

// After
import { FinderMethod, ActionMethod } from '@fjell/core';
// Or still from lib (re-exported)
import { FinderMethod, ActionMethod } from '@fjell/lib';
```

### Return Type Changes

Some operation methods now explicitly return nullable types for consistency with core:

```typescript
// get() now returns V | null instead of V
const user = await operations.get(key);
if (user) {
  // Type guard required
}

// findOne() now returns V | null instead of V
const user = await operations.findOne('byEmail', { email: 'test@example.com' });
if (user) {
  // Type guard required
}

// remove() now returns V | void instead of V
const removed = await operations.remove(key);
if (removed) {
  // May be void
}
```

Note: In practice, the lib implementations may throw errors instead of returning null, but the type signatures now allow for null returns to be compatible with the core interface.

## What Stays The Same

- All operation methods work identically
- Hook system unchanged
- Validation unchanged
- Options interface unchanged
- Library creation and usage unchanged

## Benefits

- Consistent Operations interface across all fjell packages
- Better type inference
- Centralized validation logic
- Smaller bundle size (shared types)

## Migration Steps

### Step 1: Update Dependencies

```bash
npm install @fjell/core@latest @fjell/lib@latest @fjell/registry@latest
```

### Step 2: Update Type Imports (Optional)

If you're importing types, you can optionally update to import from core:

```typescript
// These still work (re-exported from lib)
import { 
  Operations, 
  OperationParams, 
  AffectedKeys,
  FinderMethod,
  ActionMethod
} from '@fjell/lib';

// Or import from core directly
import { 
  Operations, 
  OperationParams, 
  AffectedKeys,
  FinderMethod,
  ActionMethod
} from '@fjell/core';
```

### Step 3: Add Type Guards (If Needed)

If your code assumed get() or findOne() would always return a value (never null), add type guards:

```typescript
// Before (v4.x)
const user = await operations.get(key);
console.log(user.name); // Assumed user exists

// After (v5.0)
const user = await operations.get(key);
if (!user) {
  throw new Error('User not found');
}
console.log(user.name);
```

### Step 4: Test

Run your test suite to ensure everything works:

```bash
npm test
```

## Common Issues

### Issue: Type errors on get() or findOne()

**Problem:** TypeScript complains about accessing properties on possibly null values.

**Solution:** Add type guards:

```typescript
const item = await operations.get(key);
if (!item) {
  throw new Error('Item not found');
}
// Now safe to use item
```

### Issue: Import errors for types

**Problem:** Cannot find type imports.

**Solution:** Make sure @fjell/core is installed and up to date:

```bash
npm install @fjell/core@latest
```

## Need Help?

- Check the [examples](./examples/) directory for updated examples
- Review the [API documentation](https://getfjell.github.io/lib)
- File an issue on [GitHub](https://github.com/getfjell/lib/issues)

