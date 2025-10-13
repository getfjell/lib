# Type Safety Improvements for get() Methods

## Overview

This document describes the type safety and error handling improvements made to the `get()` methods in `@fjell/lib` and `@fjell/lib-firestore` to prevent incorrect key usage and provide clear, actionable error messages.

## Problem Statement

Previously, when calling `get()` on a composite item library with an incorrect key type (e.g., passing a `PriKey` instead of a `ComKey`), the error message was:

```
Item not found for key - annotations:xxx
```

This error was misleading because:
1. It suggested the item didn't exist
2. It didn't indicate the key type was wrong
3. It required hours of debugging to discover the root cause

## Solutions Implemented

### 1. Compile-Time Type Safety (Preferred)

**Location:** `/Users/tobrien/gitw/getfjell/lib/src/contained/Operations.ts`

The `get()` method signature in the contained (composite) Operations interface now enforces `ComKey` only:

```typescript
// Before (accepted both)
get(key: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>): Promise<V>;

// After (ComKey only for composite libraries)
get(key: ComKey<S, L1, L2, L3, L4, L5>): Promise<V>;
```

For primary item libraries, the signature remains:
```typescript
get(key: PriKey<S>): Promise<V>;
```

**Benefits:**
- TypeScript will now show a compile-time error if you pass the wrong key type
- IDEs will provide proper auto-completion
- Catches errors before runtime

### 2. Runtime Validation with Clear Errors

**Locations:**
- `/Users/tobrien/gitw/getfjell/lib/src/ops/get.ts`
- `/Users/tobrien/gitw/getfjell/lib-firestore/src/ops/get.ts`

Added runtime validation that checks if the key type matches the library type:

```typescript
const isCompositeLibrary = coordinate.kta.length > 1;
const keyIsComposite = isComKey(key);

if (isCompositeLibrary && !keyIsComposite) {
  throw new InvalidKeyTypeError('get', coordinate, key, true);
}

if (!isCompositeLibrary && keyIsComposite) {
  throw new InvalidKeyTypeError('get', coordinate, key, false);
}
```

**Benefits:**
- Catches errors immediately at runtime
- Provides detailed, helpful error messages
- Works even if TypeScript checks are bypassed

### 3. Enhanced Error Messages

**Location:** `/Users/tobrien/gitw/getfjell/lib/src/errors.ts`

Created a new `InvalidKeyTypeError` class that provides comprehensive error information:

```typescript
export class InvalidKeyTypeError<...> extends LibError<...> {
  constructor(
    operation: string,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    key: any,
    expectedIsComposite: boolean,
    options?: { cause?: Error }
  ) {
    // Generates a detailed error message including:
    // - What was expected
    // - What was received
    // - Why it's wrong
    // - Example of correct usage
  }
}
```

### 4. Improved NotFoundError Messages

When an item genuinely isn't found, the error message now includes helpful context:

```
Item not found for key: annotations:parent-id:documents:child-id

Note: If you believe this item should exist, verify:
1. The key values are correct: annotations:parent-id:documents:child-id
2. The item was created in the expected location
3. This is a composite item library - keys should have both parent and location components

Expected key type: ComKey
```

## Location Key Array Ordering

### Understanding the Hierarchy

When working with composite keys, the `loc` array must match the hierarchy defined by the library's key type array (`kta`).

**Example:**
If a library has `kta = ['comments', 'documents', 'annotations']`:
- `'comments'` is the primary item type (position 0)
- `'documents'` is at position 1 in the hierarchy
- `'annotations'` is at position 2 in the hierarchy

This means:
- Comments are contained in Documents
- Documents are contained in Annotations

**The `loc` array must follow this order:**
```typescript
{
  kt: 'comments',
  pk: 'comment-id',
  loc: [
    { kt: 'documents', lk: 'doc-id' },      // First parent level
    { kt: 'annotations', lk: 'anno-id' }    // Second parent level
  ]
}
```

### Validation Rules

The library now validates:
1. **Array length**: The `loc` array length must equal `kta.length - 1`
2. **Key type order**: Each `loc[i].kt` must match `kta[i+1]`
3. **No missing keys**: All parent levels must be present
4. **No extra keys**: No additional location keys beyond what's defined

## Example Error Messages

### Scenario 1: Wrong Key Type for Composite Library

**Code:**
```typescript
// Incorrect - passing a PriKey to a composite library
const annotation = await annotationLib.operations.get({
  kt: 'annotations',
  pk: 'xxx'
});
```

**New Error Message:**
```
Invalid key type for get operation.
Expected: ComKey with format: { kt: 'annotations', pk: string|number, loc: [{ kt: 'documents', lk: string|number }] }
Received: PriKey: annotations:xxx

This is a composite item library. You must provide both the parent key and location keys.

Example correct usage:
  library.operations.get({ kt: 'annotations', pk: 'parent-id', loc: [{ kt: 'documents', lk: 'child-id' }] })
```

### Scenario 2: Wrong Key Type for Primary Library

**Code:**
```typescript
// Incorrect - passing a ComKey to a primary library
const document = await documentLib.operations.get({
  kt: 'documents',
  pk: 'doc-1',
  loc: [{ kt: 'sections', lk: 'section-1' }]
});
```

**New Error Message:**
```
Invalid key type for get operation.
Expected: PriKey with format: { kt: 'documents', pk: string|number }
Received: ComKey: documents:doc-1:sections:section-1

This is a primary item library. You should provide just the primary key.

Example correct usage:
  library.operations.get({ kt: 'documents', pk: 'item-id' })
```

### Scenario 3: Invalid Key Format

**Code:**
```typescript
// Incorrect - passing a string instead of a key object
const document = await documentLib.operations.get('doc-1');
```

**New Error Message:**
```
Invalid key type for get operation.
Expected: PriKey with format: { kt: 'documents', pk: string|number }
Received: a string value: "doc-1"

This is a primary item library. You should provide just the primary key.

Example correct usage:
  library.operations.get({ kt: 'documents', pk: 'item-id' })
```

### Scenario 4: Location Key Array Order Mismatch

**Code:**
```typescript
// Incorrect - location keys in wrong order
// For a library with kta = ['comments', 'documents', 'annotations']
const comment = await commentLib.operations.get({
  kt: 'comments',
  pk: 'comment-1',
  loc: [
    { kt: 'annotations', lk: 'anno-1' },  // WRONG: should be documents first
    { kt: 'documents', lk: 'doc-1' }      // WRONG: should be annotations second
  ]
});
```

**New Error Message:**
```
Location key array order mismatch for get operation.

The location keys in your ComKey must match the hierarchy defined by the library.

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
  library.operations.get({
    kt: 'comments',
    pk: 'item-id',
    loc: [
      { kt: 'documents', lk: 'parent-id' },
      { kt: 'annotations', lk: 'parent-id' }
    ]
  })
```

### Scenario 5: Missing Location Keys

**Code:**
```typescript
// Incorrect - missing location keys
const comment = await commentLib.operations.get({
  kt: 'comments',
  pk: 'comment-1',
  loc: [
    { kt: 'documents', lk: 'doc-1' }
    // Missing: { kt: 'annotations', lk: 'anno-1' }
  ]
});
```

**New Error Message:**
```
Location key array order mismatch for get operation.

Expected location key order for 'comments':
  [0] { kt: 'documents', lk: <value> }
  [1] { kt: 'annotations', lk: <value> }

Received location key order:
  [0] { kt: 'documents', lk: "doc-1" }

Issues found:
  • Position 1: Missing location key with type 'annotations'

...
```

## Files Changed

### Core Library (@fjell/lib)

1. **New Files:**
   - `/Users/tobrien/gitw/getfjell/lib/src/KeyTypeUtils.ts` - Type utilities for key validation
   - `/Users/tobrien/gitw/getfjell/lib/tests/key-type-safety.test.ts` - Comprehensive tests (16 tests, all passing ✅)

2. **Modified Files:**
   - `/Users/tobrien/gitw/getfjell/lib/src/errors.ts` - Added `InvalidKeyTypeError`, `LocationKeyOrderError`, enhanced `NotFoundError`
   - `/Users/tobrien/gitw/getfjell/lib/src/ops/get.ts` - Added runtime validation for key type and location key order
   - `/Users/tobrien/gitw/getfjell/lib/src/contained/Operations.ts` - Enforced ComKey type, added documentation
   - `/Users/tobrien/gitw/getfjell/lib/src/primary/Operations.ts` - Added documentation

### Firestore Library (@fjell/lib-firestore)

1. **New Files:**
   - `/Users/tobrien/gitw/getfjell/lib-firestore/tests/key-type-safety.test.ts` - Integration tests

2. **Modified Files:**
   - `/Users/tobrien/gitw/getfjell/lib-firestore/src/ops/get.ts` - Added runtime validation for key type and location key order

## Testing

### Unit Tests

All tests pass successfully:

```bash
cd /Users/tobrien/gitw/getfjell/lib
npm test -- key-type-safety.test.ts

✓ tests/key-type-safety.test.ts (16 tests) 6ms
  Key Type Safety for get() Operations
    Primary Item Library
      ✓ should accept a valid PriKey
      ✓ should reject a ComKey with InvalidKeyTypeError
      ✓ should reject invalid key structures
      ✓ should reject string values as keys
    Composite Item Library
      ✓ should accept a valid ComKey
      ✓ should reject a PriKey with InvalidKeyTypeError
      ✓ should show helpful error message with correct key types
    Error Message Quality
      ✓ should provide clear guidance for composite library misuse
      ✓ should handle completely invalid key objects
    Location Key Order Validation
      Two-Level Hierarchy
        ✓ should accept correct location key order
        ✓ should reject incorrect location key types
      Three-Level Hierarchy
        ✓ should accept correct location key order
        ✓ should reject reversed location key order
        ✓ should reject missing location keys
        ✓ should reject extra location keys
      Error Message Quality
        ✓ should provide clear hierarchy explanation
```

### Test Coverage

The new code includes comprehensive test coverage for:
- Valid key acceptance for both primary and composite libraries
- Invalid key rejection with proper error types
- Error message quality and content
- Edge cases (null, undefined, malformed objects, wrong types)
- Location key array order validation (correct order, reversed, missing, extra)
- Multi-level hierarchy validation (2-level and 3-level hierarchies)

## Migration Guide

### For Library Users

**No breaking changes for correct usage.** If you're already using the correct key types, your code will continue to work without any changes.

**If you have incorrect key usage:**

1. **Compile-time errors:** TypeScript will now catch these at compile time. Fix them by using the correct key type as shown in the error message.

2. **Runtime errors:** If somehow TypeScript doesn't catch it (e.g., `any` types), you'll get a clear runtime error with an example of correct usage.

### For Library Maintainers

The changes are backward compatible for correct usage patterns. The only breaking change is that incorrect usage (which was already buggy) will now fail with a clear error instead of a misleading "not found" error.

## Benefits

1. **Save Development Time:** Catch errors at compile time or immediately with clear messages
2. **Better DX:** Clear guidance on correct usage
3. **Type Safety:** Leverage TypeScript's type system for correctness
4. **Maintainability:** Easier to debug issues and onboard new developers
5. **Robustness:** Prevent subtle bugs from incorrect key usage

## Future Enhancements

Potential future improvements:
1. Apply similar key type and location order validation to `update()`, `remove()`, `upsert()` operations
2. Add validation for `create()` to ensure locations match the library type
3. Create a builder pattern for constructing keys with auto-completion and validation
4. Add detailed documentation with more examples for each operation
5. Consider adding TypeScript template literal types to enforce location key order at compile time (advanced)

## Related Issues

This implementation addresses two user-reported issues:

1. **Issue 1: Wrong Key Type (8 hours debugging)**
   - User passed a `PriKey` instead of a `ComKey` to a composite library
   - Error message said "Item not found" instead of indicating wrong key type
   - Now caught at compile time or immediately at runtime with clear guidance

2. **Issue 2: Location Key Array Order Confusion (Several hours debugging)**
   - User spent hours trying to figure out if location keys should be highest-to-lowest or lowest-to-highest
   - No validation existed to check if the order matched the expected hierarchy
   - Now validates location key order and provides clear error messages showing expected vs actual order

