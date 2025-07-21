/**
 * Fjell-Lib Library Architecture Example
 *
 * This example demonstrates the new Library architecture introduced in v4.4.12+
 * showing the inheritance hierarchy:
 *
 * fjell-registry.Instance (base coordination and registry)
 *   ↓ extends
 * fjell-lib.Library (adds operations and options for data models)
 *   ↓ extends
 * fjell-lib-sequelize.SequelizeLibrary (adds Sequelize-specific models)
 * fjell-lib-firestore.FirestoreLibrary (adds Firestore-specific database)
 *
 * Run this example with: npx tsx examples/library-architecture-example.ts
 *
 * Note: In a real application, import from the built packages:
 * import { createRegistry } from '@fjell/registry';
 * import { createLibrary } from '@fjell/lib';
 * import { createSequelizeLibrary } from '@fjell/lib-sequelize';
 * import { createFirestoreLibrary } from '@fjell/lib-firestore';
 */

// Simulated imports for conceptual demonstration
interface Registry {
  register: (kta: string[], library: any) => void;
  get: (kta: string[]) => any | null;
}

interface BaseInstance<S extends string> {
  coordinate: { keyType: S };
  registry: Registry;
}

interface Operations<T> {
  all(): Promise<T[]>;
  create(item: Partial<T>): Promise<T>;
  get(id: string): Promise<T | null>;
  update(id: string, updates: Partial<T>): Promise<T>;
  remove(id: string): Promise<boolean>;
}

interface Options<T> {
  validators?: Array<(item: T) => boolean>;
  hooks?: {
    beforeCreate?: (item: T) => Promise<T>;
    afterCreate?: (item: T) => Promise<void>;
  };
}

// ===== Data Models =====

interface User {
  id: string;
  name: string;
  email: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt: Date;
  keyType: 'user';
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  keyType: 'product';
}

// ===== 1. Base fjell-registry Instance =====

function createRegistryInstance<S extends string>(
  registry: Registry,
  keyType: S
): BaseInstance<S> {
  console.log(`📋 Creating base registry instance for '${keyType}'`);
  return {
    coordinate: { keyType },
    registry
  };
}

// ===== 2. fjell-lib Library (extends base Instance) =====

interface Library<T, S extends string> extends BaseInstance<S> {
  operations: Operations<T>;
  options: Options<T>;
}

function createLibrary<T, S extends string>(
  registry: Registry,
  keyType: S,
  operations: Operations<T>,
  options: Options<T> = {}
): Library<T, S> {
  console.log(`📚 Creating fjell-lib Library for '${keyType}' with operations and options`);

  const baseInstance = createRegistryInstance(registry, keyType);

  return {
    ...baseInstance,
    operations,
    options
  };
}

// ===== 3. fjell-lib-sequelize SequelizeLibrary (extends Library) =====

interface SequelizeLibrary<T, S extends string> extends Library<T, S> {
  models: Array<{ name: string; tableName: string }>;
}

function createSequelizeLibrary<T, S extends string>(
  registry: Registry,
  keyType: S,
  operations: Operations<T>,
  models: Array<{ name: string; tableName: string }>,
  options: Options<T> = {}
): SequelizeLibrary<T, S> {
  console.log(`🗄️  Creating Sequelize Library for '${keyType}' with models: ${models.map(m => m.name).join(', ')}`);

  const library = createLibrary(registry, keyType, operations, options);

  return {
    ...library,
    models
  };
}

// ===== 4. fjell-lib-firestore FirestoreLibrary (extends Library) =====

interface FirestoreLibrary<T, S extends string> extends Library<T, S> {
  firestore: { projectId: string; collection: string };
}

function createFirestoreLibrary<T, S extends string>(
  registry: Registry,
  keyType: S,
  operations: Operations<T>,
  firestore: { projectId: string; collection: string },
  options: Options<T> = {}
): FirestoreLibrary<T, S> {
  console.log(`🔥 Creating Firestore Library for '${keyType}' with collection: ${firestore.collection}`);

  const library = createLibrary(registry, keyType, operations, options);

  return {
    ...library,
    firestore
  };
}

// ===== Demo Implementation =====

async function demonstrateLibraryArchitecture() {
  console.log('🏗️  Fjell Library Architecture Demonstration\n');

  // Create registry
  const registry: Registry = {
    register: (kta, library) => console.log(`📝 Registered ${kta[0]} library:`, library.coordinate?.keyType || 'unknown'),
    get: (kta) => console.log(`🔍 Looking up ${kta[0]} library`)
  };

  // Sample operations for demonstration
  const userOperations: Operations<User> = {
    all: async () => {
      console.log('  📊 Getting all users');
      return [];
    },
    create: async (user) => {
      console.log(`  ➕ Creating user: ${user.name}`);
      return { id: 'user-1', name: user.name!, email: user.email!, tier: 'bronze', createdAt: new Date(), keyType: 'user' };
    },
    get: async (id) => {
      console.log(`  📖 Getting user: ${id}`);
      return null;
    },
    update: async (id, updates) => {
      console.log(`  ✏️  Updating user: ${id} with ${Object.keys(updates).join(', ')}`);
      return { id, name: 'Updated', email: 'updated@example.com', tier: 'silver', createdAt: new Date(), keyType: 'user' } as User;
    },
    remove: async (id) => {
      console.log(`  🗑️  Removing user: ${id}`);
      return true;
    }
  };

  const productOperations: Operations<Product> = {
    all: async () => {
      console.log('  📊 Getting all products');
      return [];
    },
    create: async (product) => {
      console.log(`  ➕ Creating product: ${product.name}`);
      return { id: 'prod-1', name: product.name!, price: product.price!, category: product.category!, keyType: 'product' };
    },
    get: async (id) => {
      console.log(`  📖 Getting product: ${id}`);
      return null;
    },
    update: async (id, updates) => {
      console.log(`  ✏️  Updating product: ${id} with ${Object.keys(updates).join(', ')}`);
      return { id, name: 'Updated Product', price: 999, category: 'electronics', keyType: 'product' } as Product;
    },
    remove: async (id) => {
      console.log(`  🗑️  Removing product: ${id}`);
      return true;
    }
  };

  console.log('1️⃣  Creating Base Registry Instances\n');

  // Base instances (minimal coordination only)
  const baseUserInstance = createRegistryInstance(registry, 'user');
  const baseProductInstance = createRegistryInstance(registry, 'product');

  console.log(`   📋 Base instances created: ${baseUserInstance.coordinate.keyType}, ${baseProductInstance.coordinate.keyType}`);

  console.log('\n2️⃣  Creating fjell-lib Libraries (adds operations + options)\n');

  // Library instances (adds operations and options)
  const userLibrary = createLibrary(registry, 'user', userOperations, {
    validators: [(user: User) => user.email.includes('@')],
    hooks: {
      beforeCreate: async (user: User) => {
        console.log(`  🔍 Validating user: ${user.name}`);
        return user;
      }
    }
  });

  const productLibrary = createLibrary(registry, 'product', productOperations);
  console.log(`   📚 Libraries created: ${userLibrary.coordinate.keyType}, ${productLibrary.coordinate.keyType}`);

  console.log('\n3️⃣  Creating Sequelize Libraries (adds database models)\n');

  // Sequelize libraries (adds database-specific models)
  const userSequelizeLibrary = createSequelizeLibrary(
    registry,
    'user',
    userOperations,
    [
      { name: 'User', tableName: 'users' },
      { name: 'UserProfile', tableName: 'user_profiles' }
    ],
    { validators: [(user: User) => user.email.includes('@')] }
  );

  console.log('\n4️⃣  Creating Firestore Libraries (adds Firestore configuration)\n');

  // Firestore libraries (adds Firestore-specific configuration)
  const productFirestoreLibrary = createFirestoreLibrary(
    registry,
    'product',
    productOperations,
    { projectId: 'my-project', collection: 'products' }
  );

  console.log('\n5️⃣  Demonstrating Library Usage\n');

  // Use the libraries for operations
  console.log('📚 Using fjell-lib Library:');
  await userLibrary.operations.create({ name: 'Alice Johnson', email: 'alice@example.com' });

  console.log('\n🗄️  Using Sequelize Library:');
  console.log(`   Available models: ${userSequelizeLibrary.models.map(m => m.name).join(', ')}`);
  await userSequelizeLibrary.operations.update('user-1', { tier: 'silver' });

  console.log('\n🔥 Using Firestore Library:');
  console.log(`   Firestore project: ${productFirestoreLibrary.firestore.projectId}`);
  console.log(`   Collection: ${productFirestoreLibrary.firestore.collection}`);
  await productFirestoreLibrary.operations.create({ name: 'Premium Widget', price: 299, category: 'widgets' });

  console.log('\n6️⃣  Architecture Benefits\n');

  console.log('✅ Inheritance Hierarchy:');
  console.log('   📋 BaseInstance: Provides coordinate + registry');
  console.log('   📚 Library: Adds operations + options for data models');
  console.log('   🗄️  SequelizeLibrary: Adds Sequelize-specific models');
  console.log('   🔥 FirestoreLibrary: Adds Firestore-specific configuration');

  console.log('\n✅ Type Safety:');
  console.log('   • Each library level adds specific typed properties');
  console.log('   • Full TypeScript support throughout the hierarchy');
  console.log('   • Type-safe operations for each data model');

  console.log('\n✅ Extensibility:');
  console.log('   • Easy to add new database-specific libraries');
  console.log('   • Consistent API across all library types');
  console.log('   • Backwards compatibility maintained');

  console.log('\n✅ Separation of Concerns:');
  console.log('   • fjell-registry: Core coordination');
  console.log('   • fjell-lib: Data model operations');
  console.log('   • fjell-lib-*: Database-specific implementations');

  console.log('\n🎉 Library Architecture Demonstration Complete!\n');

  console.log('💡 Next Steps:');
  console.log('   • Check the updated documentation for full implementation details');
  console.log('   • See fjell-lib-sequelize examples for Sequelize usage');
  console.log('   • See fjell-lib-firestore examples for Firestore usage');
  console.log('   • Legacy createInstance() functions remain for backwards compatibility');
}

// Run the demonstration
demonstrateLibraryArchitecture().catch(console.error);

export { demonstrateLibraryArchitecture };
