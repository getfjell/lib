/**
 * Multi-Level Keys Example - Hierarchical Data Models (Conceptual)
 *
 * This example demonstrates advanced fjell-lib usage patterns with contained items
 * and hierarchical models. This is a conceptual guide showing the structure and
 * patterns you would use in a real application.
 *
 * Key concepts demonstrated:
 * - Primary items with contained children (Organization -> Department -> Employee)
 * - Multi-level location keys for data organization
 * - Different storage implementations based on scopes
 * - Complex queries across hierarchical data structures
 *
 * Run this example with: npx tsx examples/multi-level-keys.ts
 *
 * Note: In a real application, you would import from the built package and
 * implement the actual operations with your chosen storage backend:
 *
 * import { createRegistry, createInstance, Primary, Contained } from '@fjell/lib';
 * import { Item, PriKey, ComKey, ItemQuery, LocKeyArray } from "@fjell/types";
 */

// ===== Hierarchical Data Model Patterns =====

// Level 1: Organization (Primary Item)
// In real fjell-lib: interface Organization extends Item<'organization'>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Organization {
  id: string;
  name: string;
  type: 'enterprise' | 'startup' | 'nonprofit';
  industry: string;
  foundedYear: number;
  headquarters: string;
  createdAt: Date;
  keyType: 'organization';
}

// Level 2: Department (Contained in Organization with location hierarchy)
// In real fjell-lib: interface Department extends Item<'department', 'region', 'country'>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Department {
  id: string;
  organizationId: string;
  name: string;
  type: 'engineering' | 'sales' | 'marketing' | 'hr' | 'finance';
  budget: number;
  headCount: number;
  managerId?: string;
  region: 'us' | 'eu' | 'asia';
  country: string;
  createdAt: Date;
  keyType: 'department';
}

// Level 3: Employee (Contained in Department with 3-level location hierarchy)
// In real fjell-lib: interface Employee extends Item<'employee', 'region', 'country', 'department'>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Employee {
  id: string;
  organizationId: string;
  departmentId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'director';
  salary: number;
  hireDate: Date;
  region: 'us' | 'eu' | 'asia';
  country: string;
  department: string;
  createdAt: Date;
  keyType: 'employee';
}

// ===== Conceptual Operations Patterns =====

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ConceptualOperations<T> {
  // Basic operations with optional location filtering
  all(query?: any, locations?: string[]): Promise<T[]>;
  create(item: Partial<T>, options?: { locations?: string[] }): Promise<T>;
  find(query: any, locations?: string[]): Promise<T[]>;
  findOne(query: any, locations?: string[]): Promise<T | null>;
  get(id: string): Promise<T | null>;
  update(id: string, updates: Partial<T>): Promise<T | null>;
  remove(id: string): Promise<boolean>;
}

// ===== Example Usage Patterns =====

export async function demonstrateHierarchicalPatterns() {
  console.log('🏗️ Fjell-Lib Multi-Level Keys - Hierarchical Data Patterns\n');

  console.log('📋 Conceptual Usage Patterns:\n');

  // ===== 1. Registry and Instance Creation =====
  console.log('1. Registry and Instance Creation:');
  console.log(`
  // Create registry
  const registry = createRegistry();

  // Create instances for each level of hierarchy
  const orgInstance = createInstance(
    registry,
    { keyType: 'organization' },
    organizationOperations,
    organizationOptions
  );

  const deptInstance = createInstance(
    registry,
    { keyType: 'department' },
    departmentOperations,
    departmentOptions
  );

  const empInstance = createInstance(
    registry,
    { keyType: 'employee' },
    employeeOperations,
    employeeOptions
  );`);

  // ===== 2. Hierarchical Data Creation =====
  console.log('\n2. Hierarchical Data Creation:');
  console.log(`
  // Create organization (top level)
  const acmeOrg = await orgInstance.operations.create({
    name: 'Acme Corporation',
    type: 'enterprise',
    industry: 'Technology'
  });

  // Create departments with location hierarchy
  const usEngineering = await deptInstance.operations.create({
    organizationId: acmeOrg.id,
    name: 'Engineering',
    type: 'engineering',
    region: 'us',
    country: 'usa'
  }, { locations: ['us', 'usa'] });

  const euEngineering = await deptInstance.operations.create({
    organizationId: acmeOrg.id,
    name: 'Engineering EU',
    type: 'engineering',
    region: 'eu',
    country: 'germany'
  }, { locations: ['eu', 'germany'] });

  // Create employees with 3-level location hierarchy
  const seniorDev = await empInstance.operations.create({
    organizationId: acmeOrg.id,
    departmentId: usEngineering.id,
    firstName: 'Alice',
    lastName: 'Johnson',
    role: 'Senior Software Engineer',
    level: 'senior',
    region: 'us',
    country: 'usa',
    department: 'engineering'
  }, { locations: ['us', 'usa', 'engineering'] });`);

  // ===== 3. Location-Based Queries =====
  console.log('\n3. Location-Based Queries:');
  console.log(`
  // Query all departments in US
  const usDepartments = await deptInstance.operations.all({}, ['us', 'usa']);

  // Query all employees in EU
  const euEmployees = await empInstance.operations.all({}, ['eu', 'germany']);

  // Query employees in specific department location
  const usEngineeringEmployees = await empInstance.operations.all(
    {},
    ['us', 'usa', 'engineering']
  );

  // Query with filters + location
  const seniorEuEmployees = await empInstance.operations.find({
    filter: { level: 'senior' }
  }, ['eu', 'germany']);`);

  // ===== 4. Cross-Hierarchy Analysis =====
  console.log('\n4. Cross-Hierarchy Analysis:');
  console.log(`
  // Find all engineering departments globally
  const allEngineering = await deptInstance.operations.find({
    filter: { type: 'engineering' }
  });

  // Calculate total engineering budget by region
  const budgetByRegion = allEngineering.reduce((acc, dept) => {
    acc[dept.region] = (acc[dept.region] || 0) + dept.budget;
    return acc;
  }, {});

  // Find employees across all locations with specific criteria
  const allSeniorEngineers = await empInstance.operations.find({
    filter: {
      level: 'senior',
      department: 'engineering'
    }
  });

  // Aggregate data across hierarchy levels
  const orgStats = {
    totalEmployees: (await empInstance.operations.all({})).length,
    totalDepartments: (await deptInstance.operations.all({})).length,
    avgSalaryByRegion: calculateAvgSalaryByRegion(allEmployees),
    headcountByDepartment: calculateHeadcountByDepartment(allEmployees)
  };`);

  // ===== 5. Real Implementation Patterns =====
  console.log('\n5. Real Implementation Patterns:');
  console.log(`
  // In a real application, operations would be implemented with your storage backend:

  const createDepartmentOperations = (): Operations<Department, 'department', 'region', 'country'> => ({

    // Location-aware storage - departments stored by region/country
    all: wrapAllOperation(async (query, locations) => {
      if (locations && locations.length >= 2) {
        // Query specific region/country
        return await database.departments
          .where('region', locations[0])
          .where('country', locations[1])
          .find(query);
      } else {
        // Global query across all locations
        return await database.departments.find(query);
      }
    }),

    create: wrapCreateOperation(async (item, options) => {
      // Store in location-specific collection/table
      const locations = options.locations || [item.region, item.country];
      return await database.departments
        .collection(\`departments_\${locations[0]}_\${locations[1]}\`)
        .create(item);
    }),

    // ... other operations with location awareness
  });`);

  console.log('\n6. Benefits of Hierarchical Organization:');
  console.log(`
  ✅ Location-based data partitioning for performance
  ✅ Regional compliance and data sovereignty
  ✅ Scalable multi-tenant architecture
  ✅ Efficient queries within organizational boundaries
  ✅ Clear data ownership and access patterns
  ✅ Support for distributed/federated deployments`);

  console.log('\n🎉 Hierarchical patterns demonstration completed!');
  console.log('\n💡 Key takeaways:');
  console.log('   - Use contained items for hierarchical data organization');
  console.log('   - Leverage location keys for data partitioning and routing');
  console.log('   - Design operations to be location-aware for scalability');
  console.log('   - Implement cross-hierarchy queries for analytics and reporting');
  console.log('   - Consider regional data requirements in your location hierarchy');
}

// Run the conceptual demonstration
if (require.main === module) {
  demonstrateHierarchicalPatterns().catch(console.error);
}
