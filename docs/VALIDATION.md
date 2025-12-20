# Validation

`@fjell/lib` supports automatic schema validation for `create` and `update` operations. Schema validation is provided by `@fjell/validation`, making it available throughout the Fjell ecosystem. You can integrate any schema validation library (like Zod, Yup, or Joi) by adapting it to the `SchemaValidator` interface, but Zod is supported out of the box via duck typing.

> **Note**: Schema validation (`validateSchema` and `SchemaValidator`) is now part of `@fjell/validation` and can be used independently in cache layers, APIs, or any system boundary. See [`@fjell/validation` documentation](../../validation/README.md) for more details.

## Installation

To use Zod with Fjell:

```bash
npm install zod
```

## Usage

You can define a schema in your `Options` object.

### 1. Define a Schema

```typescript
import { z } from 'zod';
import { createOptions, Item, SchemaValidator } from '@fjell/lib';
// SchemaValidator is re-exported from @fjell/validation

interface User extends Item<"user"> {
  name: string;
  age: number;
  email?: string;
}

const userSchema: SchemaValidator<User> = z.object({
  // Define your fields
  name: z.string().min(3),
  age: z.number().min(18),
  email: z.string().email().optional(),
  
  // Allow Fjell system fields if you want to validate them or just passthrough
  // It's often easier to use .passthrough() on the Zod object if you don't want to validate metadata
  key: z.any().optional(),
  events: z.any().optional(),
  refs: z.any().optional(),
}).passthrough();
```

### 2. Configure Options

Pass the schema to `createOptions`:

```typescript
const options = createOptions<User, "user">({
  validation: {
    schema: userSchema,
    // Optional: Separate schema for partial updates
    updateSchema: userSchema.partial() 
  }
});
```

### 3. Automatic Validation

Now, when you call `create` or `update`, validation runs automatically.

```typescript
// Succeeds
await lib.operations.create({ 
  name: "Alice", 
  age: 25 
});

// Fails with ValidationError
try {
  await lib.operations.create({ 
    name: "Al", // Too short
    age: 10     // Too young
  });
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.log(error.details.fieldErrors);
    // Output:
    // [
    //   { path: ['name'], message: 'String must contain at least 3 character(s)', code: 'too_small' },
    //   { path: ['age'], message: 'Number must be greater than or equal to 18', code: 'too_small' }
    // ]
  }
}
```

## Partial Updates

For `update` operations, Fjell handles validation slightly differently to support partial updates.

1.  **If `updateSchema` is provided**: It is used to validate the update payload.
2.  **If `updateSchema` is NOT provided**: Validation is **skipped** for updates, even if `schema` is present. This is to prevent false positives where a partial update (e.g., just updating `email`) would fail the full `schema` validation (which expects `name` and `age`).

**Best Practice**: Always provide `updateSchema` if you want validation on updates.

```typescript
const options = createOptions<User, "user">({
  validation: {
    schema: userSchema,
    updateSchema: userSchema.partial() // Zod helper for partial schemas
  }
});
```

## Legacy Validators

If you are using the old `validators` hook (`onCreate`, `onUpdate`), they continue to work as before. They run **after** the schema validation passes.

```typescript
const options = createOptions({
  validation: { schema: mySchema },
  validators: {
    onCreate: async (item) => {
      // Custom logic not easily expressible in Zod
      const isUnique = await checkUniqueness(item.name);
      return isUnique;
    }
  }
});
```

