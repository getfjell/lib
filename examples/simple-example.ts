/**
 * Simple Fjell-Lib Example - Basic CRUD Operations Concept
 *
 * This example demonstrates the conceptual usage of fjell-lib for data operations.
 * It shows the patterns and API design without full implementation details.
 *
 * This is a conceptual guide showing:
 * - How to structure data models with fjell-lib
 * - The Operations interface pattern
 * - Registry and Instance creation concepts
 * - Basic CRUD operation usage patterns
 *
 * Run this example with: npx tsx examples/simple-example.ts
 *
 * Note: In a real application, import from the built package:
 * import { createRegistry, createInstance } from '@fjell/lib';
 */

// ===== Data Model Definitions =====

// Example 1: User data model
// In real fjell-lib, this would extend Item<'user'>
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  keyType: 'user';
}

// Example 2: Task data model
// In real fjell-lib, this would extend Item<'task'>
interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  keyType: 'task';
}

// ===== Conceptual Operations Interface =====

interface ConceptualOperations<T> {
  // Basic CRUD operations
  all(): Promise<T[]>;
  create(item: Partial<T>): Promise<T>;
  find(query: any): Promise<T[]>;
  findOne(query: any): Promise<T | null>;
  get(id: string): Promise<T | null>;
  update(id: string, updates: Partial<T>): Promise<T | null>;
  remove(id: string): Promise<boolean>;

  // Additional operations
  count(query?: any): Promise<number>;
  exists(id: string): Promise<boolean>;
}

// ===== Mock Data Storage =====
const userData: User[] = [];
const taskData: Task[] = [];

// ===== Mock Operations Implementation =====

const createUserOperations = (): ConceptualOperations<User> => ({
  async all() {
    console.log('📊 Getting all users');
    return [...userData];
  },

  async create(item: Partial<User>) {
    const user: User = {
      id: `user-${Date.now()}`,
      name: item.name || 'Unknown',
      email: item.email || 'unknown@example.com',
      createdAt: new Date(),
      keyType: 'user'
    };

    userData.push(user);
    console.log('➕ Created user:', user.name);
    return user;
  },

  async find(query: any) {
    console.log('🔍 Finding users with query:', query);
    if (!query.filter) return [...userData];

    return userData.filter(user =>
      Object.entries(query.filter).every(([key, value]) =>
        (user as any)[key] === value
      )
    );
  },

  async findOne(query: any) {
    console.log('🔍 Finding one user with query:', query);
    const results = await this.find(query);
    return results[0] || null;
  },

  async get(id: string) {
    console.log('📖 Getting user by id:', id);
    return userData.find(user => user.id === id) || null;
  },

  async update(id: string, updates: Partial<User>) {
    console.log('✏️ Updating user:', id, updates);
    const userIndex = userData.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    userData[userIndex] = { ...userData[userIndex], ...updates };
    return userData[userIndex];
  },

  async remove(id: string) {
    console.log('🗑️ Removing user:', id);
    const userIndex = userData.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    userData.splice(userIndex, 1);
    return true;
  },

  async count(query?: any) {
    const results = query ? await this.find(query) : userData;
    return results.length;
  },

  async exists(id: string) {
    return userData.some(user => user.id === id);
  }
});

const createTaskOperations = (): ConceptualOperations<Task> => ({
  async all() {
    console.log('📊 Getting all tasks');
    return [...taskData];
  },

  async create(item: Partial<Task>) {
    const task: Task = {
      id: `task-${Date.now()}`,
      title: item.title || 'Untitled Task',
      description: item.description || '',
      completed: false,
      userId: item.userId || '',
      createdAt: new Date(),
      keyType: 'task'
    };

    taskData.push(task);
    console.log('➕ Created task:', task.title);
    return task;
  },

  async find(query: any) {
    console.log('🔍 Finding tasks with query:', query);
    if (!query.filter) return [...taskData];

    return taskData.filter(task =>
      Object.entries(query.filter).every(([key, value]) =>
        (task as any)[key] === value
      )
    );
  },

  async findOne(query: any) {
    console.log('🔍 Finding one task with query:', query);
    const results = await this.find(query);
    return results[0] || null;
  },

  async get(id: string) {
    console.log('📖 Getting task by id:', id);
    return taskData.find(task => task.id === id) || null;
  },

  async update(id: string, updates: Partial<Task>) {
    console.log('✏️ Updating task:', id, updates);
    const taskIndex = taskData.findIndex(task => task.id === id);
    if (taskIndex === -1) return null;

    taskData[taskIndex] = { ...taskData[taskIndex], ...updates };
    return taskData[taskIndex];
  },

  async remove(id: string) {
    console.log('🗑️ Removing task:', id);
    const taskIndex = taskData.findIndex(task => task.id === id);
    if (taskIndex === -1) return false;

    taskData.splice(taskIndex, 1);
    return true;
  },

  async count(query?: any) {
    const results = query ? await this.find(query) : taskData;
    return results.length;
  },

  async exists(id: string) {
    return taskData.some(task => task.id === id);
  }
});

// ===== Conceptual Instance Interface =====

interface ConceptualInstance<T> {
  operations: ConceptualOperations<T>;
  coordinate: { keyType: string };
}

// ===== Main Example =====

async function runSimpleExample() {
  // Reset data for clean test runs
  userData.length = 0;
  taskData.length = 0;

  console.log('🚀 Fjell-Lib Simple Example - Basic CRUD Operations\n');

  // Step 1: Conceptual registry and instance creation
  console.log('📋 Step 1: Create Data Model Instances');
  console.log('In real fjell-lib usage:');
  console.log('  const registry = createRegistry();');
  console.log('  const userInstance = createInstance(registry, coordinate, operations, options);');
  console.log('');

  // Create conceptual instances
  const userInstance: ConceptualInstance<User> = {
    operations: createUserOperations(),
    coordinate: { keyType: 'user' }
  };

  const taskInstance: ConceptualInstance<Task> = {
    operations: createTaskOperations(),
    coordinate: { keyType: 'task' }
  };
  console.log('✅ Conceptual instances created\n');

  // Step 2: Create some users
  console.log('📋 Step 2: Create Users');
  const alice = await userInstance.operations.create({
    name: 'Alice Johnson',
    email: 'alice@example.com'
  });

  const bob = await userInstance.operations.create({
    name: 'Bob Smith',
    email: 'bob@example.com'
  });
  console.log('✅ Users created\n');

  // Step 3: Create some tasks
  console.log('📋 Step 3: Create Tasks');
  const task1 = await taskInstance.operations.create({
    title: 'Complete project documentation',
    description: 'Write comprehensive docs for the project',
    userId: alice.id
  });

  const task2 = await taskInstance.operations.create({
    title: 'Review code changes',
    description: 'Review pull requests from team members',
    userId: bob.id
  });

  const task3 = await taskInstance.operations.create({
    title: 'Update dependencies',
    description: 'Update npm packages to latest versions',
    userId: alice.id
  });
  console.log('✅ Tasks created\n');

  // Step 4: Read operations
  console.log('📋 Step 4: Read Operations');

  // Get all users
  const allUsers = await userInstance.operations.all();
  console.log(`Found ${allUsers.length} users total`);

  // Get all tasks
  const allTasks = await taskInstance.operations.all();
  console.log(`Found ${allTasks.length} tasks total`);

  // Find tasks for Alice
  const aliceTasks = await taskInstance.operations.find({
    filter: { userId: alice.id }
  });
  console.log(`Found ${aliceTasks.length} tasks for Alice`);

  // Find one user by email
  const foundUser = await userInstance.operations.findOne({
    filter: { email: 'bob@example.com' }
  });
  console.log(`Found user: ${foundUser?.name}`);
  console.log('✅ Read operations completed\n');

  // Step 5: Update operations
  console.log('📋 Step 5: Update Operations');

  // Complete a task
  const updatedTask = await taskInstance.operations.update(task1.id, {
    completed: true
  });
  console.log(`Task "${updatedTask?.title}" marked as completed`);

  // Update user email
  const updatedUser = await userInstance.operations.update(alice.id, {
    email: 'alice.johnson@newcompany.com'
  });
  console.log(`Updated Alice's email to: ${updatedUser?.email}`);
  console.log('✅ Update operations completed\n');

  // Step 6: Get specific items
  console.log('📋 Step 6: Get Specific Items');

  const specificUser = await userInstance.operations.get(bob.id);
  console.log(`Retrieved user: ${specificUser?.name} (${specificUser?.email})`);

  const specificTask = await taskInstance.operations.get(task2.id);
  console.log(`Retrieved task: ${specificTask?.title} - Completed: ${specificTask?.completed}`);
  console.log('✅ Get operations completed\n');

  // Step 7: Additional operations
  console.log('📋 Step 7: Additional Operations');

  // Count operations
  const userCount = await userInstance.operations.count();
  const activeTaskCount = await taskInstance.operations.count({
    filter: { completed: false }
  });
  console.log(`Total users: ${userCount}`);
  console.log(`Active tasks: ${activeTaskCount}`);

  // Exists operations
  const aliceExists = await userInstance.operations.exists(alice.id);
  console.log(`Alice exists: ${aliceExists}`);
  console.log('✅ Additional operations completed\n');

  // Step 8: Delete operations
  console.log('📋 Step 8: Delete Operations');

  // Remove a task
  const removed = await taskInstance.operations.remove(task3.id);
  console.log(`Task removal ${removed ? 'successful' : 'failed'}`);

  // Check remaining tasks
  const remainingTasks = await taskInstance.operations.all();
  console.log(`${remainingTasks.length} tasks remaining`);
  console.log('✅ Delete operations completed\n');

  // Step 9: Summary
  console.log('📋 Step 9: Final Summary');
  const finalUsers = await userInstance.operations.all();
  const finalTasks = await taskInstance.operations.all();

  console.log('\n📊 Final State:');
  console.log(`Users: ${finalUsers.length}`);
  finalUsers.forEach(user => {
    console.log(`  - ${user.name} (${user.email})`);
  });

  console.log(`Tasks: ${finalTasks.length}`);
  finalTasks.forEach(task => {
    console.log(`  - ${task.title} - ${task.completed ? '✅' : '⏳'} (User: ${task.userId})`);
  });

  console.log('\n🎉 Simple example completed! You now understand the basics of fjell-lib patterns.');
  console.log('\n💡 Key concepts demonstrated:');
  console.log('   - Data model interfaces extending Item<keyType>');
  console.log('   - Operations interface for CRUD functionality');
  console.log('   - Registry and Instance creation patterns');
  console.log('   - Basic query and filter patterns');
  console.log('   - Async operation handling');
  console.log('\n💡 Next steps:');
  console.log('   - Try the multi-level-keys.ts example for hierarchical data');
  console.log('   - Try the enterprise-example.ts for complex applications');
  console.log('   - Read the README.md for more details');
  console.log('   - Check the fjell-lib documentation for full implementation');
}

// Export the function for testing
export { runSimpleExample };

// Run the example
runSimpleExample().catch(console.error);
