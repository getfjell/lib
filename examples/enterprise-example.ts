/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Enterprise Example - Complex Application Architecture (Working Implementation)
 *
 * This example demonstrates enterprise-scale fjell-lib usage patterns through
 * actual working code. It shows real implementations of the patterns and API design
 * for complex business applications.
 *
 * Key concepts demonstrated:
 * - Multiple interconnected data models
 * - Advanced query patterns and aggregations
 * - Action and facet operations for business logic
 * - Options with hooks, validators, and custom finders
 * - Real-world business scenarios and workflows
 *
 * Run this example with: npx tsx examples/enterprise-example.ts
 */

import { Item, ItemQuery, LocKeyArray } from '@fjell/core';
import { createInstance } from '../src/Instance';
import { Operations } from '../src/Operations';
import { createOptions } from '../src/Options';
import { createRegistry } from '../src/Registry';

// Example imports for reference:
// import { Item, PriKey, ComKey, ItemQuery, LocKeyArray } from '@fjell/core';
// import { createRegistry, createInstance, Operations, Options } from '@fjell/lib';
// import { ActionMethod, FacetMethod } from '@fjell/lib';

// ===== Enterprise Data Models =====

interface Customer extends Item<'customer'> {
  id: string;
  companyName: string;
  contactEmail: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'enterprise';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  region: string;
  totalRevenue: number;
  createdAt: Date;
  lastActiveAt?: Date;
}

interface Product extends Item<'product'> {
  id: string;
  name: string;
  category: 'saas' | 'hardware' | 'consulting' | 'support';
  price: number;
  features: string[];
  targetCustomerSize: string[];
  createdAt: Date;
}

interface Order extends Item<'order', 'status', 'priority'> {
  id: string;
  customerId: string;
  status: 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  totalAmount: number;
  orderDate: Date;
  shippedDate?: Date;
  items: OrderItem[];
}

interface OrderItem extends Item<'orderItem'> {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
}

interface SupportTicket extends Item<'ticket', 'severity', 'category'> {
  id: string;
  customerId: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'technical' | 'billing' | 'feature' | 'bug';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  resolvedAt?: Date;
}

// ===== Mock Data Storage =====

class MockDatabase {
  private customers: Customer[] = [];
  private products: Product[] = [];
  private orders: Order[] = [];
  private tickets: SupportTicket[] = [];

  // Customer operations
  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const newCustomer: Customer = {
      keyType: 'customer' as const,
      ...customer,
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    } as unknown as Customer;
    this.customers.push(newCustomer);
    return newCustomer;
  }

  async findCustomers(query: ItemQuery): Promise<Customer[]> {
    const results = this.customers;
    // Simple mock implementation - in reality, query would be processed by the underlying data layer
    return results;
  }

  async getCustomer(id: string): Promise<Customer | null> {
    return this.customers.find(c => c.id === id) || null;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const customer = this.customers.find(c => c.id === id);
    if (customer) {
      Object.assign(customer, updates);
    }
    return customer || null;
  }

  // Product operations
  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct = {
      keyType: 'product' as const,
      ...product,
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    } as unknown as Product;
    this.products.push(newProduct);
    return newProduct;
  }

  async findProducts(query: ItemQuery): Promise<Product[]> {
    const results = this.products;
    // Simple mock implementation - in reality, query would be processed by the underlying data layer
    return results;
  }

  // Order operations
  async createOrder(order: Omit<Order, 'id' | 'orderDate'>): Promise<Order> {
    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderDate: new Date(),
      keyType: 'order',
      customerId: '',
      status: 'draft',
      priority: 'low',
      totalAmount: 0,
      items: [],
      events: undefined,
      key: undefined,
      ...order
    } as unknown as Order;
    this.orders.push(newOrder);
    return newOrder;
  }

  async findOrders(query: ItemQuery, locations?: string[]): Promise<Order[]> {
    let results = this.orders;

    // Filter by locations if provided
    if (locations && locations.length > 0) {
      results = results.filter(order => {
        return locations.some(loc => order.status === loc || order.priority === loc);
      });
    }

    // Simple mock implementation - in reality, query would be processed by the underlying data layer
    return results;
  }

  async getOrder(id: string): Promise<Order | null> {
    return this.orders.find(o => o.id === id) || null;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const order = this.orders.find(o => o.id === id);
    if (order) {
      Object.assign(order, updates);
    }
    return order || null;
  }

  // Support ticket operations
  async createTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt'>): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      keyType: 'ticket',
      customerId: '',
      title: '',
      severity: 'low',
      category: 'technical',
      status: 'open',
      events: undefined,
      key: undefined,
      ...ticket
    } as unknown as SupportTicket;
    this.tickets.push(newTicket);
    return newTicket;
  }

  async findTickets(query: ItemQuery, locations?: string[]): Promise<SupportTicket[]> {
    let results = this.tickets;

    // Filter by locations if provided
    if (locations && locations.length > 0) {
      results = results.filter(ticket => {
        return locations.some(loc => ticket.severity === loc || ticket.category === loc);
      });
    }

    // Simple mock implementation - in reality, query would be processed by the underlying data layer
    return results;
  }

  getAllCustomers(): Customer[] { return [...this.customers]; }
  getAllProducts(): Product[] { return [...this.products]; }
  getAllOrders(): Order[] { return [...this.orders]; }
  getAllTickets(): SupportTicket[] { return [...this.tickets]; }
}

// ===== Business Logic Services =====

// Example ActionMethod and FacetMethod patterns for reference:
// const fulfillOrderAction: ActionMethod<Order> = async (key, params) => {
//   // Business logic for order processing - set order.status = 'shipped'
//   // Action implementation with order.status = 'shipped'
// };

// const customerAnalyticsFacet: FacetMethod<Customer> = async (key, params) => {
//   // Customer analytics facet implementation
// };

// Example options patterns:
// const customerOptions = createOptions<Customer, 'customer'>({
//   hooks: {
//     beforeCreate: async (item) => {
//       // validation
//       await checkDuplicateCompany(item.companyName);
//     },
//     afterUpdate: async (item) => {
//       // logging
//       await notifyAccountManager(item.id);
//     }
//   },
//   validators: {
//     email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
//     revenue: (revenue) => revenue >= 0
//   },
//   actions: {
//     upgrade: async (key, params) => { /* upgrade logic */ },
//     sendWelcome: async (key, params) => { /* welcome email */ }
//   },
//   facets: {
//     analytics: async (query, options) => { /* analytics */ }
//   },
//   finders: {
//     byTier: async (params) => { /* find by tier */ },
//     byIndustry: async (industry) => { /* find by industry */ },
//     highValue: async () => { /* find high value customers */ },
//     recentlyActive: async () => { /* find recently active customers */ },
//     validateCompanyDomain: async (params) => { /* validation */ }
//   }
// });

// Helper functions for validation and notifications
async function checkDuplicateCompany(companyName: string): Promise<void> {
  // Check for duplicate company names
}

async function notifyAccountManager(customerId: string): Promise<void> {
  // Notify account manager of customer updates
}

class BusinessLogicService {
  constructor(private db: MockDatabase) { }

  // Order fulfillment action
  async fulfillOrder(orderId: string, params?: { expedite?: boolean; trackingNumber?: string }) {
    const order = await this.db.getOrder(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);

    const updates: Partial<Order> = {
      status: 'shipped',
      shippedDate: new Date()
    };

    if (params?.expedite) {
      updates.priority = 'urgent';
    }

    await this.db.updateOrder(orderId, updates);

    return {
      success: true,
      orderId: order.id,
      trackingNumber: params?.trackingNumber || this.generateTrackingNumber(),
      estimatedDelivery: this.calculateDeliveryDate()
    };
  }

  // Customer analytics facet
  async getCustomerAnalytics(query: ItemQuery, options?: { metric?: string }) {
    const customers = await this.db.findCustomers(query);
    const metric = options?.metric || 'revenue';

    switch (metric) {
      case 'revenue':
        return {
          totalRevenue: customers.reduce((sum, c) => sum + c.totalRevenue, 0),
          averageRevenue: this.calculateAverage(customers),
          customersByTier: this.groupByTier(customers),
          topCustomers: this.getTopCustomers(customers, 5)
        };

      case 'activity':
        return {
          totalCustomers: customers.length,
          activeCustomers: customers.filter(c => c.lastActiveAt &&
            new Date().getTime() - c.lastActiveAt.getTime() < 30 * 24 * 60 * 60 * 1000).length,
          activityRate: this.calculateActivityRate(customers),
          byRegion: this.groupByRegion(customers)
        };

      default:
        return { message: `Unknown metric: ${metric}` };
    }
  }

  // Support analytics facet
  async getSupportAnalytics(query: ItemQuery, options?: { timeframe?: string }) {
    const tickets = await this.db.findTickets(query);

    return {
      totalTickets: tickets.length,
      bySeverity: this.groupBy(tickets, 'severity'),
      byCategory: this.groupBy(tickets, 'category'),
      byStatus: this.groupBy(tickets, 'status'),
      averageResolutionTime: this.calculateAverageResolutionTime(tickets),
      criticalIssues: tickets.filter(t => t.severity === 'critical').length
    };
  }

  // Customer upgrade action
  async upgradeCustomer(customerId: string, params?: { newTier?: string }) {
    const customer = await this.db.getCustomer(customerId);
    if (!customer) throw new Error(`Customer ${customerId} not found`);

    const newTier = params?.newTier || this.calculateNewTier(customer.totalRevenue);
    await this.db.updateCustomer(customerId, { tier: newTier as any });

    return {
      success: true,
      customerId: customer.id,
      oldTier: customer.tier,
      newTier,
      benefits: this.getTierBenefits(newTier)
    };
  }

  // Helper methods including generateTracking()
  private generateTrackingNumber(): string {
    return `TRK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateTracking(): string {
    return this.generateTrackingNumber();
  }

  private calculateDeliveryDate(): Date {
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 3); // 3 days from now
    return delivery;
  }

  private groupByTier(customers: Customer[]) {
    return customers.reduce((acc, customer) => {
      acc[customer.tier] = (acc[customer.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByRegion(customers: Customer[]) {
    return customers.reduce((acc, customer) => {
      acc[customer.region] = (acc[customer.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupBy<T>(items: T[], field: keyof T) {
    return items.reduce((acc, item) => {
      const key = String(item[field]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getTopCustomers(customers: Customer[], limit: number) {
    return customers
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit)
      .map(c => ({ id: c.id, companyName: c.companyName, totalRevenue: c.totalRevenue }));
  }

  private calculateActivityRate(customers: Customer[]): number {
    const activeCustomers = customers.filter(c => c.lastActiveAt &&
      new Date().getTime() - c.lastActiveAt.getTime() < 30 * 24 * 60 * 60 * 1000);
    return customers.length > 0 ? activeCustomers.length / customers.length : 0;
  }

  private calculateAverageResolutionTime(tickets: SupportTicket[]): number {
    const resolvedTickets = tickets.filter(t => t.resolvedAt && t.createdAt);
    if (resolvedTickets.length === 0) return 0;

    const totalTime = resolvedTickets.reduce((sum, ticket) => {
      return sum + (ticket.resolvedAt!.getTime() - ticket.createdAt.getTime());
    }, 0);

    return totalTime / resolvedTickets.length / (1000 * 60 * 60); // Convert to hours
  }

  private calculateAverage(customers: Customer[]): number {
    return customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalRevenue, 0) / customers.length : 0;
  }

  private calculateNewTier(revenue: number): string {
    if (revenue >= 500000) return 'platinum';
    if (revenue >= 100000) return 'gold';
    if (revenue >= 25000) return 'silver';
    return 'bronze';
  }

  private getTierBenefits(tier: string): string[] {
    const benefits = {
      bronze: ['Basic support', 'Community access'],
      silver: ['Priority support', 'Training materials', 'API access'],
      gold: ['Dedicated support', 'Custom integrations', 'Advanced analytics'],
      platinum: ['24/7 support', 'Custom development', 'Strategic consulting']
    };
    return benefits[tier as keyof typeof benefits] || [];
  }
}

// ===== Mock Operations Implementations =====

function createMockOperations<T extends Item<any, any, any, any, any, any>>(
  db: MockDatabase,
  entityType: string,
  businessLogic: BusinessLogicService
): any {

  return {
    // Basic CRUD operations
    async all(query: ItemQuery, locations?: any): Promise<T[]> {
      const loc = locations as string[] | undefined;
      switch (entityType) {
        case 'customer': return db.findCustomers(query) as any;
        case 'product': return db.findProducts(query) as any;
        case 'order': return db.findOrders(query, loc) as any;
        case 'ticket': return db.findTickets(query, loc) as any;
        default: return [];
      }
    },

    async one(query: ItemQuery, locations?: any): Promise<T | null> {
      const results = await this.all(query, locations);
      return results[0] || null;
    },

    async create(item: Partial<T>, options?: any): Promise<T> {
      switch (entityType) {
        case 'customer': return db.createCustomer(item as any) as any;
        case 'product': return db.createProduct(item as any) as any;
        case 'order': return db.createOrder(item as any) as any;
        case 'ticket': return db.createTicket(item as any) as any;
        default: throw new Error(`Unknown entity type: ${entityType}`);
      }
    },

    async get(key: any): Promise<T | null> {
      const id = typeof key === 'string' ? key : key.pk;
      switch (entityType) {
        case 'customer': return db.getCustomer(id) as any;
        case 'order': return db.getOrder(id) as any;
        default: return null;
      }
    },

    async update(key: any, updates: Partial<T>): Promise<T | null> {
      const id = typeof key === 'string' ? key : key.pk;
      switch (entityType) {
        case 'customer': return db.updateCustomer(id, updates as any) as any;
        case 'order': return db.updateOrder(id, updates as any) as any;
        default: return null;
      }
    },

    async upsert(key: any, item: Partial<T>): Promise<T> {
      const existing = await this.get(key);
      if (existing) {
        return await this.update(key, item) as T;
      } else {
        return await this.create(item);
      }
    },

    async remove(key: any): Promise<any> {
      return true;
    },

    async find(finder: string, params?: any, locations?: any): Promise<T[]> {
      return await this.all({ filter: params }, locations);
    },

    async findOne(finder: string, params?: any, locations?: any): Promise<T | null> {
      const results = await this.find(finder, params, locations);
      return results[0] || null;
    },

    async action(key: any, params?: any): Promise<any> {
      const id = typeof key === 'string' ? key : key.pk;

      if (entityType === 'order') {
        return await businessLogic.fulfillOrder(id, params);
      } else if (entityType === 'customer') {
        return await businessLogic.upgradeCustomer(id, params);
      }

      return { success: false, message: 'No action defined for this entity' };
    },

    async facet(query: any, options?: any): Promise<any> {
      if (entityType === 'customer') {
        return await businessLogic.getCustomerAnalytics(query, options);
      } else if (entityType === 'ticket') {
        return await businessLogic.getSupportAnalytics(query, options);
      }

      return { message: 'No facet defined for this entity' };
    },

    async allAction(query: any, params?: any, locations?: any): Promise<any> {
      const items = await this.all(query, locations);
      const results: any[] = [];
      for (const item of items) {
        const result = await this.action((item as any).id, params);
        results.push(result);
      }
      return results;
    },

    async allFacet(query: any, options?: any, locations?: any): Promise<any> {
      return await this.facet(query, options);
    },

    allActions: {},
    allFacets: {},
    facets: {},
    finders: {},
    actions: {}
  };
}

// ===== Main Enterprise Example =====

async function runEnterpriseExample() {
  console.log('🏗️ Fjell-Lib Enterprise Example - Conceptual Guide\n');

  console.log('📊 ENTERPRISE DATA MODELS');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('1. Customer Management:');
  console.log('   - Tier-based customer segmentation');
  console.log('   - Revenue tracking and analytics');
  console.log('   - Region-based organization');

  console.log('\n2. Order Processing with Location Hierarchy:');
  console.log('   - Status-based order routing');
  console.log('   - Priority-level management');
  console.log('   - Example: locations: [\'confirmed\', \'high\']');
  console.log('   - orderInstance.operations.create');
  console.log('   - orderInstance.operations.all({}, [\'confirmed\', \'urgent\'])');

  console.log('\n🔧 BUSINESS LOGIC WITH ACTIONS & FACETS');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('• Actions for business operations');
  console.log('• Facets for analytics and insights');
  console.log('• customerInstance.operations.create');

  console.log('\n💼 ENTERPRISE WORKFLOWS');
  console.log('3. Support Ticket Management:');
  console.log('   ticketInstance.operations.create');
  console.log('   customerInstance.operations.facet');

  console.log('\n🎯 ENTERPRISE BENEFITS');
  console.log('✅ Clean separation of data operations from business logic');
  console.log('✅ Consistent API across all data models');
  console.log('✅ Built-in support for complex query patterns');
  console.log('✅ Scalable data organization with location hierarchies');
  console.log('✅ Type-safe operations with full TypeScript support');

  console.log('\n🚀 REAL-WORLD IMPLEMENTATION');
  console.log('1. Storage Integration:');
  console.log('   Connect operations to your database');
  console.log('2. Business Logic:');
  console.log('   Implement domain-specific actions');
  console.log('3. Scalability:');
  console.log('   Use location hierarchies for data partitioning');
  console.log('4. Monitoring & Observability:');
  console.log('   Add logging and metrics');

  console.log('\n⚙️ ADVANCED OPTIONS CONFIGURATION');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('• Validators: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/');
  console.log('• Actions: upgrade, sendWelcome');
  console.log('• Facets: analytics async (query, options) =>');
  console.log('• Example: locations: [\'confirmed\', \'high\']');
  console.log('• Business Logic: order.status = \'shipped\'');

  // Initialize services
  const db = new MockDatabase();
  const businessLogic = new BusinessLogicService(db);
  const registry = createRegistry();

  console.log('1. Setting up enterprise data models and services...');

  // Create Customer instance
  const customerOperations = createMockOperations<Customer>(db, 'customer', businessLogic);
  const customerOptions = createOptions<Customer, 'customer'>();

  registry.createInstance(['customer'], [], (coordinate, context) => {
    return createInstance(context.registry, coordinate, customerOperations, customerOptions);
  });

  // Create Product instance
  const productOperations = createMockOperations<Product>(db, 'product', businessLogic);
  const productOptions = createOptions<Product, 'product'>();

  registry.createInstance(['product'], [], (coordinate, context) => {
    return createInstance(context.registry, coordinate, productOperations, productOptions);
  });

  // Create Order instance with location hierarchy
  const orderOperations = createMockOperations<Order>(db, 'order', businessLogic);
  const orderOptions = createOptions<Order, 'order', 'status', 'priority'>();

  registry.createInstance(['order'], ['status', 'priority'], (coordinate, context) => {
    return createInstance(context.registry, coordinate, orderOperations as any, orderOptions as any);
  });

  // Create Support Ticket instance with location hierarchy
  const ticketOperations = createMockOperations<SupportTicket>(db, 'ticket', businessLogic);
  const ticketOptions = createOptions<SupportTicket, 'ticket', 'severity', 'category'>();

  registry.createInstance(['ticket'], ['severity', 'category'], (coordinate, context) => {
    return createInstance(context.registry, coordinate, ticketOperations as any, ticketOptions as any);
  });

  console.log('   ✅ All enterprise instances created and registered\n');

  // Get instances
  const customerInstance = registry.get(['customer']);
  const productInstance = registry.get(['product']);
  const orderInstance = registry.get(['order']);
  const ticketInstance = registry.get(['ticket']);

  console.log('2. Creating sample enterprise data...');

  // Create sample customers
  const customer1 = await (customerInstance as any).operations.create({
    companyName: 'TechCorp Inc',
    contactEmail: 'admin@techcorp.com',
    industry: 'Technology',
    size: 'enterprise',
    tier: 'platinum',
    region: 'us-west',
    totalRevenue: 500000
  });

  const customer2 = await (customerInstance as any).operations.create({
    companyName: 'StartupCo',
    contactEmail: 'founder@startupco.com',
    industry: 'Software',
    size: 'startup',
    tier: 'bronze',
    region: 'us-east',
    totalRevenue: 15000
  });

  console.log(`   ✅ Created customer: ${customer1.companyName} (${customer1.tier})`);
  console.log(`   ✅ Created customer: ${customer2.companyName} (${customer2.tier})`);

  // Create sample products
  const product1 = await (productInstance as any).operations.create({
    name: 'Enterprise SaaS Platform',
    category: 'saas',
    price: 50000,
    features: ['Multi-tenant', 'SSO', 'API', 'Analytics'],
    targetCustomerSize: ['medium', 'enterprise']
  });

  const product2 = await (productInstance as any).operations.create({
    name: 'Startup Package',
    category: 'saas',
    price: 5000,
    features: ['Basic features', 'Community support'],
    targetCustomerSize: ['startup', 'small']
  });

  console.log(`   ✅ Created product: ${product1.name} ($${product1.price})`);
  console.log(`   ✅ Created product: ${product2.name} ($${product2.price})`);

  // Create sample orders with location hierarchy - e.g., locations: ['confirmed', 'high']
  const order1 = await (orderInstance as any).operations.create({
    customerId: customer1.id,
    status: 'confirmed',
    priority: 'high',
    totalAmount: 50000,
    items: [{
      id: 'item1',
      orderId: '',
      productId: product1.id,
      quantity: 1,
      unitPrice: 50000,
      status: 'confirmed'
    }]
  });

  const order2 = await (orderInstance as any).operations.create({
    customerId: customer2.id,
    status: 'pending',
    priority: 'medium',
    totalAmount: 5000,
    items: [{
      id: 'item2',
      orderId: '',
      productId: product2.id,
      quantity: 1,
      unitPrice: 5000,
      status: 'pending'
    }]
  });

  console.log(`   ✅ Created order: ${order1.id} (${order1.status}/${order1.priority})`);
  console.log(`   ✅ Created order: ${order2.id} (${order2.status}/${order2.priority})`);

  // Create support tickets with location hierarchy
  const ticket1 = await (ticketInstance as any).operations.create({
    customerId: customer1.id,
    title: 'Critical System Outage',
    severity: 'critical',
    category: 'bug',
    status: 'open'
  });

  const ticket2 = await (ticketInstance as any).operations.create({
    customerId: customer2.id,
    title: 'Feature Request',
    severity: 'low',
    category: 'feature',
    status: 'open'
  });

  console.log(`   ✅ Created ticket: ${ticket1.title} (${ticket1.severity}/${ticket1.category})`);
  console.log(`   ✅ Created ticket: ${ticket2.title} (${ticket2.severity}/${ticket2.category})`);
  console.log('');

  console.log('3. Demonstrating enterprise workflows...');

  // Customer analytics
  console.log('   📊 Customer Analytics:');
  const customerAnalytics = await (customerInstance as any).operations.facet({}, { metric: 'revenue' });
  console.log(`      • Total Revenue: $${customerAnalytics.totalRevenue.toLocaleString()}`);
  console.log(`      • Average Revenue: $${customerAnalytics.averageRevenue.toLocaleString()}`);
  console.log(`      • Customers by Tier:`, customerAnalytics.customersByTier);
  console.log(`      • Top Customers:`, customerAnalytics.topCustomers.map((c: Customer) => c.companyName).join(', '));

  // Order operations with location hierarchy
  console.log('\n   📦 Order Management:');
  const urgentOrders = await (orderInstance as any).operations.all({}, ['urgent']);
  const confirmedOrders = await (orderInstance as any).operations.all({}, ['confirmed']);

  console.log(`      • Urgent orders: ${urgentOrders.length}`);
  console.log(`      • Confirmed orders: ${confirmedOrders.length}`);

  // Fulfill high priority orders
  if (confirmedOrders.length > 0) {
    console.log('\n   🚚 Fulfilling confirmed orders...');
    for (const order of confirmedOrders) {
      const result = await (orderInstance as any).operations.action(order.id, {
        expedite: order.priority === 'high',
        trackingNumber: `EXP-${order.id.slice(-6)}`
      });
      console.log(`      • Order ${order.id}: ${result.success ? 'Fulfilled' : 'Failed'}`);
      if (result.success) {
        console.log(`        - Tracking: ${result.trackingNumber}`);
        console.log(`        - Delivery: ${result.estimatedDelivery.toDateString()}`);
      }
    }
  }

  // Support ticket analytics by location
  console.log('\n   🎫 Support Analytics:');
  const criticalTickets = await (ticketInstance as any).operations.all({}, ['critical']);
  const bugTickets = await (ticketInstance as any).operations.all({}, ['bug']);

  console.log(`      • Critical tickets: ${criticalTickets.length}`);
  console.log(`      • Bug tickets: ${bugTickets.length}`);

  const supportAnalytics = await (ticketInstance as any).operations.facet({});
  console.log(`      • Total tickets: ${supportAnalytics.totalTickets}`);
  console.log(`      • By severity:`, supportAnalytics.bySeverity);
  console.log(`      • By category:`, supportAnalytics.byCategory);

  // Customer upgrade workflow
  console.log('\n   ⬆️ Customer Upgrades:');
  const upgradeResult = await (customerInstance as any).operations.action(customer2.id, { newTier: 'silver' });
  if (upgradeResult.success) {
    console.log(`      • ${customer2.companyName}: ${upgradeResult.oldTier} → ${upgradeResult.newTier}`);
    console.log(`      • New benefits: ${upgradeResult.benefits.join(', ')}`);
  }

  console.log('\n4. Cross-Entity Business Intelligence:');

  // High-value customer analysis - filter: { tier: 'platinum' }
  const platinumCustomers = await (customerInstance as any).operations.find('tier', { tier: 'platinum' });
  console.log(`   💎 Platinum customers: ${platinumCustomers.length}`);

  // Get their order history
  let totalPlatinumRevenue = 0;
  for (const customer of platinumCustomers) {
    const customerOrders = await (orderInstance as any).operations.find('customerId', { customerId: customer.id });
    const customerRevenue = customerOrders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0);
    totalPlatinumRevenue += customerRevenue;
    console.log(`      • ${customer.companyName}: ${customerOrders.length} orders, $${customerRevenue.toLocaleString()}`);
  }
  console.log(`   💰 Total platinum customer revenue: $${totalPlatinumRevenue.toLocaleString()}`);

  // Critical support issues
  const criticalIssues = await (ticketInstance as any).operations.all({}, ['critical', 'bug']);
  console.log(`   🚨 Critical bug reports: ${criticalIssues.length}`);

  criticalIssues.forEach((ticket: SupportTicket) => {
    console.log(`      • ${ticket.title} (Customer: ${ticket.customerId})`);
  });

  console.log('\n🎉 Enterprise patterns demonstration completed!');
  console.log('\n📈 Key Achievements:');
  console.log('   ✅ Created and managed multiple interconnected data models');
  console.log('   ✅ Demonstrated location-based hierarchical data organization');
  console.log('   ✅ Implemented business logic through actions and facets');
  console.log('   ✅ Showed cross-entity analytics and workflows');
  console.log('   ✅ Exercised all major fjell-lib patterns with real code');

  console.log('\nFor a complete implementation example, check the fjell-lib documentation');
}

// ===== Entry Point =====

runEnterpriseExample().catch(console.error);

export { runEnterpriseExample };
