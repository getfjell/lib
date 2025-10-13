# Key Validation Across All Operations

## Overview

Key validation is now consistently applied across **all operations** that accept item keys in `@fjell/lib` and `@fjell/lib-firestore`. This ensures that incorrect key usage is caught immediately with clear, helpful error messages.

## Operations with Key Validation

The following operations now validate keys before execution:

### Single-Item Operations
1. **`get(key)`** - Retrieve an item by its key
2. **`update(key, item)`** - Update an item
3. **`remove(key)`** - Remove an item
4. **`upsert(key, properties)`** - Create or update an item
5. **`action(key, actionKey, params)`** - Execute an action on an item
6. **`facet(key, facetKey, params)`** - Get a facet view of an item

## Validation Rules

For each operation, the validation checks:

### 1. Key Type Validation
- **Primary Libraries** (kta length = 1): Must receive `PriKey<S>`
- **Composite Libraries** (kta length > 1): Must receive `ComKey<S, L1, L2, L3, L4, L5>`

### 2. Key Structure Validation
- Key must be a valid object with required properties
- Cannot be a string, number, null, or undefined
- Cannot be a partial or malformed key object

### 3. Location Key Array Order Validation (Composite Keys Only)
- `loc` array length must match `kta.length - 1`
- Each `loc[i].kt` must match `kta[i+1]`
- No missing or extra location keys
- Correct hierarchy order

## Implementation

All validation is performed by the shared `validateKey()` utility:

```typescript
// src/validation/KeyValidator.ts
export const validateKey = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  operation: string
): void
```

This utility is called at the beginning of each operation wrapper before any business logic executes.

## Error Messages

### Example 1: Wrong Key Type for Composite Library

**Scenario:** Calling `remove()` on a composite library with a `PriKey`

```typescript
// Wrong: annotations is a composite library
await annotationsLib.operations.remove({
  kt: 'annotations',
  pk: 'anno-123'
});
```

**Error:**
```
Invalid key type for remove operation.
Expected: ComKey with format: { kt: 'annotations', pk: string|number, loc: [{ kt: 'documents', lk: string|number }] }
Received: PriKey: annotations:anno-123

This is a composite item library. You must provide both the parent key and location keys.

Example correct usage:
  library.operations.remove({ kt: 'annotations', pk: 'parent-id', loc: [{ kt: 'documents', lk: 'child-id' }] })
```

### Example 2: Location Key Order Mismatch

**Scenario:** Calling `update()` with reversed location keys

```typescript
// Wrong: location keys in wrong order
await commentsLib.operations.update({
  kt: 'comments',
  pk: 'comment-1',
  loc: [
    { kt: 'annotations', lk: 'anno-1' },  // Should be documents
    { kt: 'documents', lk: 'doc-1' }       // Should be annotations
  ]
}, { content: 'Updated' });
```

**Error:**
```
Location key array order mismatch for update operation.

Expected location key order for 'comments':
  [0] { kt: 'documents', lk: <value> }
  [1] { kt: 'annotations', lk: <value> }

Received location key order:
  [0] { kt: 'annotations', lk: "anno-1" }
  [1] { kt: 'documents', lk: "doc-1" }

Issues found:
  • Position 0: Expected 'documents' but got 'annotations'
  • Position 1: Expected 'annotations' but got 'documents'

Understanding the hierarchy:
  The key type array ['comments', 'documents', 'annotations'] defines the containment hierarchy.
  - 'comments' is the primary item type
  - 'comments' items are contained in 'documents'
  - 'documents' items are contained in 'annotations'

Correct example:
  library.operations.update({
    kt: 'comments',
    pk: 'item-id',
    loc: [
      { kt: 'documents', lk: 'parent-id' },
      { kt: 'annotations', lk: 'parent-id' }
    ]
  })
```

### Example 3: Wrong Key Type for Primary Library

**Scenario:** Calling `action()` on a primary library with a `ComKey`

```typescript
// Wrong: documents is a primary library
await documentsLib.operations.action({
  kt: 'documents',
  pk: 'doc-123',
  loc: [{ kt: 'sections', lk: 'section-1' }]
}, 'publish', {});
```

**Error:**
```
Invalid key type for action operation.
Expected: PriKey with format: { kt: 'documents', pk: string|number }
Received: ComKey: documents:doc-123:sections:section-1

This is a primary item library. You should provide just the primary key.

Example correct usage:
  library.operations.action({ kt: 'documents', pk: 'item-id' })
```

## Benefits

### 1. Consistency
All key-accepting operations validate in the same way with the same error messages.

### 2. Early Detection
Errors are caught immediately, before any database operations or side effects occur.

### 3. Clear Guidance
Error messages explain exactly what's wrong and show how to fix it.

### 4. Developer Experience
- Saves hours of debugging time
- Makes the library easier to learn and use
- Prevents subtle bugs from reaching production

### 5. Maintainability
- Single source of truth for validation logic
- Easy to update and enhance validation rules
- Consistent behavior across all operations

## Code Example: Shared Validation

All operations use the same validation utility:

```typescript
// In get.ts
const get = async (key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>): Promise<V> => {
  validateKey(key, coordinate, 'get');
  const item = await toWrap.get(key);
  return item;
}

// In update.ts
const update = async (
  key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
  item: Partial<Item<S, L1, L2, L3, L4, L5>>
): Promise<V> => {
  validateKey(key, coordinate, 'update');
  // ... rest of update logic
}

// In remove.ts
const remove = async (key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>): Promise<V> => {
  validateKey(key, coordinate, 'remove');
  // ... rest of remove logic
}

// And so on for upsert, action, facet...
```

## Performance Impact

- Validation adds minimal overhead (microseconds)
- All checks are synchronous and in-memory
- No database calls or external dependencies
- Validation fails fast on first error

## Testing

All operations with key validation are covered by comprehensive tests:

```bash
✓ tests/key-type-safety.test.ts (16 tests) 6ms
  ✓ 4 tests for primary item library validation
  ✓ 3 tests for composite item library validation
  ✓ 2 tests for general error message quality
  ✓ 7 tests for location key order validation
```

The `KeyValidator.ts` utility has **100% code coverage**.

## Migration Notes

### No Breaking Changes

This update is **backward compatible**. Code using correct key types will continue to work without any changes.

### What Changes

The only change is that **incorrect key usage** now fails with clear, helpful error messages instead of:
- Cryptic "not found" errors
- Database-level errors
- Unexpected behavior

### If You See New Errors

If you suddenly see `InvalidKeyTypeError` or `LocationKeyOrderError` after updating:
1. Read the error message carefully - it explains exactly what's wrong
2. Follow the "Example correct usage" shown in the error
3. Fix the key to match the expected format

These errors indicate bugs that were always present but silent before.

## Files Updated

### Core Validation
- `src/validation/KeyValidator.ts` (new) - Shared validation utility

### Operations Updated
- `src/ops/get.ts` - Uses shared validator
- `src/ops/update.ts` - Added validation
- `src/ops/remove.ts` - Added validation
- `src/ops/upsert.ts` - Added validation
- `src/ops/action.ts` - Added validation
- `src/ops/facet.ts` - Added validation

### Infrastructure
- `src/Operations.ts` - Updated to pass coordinate to all operations
- `src/errors.ts` - Contains error classes (no changes needed)

## Future Enhancements

Potential future improvements:
1. Apply validation to collection operations (`all`, `find`, etc.)
2. Validate keys in `create()` options
3. Add validation for finder parameters
4. Consider TypeScript template literal types for compile-time validation

