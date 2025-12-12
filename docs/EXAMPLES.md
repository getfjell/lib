# Fjell-Lib Examples

This directory contains examples demonstrating how to use fjell-lib for data operations and business logic with different patterns and complexity levels.

> **🆕 New in v4.4.12+**: Fjell-lib now uses a new Library architecture that extends from fjell-registry.Instance. See `library-architecture-example.ts` for details on the new inheritance hierarchy.

## Examples

### 0. `library-architecture-example.ts` 🆕 **New Architecture Guide**
**Learn the new Library architecture!** Demonstrates the inheritance hierarchy introduced in v4.4.12+:
- **fjell-registry.Instance**: Base coordination and registry functionality
- **fjell-lib.Library**: Adds operations and options for data models
- **fjell-lib-sequelize.SequelizeLibrary**: Adds Sequelize-specific database models
- **fjell-lib-firestore.FirestoreLibrary**: Adds Firestore-specific database configuration
- **Architecture benefits**: Type safety, extensibility, separation of concerns, clean APIs

Essential for understanding the new library ecosystem and how the projects work together.

### 1. `simple-example.ts` ⭐ **Start Here!**
**Perfect for beginners!** Demonstrates the simplest way to use fjell-lib for data operations:
- **Basic CRUD operations** - Create, Read, Update, Delete data models
- **Simple data models** - User and Task entities with mock storage
- **Registry and Instance creation** - Set up data model instances
- **Operations usage** - all, create, find, findOne, get, update, remove

Great for understanding the fundamentals of fjell-lib data management.

### 2. `multi-level-keys.ts`
**Advanced hierarchical data models!** Demonstrates complex data structures with contained items:
- **Hierarchical models**: Organization → Department → Employee
- **Multi-level location keys**: region/country/department organization
- **Contained items**: Departments contained in regions, Employees in department locations
- **Location-based queries**: Retrieve data from specific geographic/organizational locations
- **Cross-hierarchy analysis**: Complex queries spanning multiple data levels

Shows how fjell-lib handles enterprise data organization patterns.

### 3. `enterprise-example.ts` 🏗️ **Full Business Application**
**Complete enterprise system!** Demonstrates advanced business application patterns:
- **Multiple interconnected models**: Customer, Order, OrderItem, SupportTicket, Product
- **Business logic actions**: Order fulfillment workflows
- **Analytics facets**: Customer revenue analysis, support ticket metrics
- **Complex queries**: Multi-dimensional filtering and aggregation
- **Real business scenarios**: E-commerce platform with customer management

Perfect for understanding how to build complete business applications with fjell-lib.

## Key Concepts Demonstrated

### Basic Data Operations (simple-example.ts)
```typescript
// Import fjell-lib functionality (Library architecture in v4.4.12+)
import { createRegistry, createLibrary, Library, Operations } from '@fjell/lib';

// Create a registry for data models
const registry = createRegistry();

// Create a data model instance
const userInstance = createInstance(
  registry,
  { keyType: 'user' },
  userOperations,
  {}
);

// Perform CRUD operations
const user = await userInstance.operations.create({
  name: 'Alice Johnson',
  email: 'alice@example.com'
});

const allUsers = await userInstance.operations.all({});
const foundUser = await userInstance.operations.findOne({
  filter: { email: 'alice@example.com' }
});

await userInstance.operations.update([user.id], {
  email: 'alice.new@example.com'
});

await userInstance.operations.remove([user.id]);
```

### Hierarchical Data Models (multi-level-keys.ts)
```typescript
// Define hierarchical data models
interface Organization extends Item<'organization'> {
  id: string;
  name: string;
  type: 'enterprise' | 'startup' | 'nonprofit';
}

interface Department extends Item<'department', 'region', 'country'> {
  id: string;
  organizationId: string;
  name: string;
  region: 'us' | 'eu' | 'asia';
  country: string;
}

interface Employee extends Item<'employee', 'region', 'country', 'department'> {
  id: string;
  departmentId: string;
  firstName: string;
  lastName: string;
  region: 'us' | 'eu' | 'asia';
  country: string;
  department: string;
}

// Location-based queries
const usDepartments = await deptInstance.operations.all({}, ['us', 'usa']);
const usEngineering = await empInstance.operations.all({}, ['us', 'usa', 'engineering']);
```

### Business Logic with Actions & Facets (enterprise-example.ts)
```typescript
// Business action for order fulfillment
const fulfillOrderAction: ActionMethod<Order> = async (key, params) => {
  // Business logic for order processing
  const order = await findOrder(key);
  order.status = 'shipped';
  order.shippedDate = new Date();

  return {
    success: true,
    trackingNumber: params?.trackingNumber,
    estimatedDelivery: calculateDeliveryDate()
  };
};

// Analytics facet for customer insights
const customerAnalyticsFacet: FacetMethod<Customer> = async (query, options) => {
  const customers = await getCustomers(query);

  return {
    totalRevenue: customers.reduce((sum, c) => sum + c.totalRevenue, 0),
    customersByTier: groupByTier(customers),
    topCustomers: getTopCustomers(customers, 5)
  };
};

// Use actions and facets
const fulfillmentResult = await orderInstance.operations.action([orderId], {
  expedite: true,
  trackingNumber: 'EXP-123'
});

const analytics = await customerInstance.operations.facet({}, {
  metric: 'revenue'
});
```

### Data Model Patterns

#### Primary Items
- Standalone entities (User, Customer, Organization)
- No location hierarchy constraints
- Simple key structure: `Item<'keyType'>`

#### Contained Items
- Nested within other entities or locations
- Multi-level location keys for organization
- Complex key structure: `Item<'keyType', 'location1', 'location2', ...>`

#### Business Models
- Real-world entities with relationships
- Embedded business logic through actions
- Analytics capabilities through facets

## Running Examples

```bash
# Learn the new Library architecture (v4.4.12+)
npx tsx examples/library-architecture-example.ts

# Start with the simple example (recommended)
npx tsx examples/simple-example.ts

# Run the hierarchical data example
npx tsx examples/multi-level-keys.ts

# Run the full enterprise example
npx tsx examples/enterprise-example.ts

# Or with Node.js
node -r esbuild-register examples/library-architecture-example.ts
node -r esbuild-register examples/simple-example.ts
```

## Integration with Real Applications

All examples use the actual fjell-lib functionality! In production applications:

```typescript
// New Library architecture (v4.4.12+)
import { createRegistry, createLibrary, Primary, Contained } from '@fjell/lib';

// Simple data model setup
const registry = createRegistry();

const userLibrary = createLibrary(
  registry,
  { keyType: 'user' },
  userOperations,
  userOptions
);

// With business logic
const operations = {
  all: wrapAllOperation(getUsersFromDatabase),
  create: wrapCreateOperation(createUserInDatabase),
  find: wrapFindOperation(searchUsers),
  // ... other operations
  action: wrapActionOperation(userBusinessActions),
  facet: wrapFacetOperation(userAnalytics)
};

// Advanced contained items
const employeeInstance = createInstance(
  registry,
  { keyType: 'employee' },
  employeeOperations,
  {
    hooks: {
      beforeCreate: validateEmployeeData,
      afterUpdate: sendNotification
    },
    validators: {
      email: validateEmailFormat,
      salary: validateSalaryRange
    },
    finders: {
      byDepartment: findEmployeesByDepartment,
      bySkills: findEmployeesBySkills
    }
  }
);
```

## Data Operation Types

### CRUD Operations
- **all()**: Get all items matching query
- **create()**: Create new item
- **find()**: Search items with filtering
- **findOne()**: Find single item
- **get()**: Get item by primary key
- **update()**: Update existing item
- **remove()**: Delete item
- **one()**: Get single item (alias for findOne)
- **upsert()**: Update or create item

### Business Operations
- **action()**: Execute business logic on specific item
- **allAction()**: Execute business logic on multiple items
- **facet()**: Perform analytics/aggregation on items
- **allFacet()**: Perform analytics across multiple item sets

### Query Patterns
```typescript
// Basic queries
await instance.operations.all({});
await instance.operations.find({ filter: { status: 'active' } });

// Location-based queries (for contained items)
await instance.operations.all({}, ['us', 'west']);
await instance.operations.find({ filter: { role: 'engineer' } }, ['us', 'california', 'engineering']);

// Key-based access
await instance.operations.get(['user-123']);
await instance.operations.update(['user-123'], { email: 'new@email.com' });
```

## When to Use What

**Use `simple-example.ts` approach when:**
- Building basic applications
- Learning fjell-lib fundamentals
- Need simple CRUD operations
- Working with independent data models

**Use `multi-level-keys.ts` approach when:**
- Managing hierarchical data structures
- Need geographic or organizational data distribution
- Building multi-tenant applications
- Require location-based data partitioning

**Use `enterprise-example.ts` approach when:**
- Building complex business applications
- Need advanced analytics and reporting
- Require custom business logic workflows
- Managing interconnected business entities
- Building e-commerce, CRM, or ERP systems

## Advanced Features

### Options Configuration
```typescript
const options: Options<User, 'user'> = {
  hooks: {
    beforeCreate: async (item) => { /* validation */ },
    afterUpdate: async (item) => { /* notifications */ }
  },
  validators: {
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    name: (name) => name.length >= 2
  },
  finders: {
    byEmail: async (email) => { /* custom search */ },
    active: async () => { /* find active users */ }
  },
  actions: {
    activate: async (key, params) => { /* activate user */ },
    sendWelcome: async (key, params) => { /* send email */ }
  },
  facets: {
    summary: async (query, options) => { /* user statistics */ },
    engagement: async (query, options) => { /* activity metrics */ }
  }
};
```

### Storage Integration
Fjell-lib is storage-agnostic. Examples show mock implementations, but in production you would integrate with:
- SQL databases (PostgreSQL, MySQL)
- NoSQL databases (MongoDB, DynamoDB)
- In-memory stores (Redis)
- File systems
- Cloud storage services
- Custom data sources

This provides the foundation for building scalable, maintainable data applications with fjell-lib.

## New Library Architecture (v4.4.12+)

Fjell-lib now uses a cleaner inheritance hierarchy:

```typescript
// fjell-registry: Base coordination
import { createRegistry, Instance } from '@fjell/registry';

// fjell-lib: Data model operations
import { createLibrary, Library } from '@fjell/lib';

// fjell-lib-sequelize: Sequelize-specific implementation
import { createSequelizeLibrary, SequelizeLibrary } from '@fjell/lib-sequelize';

// fjell-lib-firestore: Firestore-specific implementation
import { createFirestoreLibrary, FirestoreLibrary } from '@fjell/lib-firestore';
```

**Benefits:**
- **Clear inheritance**: Each level adds specific functionality
- **Type safety**: Full TypeScript support throughout
- **Extensibility**: Easy to add new database implementations
- **Separation of concerns**: Each library has a focused responsibility

**Clean Architecture:** The new Library architecture provides a clear, consistent API across all data models and storage backends.
