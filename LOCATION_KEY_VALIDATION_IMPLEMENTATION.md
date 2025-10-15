# Location Key Array Validation Implementation

## Overview

Added comprehensive validation for `LocKeyArray` parameters across all operations in the `@fjell/lib` package. This ensures that location keys are always passed in the correct hierarchical order, preventing malformed data access patterns and catching configuration errors early.

## What Was Implemented

### 1. Core Validation Function

**File:** `src/validation/KeyValidator.ts`

Added `validateLocations()` function that:
- Validates standalone `LocKeyArray` parameters passed to operations
- Checks that location keys are in the correct hierarchical order based on the coordinate's `kta` (key type array)
- Throws descriptive errors when validation fails
- Provides clear error messages indicating:
  - Expected hierarchy
  - Actual order received
  - Which position has the mismatch

#### Example Error Message:
```
Error: Invalid location key array order for all: 
At position 0, expected key type "level1" but received "level2". 
Location keys must be ordered according to the hierarchy: [level1, level2]. 
Received order: [level2, level1]
```

### 2. Operations Updated

Added validation calls to all operations that accept `locations` parameters:

#### Collection Operations:
- **all.ts** - Validates locations parameter
- **one.ts** - Validates locations parameter  
- **find.ts** - Validates locations parameter
- **findOne.ts** - Validates locations parameter

#### Batch Operations:
- **allAction.ts** - Validates locations parameter (also added coordinate parameter to function signature)
- **allFacet.ts** - Validates locations parameter

#### Item Operations:
- **create.ts** - Validates locations in options parameter

### 3. Function Signature Updates

**File:** `src/ops/allAction.ts`

Updated `wrapAllActionOperation` to accept `coordinate` parameter:
```typescript
export const wrapAllActionOperation = <...>(
  toWrap: Operations<V, S, L1, L2, L3, L4, L5>,
  options: Options<V, S, L1, L2, L3, L4, L5>,
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,  // <- Added
) => { ... }
```

**File:** `src/Operations.ts`

Updated the call site to pass coordinate:
```typescript
operations.allAction = wrapAllActionOperation(toWrap, options, coordinate);
```

### 4. Test Updates

Fixed all affected tests to use properly structured coordinates that match their location types:

**Files Updated:**
- `tests/ops/all.test.ts`
- `tests/ops/allAction.test.ts`
- `tests/ops/allFacet.test.ts`
- `tests/ops/create.test.ts`
- `tests/ops/find.test.ts`
- `tests/ops/findOne.test.ts`
- `tests/ops/one.test.ts`
- `tests/Operations.test.ts`

**Pattern:** Changed coordinates from:
```typescript
createCoordinate(['test'], ['scope1'])  // ❌ Wrong
```

To:
```typescript
createCoordinate(['test', 'level1', 'level2'], ['scope1'])  // ✅ Correct
```

### 5. New Test Suite

**File:** `tests/validation/location-key-validation.test.ts`

Comprehensive validation test suite with 5 tests covering:
1. ✅ Accepting location keys in correct order
2. ✅ Rejecting location keys in wrong order
3. ✅ Rejecting too many location keys
4. ✅ Allowing empty location arrays
5. ✅ Validating locations in create operation

## How It Works

### Validation Logic

1. **Extract Expected Hierarchy**: From the coordinate's `kta`, remove the first element (primary key type) to get expected location types
   ```typescript
   const expectedLocationTypes = coordinate.kta.slice(1);  // ['level1', 'level2']
   ```

2. **Extract Actual Order**: Map the provided location keys to their types
   ```typescript
   const actualLocationTypes = locations.map(loc => loc.kt);  // ['level1', 'level2']
   ```

3. **Validate Order**: Check that each location key matches the expected type at that position
   ```typescript
   for (let i = 0; i < actualLocationTypes.length; i++) {
     if (expectedLocationTypes[i] !== actualLocationTypes[i]) {
       throw new Error(/* descriptive message */);
     }
   }
   ```

4. **Validate Length**: Ensure not too many location keys are provided
   ```typescript
   if (actualLocationTypes.length > expectedLocationTypes.length) {
     throw new Error(/* too many keys */);
   }
   ```

### Example Usage

```typescript
// Correct usage
const coordinate = createCoordinate(['order', 'orderForm', 'orderItem'], ['scope']);
const locations = [
  { kt: 'orderForm', lk: '123' },  // Parent first
  { kt: 'orderItem', lk: '456' }   // Child second
];
await library.operations.all({}, locations);  // ✅ Success

// Wrong usage
const wrongLocations = [
  { kt: 'orderItem', lk: '456' },  // ❌ Child first
  { kt: 'orderForm', lk: '123' }   // ❌ Parent second
];
await library.operations.all({}, wrongLocations);  // ❌ Throws validation error
```

## Benefits

1. **Early Error Detection**: Catches ordering issues at the API call site rather than after failed database queries
2. **Clear Error Messages**: Developers immediately understand what went wrong and how to fix it
3. **Type Safety + Runtime Safety**: Works alongside TypeScript's compile-time checks to provide comprehensive validation
4. **Prevents Data Corruption**: Ensures location keys always match the expected hierarchy
5. **Consistent Validation**: Same validation logic applied across all operations
6. **Zero Performance Cost for Correct Code**: Validation is fast and only throws on actual errors

## Test Results

All 466 tests pass successfully:
```
Test Files  39 passed (39)
Tests  466 passed (466)
```

New validation tests:
```
Test Files  1 passed (1)
Tests  5 passed (5)
```

## Next Steps

This same validation pattern should be applied to:
- `@fjell/cache` - Cache operations with location parameters
- `@fjell/lib-firestore` - Firestore-specific operations
- `@fjell/lib-sequelize` - Sequelize-specific operations
- `@fjell/client-api` - HTTP client operations (different validation needs)

## Related Documentation

- See `lib/src/validation/KeyValidator.ts` for implementation details
- See `lib/tests/validation/location-key-validation.test.ts` for usage examples
- See existing ComKey validation (also in `KeyValidator.ts`) for similar validation pattern

## Breaking Changes

None - this only adds validation that throws errors for code that was already broken (passing keys in wrong order).

