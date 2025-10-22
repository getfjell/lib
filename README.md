# @fjell/lib

Server-side data operations library for Fjell.

## Installation

```bash
npm install @fjell/lib @fjell/core @fjell/registry
```

## Breaking Changes in v5.0.0

The Operations interface now extends from `@fjell/core`. This provides:
- Consistent interface across all fjell packages
- Centralized validation logic
- Better type safety

### Migration from v4.x

The API remains the same, but imports may need updating:

```typescript
// Before
import { Operations } from '@fjell/lib';

// After (still works)
import { Operations } from '@fjell/lib';

// Or import types directly from core
import { OperationParams, AffectedKeys } from '@fjell/core';
```

No code changes required unless you were using internal types.

See [MIGRATION_v5.md](./MIGRATION_v5.md) for detailed migration guide.

## Quick Start

```typescript
import { createLibrary } from '@fjell/lib';
import { createRegistry } from '@fjell/registry';

// Define your data model
interface User {
  kt: 'user';
  pk: string;
  name: string;
  email: string;
}

// Create operations implementation
const userOperations = {
  async create(item) { /* ... */ },
  async get(key) { /* ... */ },
  async update(key, item) { /* ... */ },
  async remove(key) { /* ... */ },
  async all(query) { /* ... */ },
  async one(query) { /* ... */ },
  async find(finder, params) { /* ... */ },
  async findOne(finder, params) { /* ... */ },
  async action(key, action, params) { /* ... */ },
  async allAction(action, params) { /* ... */ },
  async facet(key, facet, params) { /* ... */ },
  async allFacet(facet, params) { /* ... */ },
};

// Create registry and library
const registry = createRegistry();
const userLibrary = createLibrary(registry, coordinate, userOperations, options);

// Use the library
const newUser = await userLibrary.operations.create({
  name: 'Alice',
  email: 'alice@example.com'
});
```

## Features

- **Type-safe operations** - Full TypeScript support with strict typing
- **Hooks system** - Pre/post create, update, and remove hooks
- **Validators** - Validate data before operations
- **Custom finders** - Define custom query methods
- **Actions** - Define business logic operations
- **Facets** - Compute derived views of data
- **Location hierarchies** - Support for hierarchical data organization

## Documentation

For full documentation, examples, and guides, visit the [documentation site](https://getfjell.github.io/lib).

## Examples

See the [examples](./examples) directory for usage patterns.

## License

Apache-2.0

