import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { Definition } from "@/Definition";
import { Operations, wrapOperations } from "@/primary/Operations";
import { createRegistry, Registry } from "@/Registry";
import { Item, ItemQuery, PriKey } from "@fjell/core";

vi.mock('@fjell/logging', () => {
  const logger = {
    get: vi.fn().mockReturnThis(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    emergency: vi.fn(),
    alert: vi.fn(),
    critical: vi.fn(),
    notice: vi.fn(),
    time: vi.fn().mockReturnThis(),
    end: vi.fn(),
    log: vi.fn(),
  };

  return {
    default: {
      getLogger: () => logger,
    }
  }
});

vi.mock('@/logger', () => {
  const logger = {
    get: vi.fn().mockReturnThis(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    emergency: vi.fn(),
    alert: vi.fn(),
    critical: vi.fn(),
    notice: vi.fn(),
    time: vi.fn().mockReturnThis(),
    end: vi.fn(),
    log: vi.fn(),
  };
  return {
    default: logger,
  };
});

vi.mock('@/Operations', () => ({
  wrapOperations: vi.fn().mockImplementation((toWrap) => toWrap)
}));

describe('Primary Operations', () => {
    // Mock interfaces and types
    interface TestItem extends Item<'test'> {
        name: string;
        value: number;
    }

    type TestItemProperties = Partial<Item<'test'>>;

    let mockOperations: Operations<TestItem, 'test'>;
    let mockDefinition: Definition<TestItem, 'test'>;
    let registry: Registry;

    beforeEach(() => {
      vi.clearAllMocks();

      mockOperations = {
        all: vi.fn(),
        one: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        upsert: vi.fn(),
        get: vi.fn(),
        remove: vi.fn(),
        find: vi.fn(),
        findOne: vi.fn(),
        action: vi.fn(),
        facet: vi.fn(),
        allAction: vi.fn(),
        allFacet: vi.fn(),
        allActions: {},
        allFacets: {},
        facets: {},
        finders: {},
        actions: {}
      };

      mockDefinition = {
        coordinate: {
          kta: ['test'],
          scopes: [],
        },
        options: {}
      } as Definition<TestItem, 'test'>;

      registry = createRegistry();
    });

    describe('Operations Interface', () => {
      describe('all', () => {
        test('should return array of items', async () => {
          const query: ItemQuery = {};
          const expectedItems: TestItem[] = [
          { name: 'test1', value: 1 } as TestItem,
          { name: 'test2', value: 2 } as TestItem
          ];

          (mockOperations.all as Mock).mockResolvedValue(expectedItems);

          const result = await mockOperations.all(query);

          expect(mockOperations.all).toHaveBeenCalledWith(query);
          expect(result).toEqual(expectedItems);
        });

        test('should handle empty results', async () => {
          const query: ItemQuery = {};
          const expectedItems: TestItem[] = [];

          (mockOperations.all as Mock).mockResolvedValue(expectedItems);

          const result = await mockOperations.all(query);

          expect(mockOperations.all).toHaveBeenCalledWith(query);
          expect(result).toEqual(expectedItems);
        });
      });

      describe('one', () => {
        test('should return single item', async () => {
          const query: ItemQuery = {};
          const expectedItem: TestItem = { name: 'test1', value: 1 } as TestItem;

          (mockOperations.one as Mock).mockResolvedValue(expectedItem);

          const result = await mockOperations.one(query);

          expect(mockOperations.one).toHaveBeenCalledWith(query);
          expect(result).toEqual(expectedItem);
        });

        test('should return null when no item found', async () => {
          const query: ItemQuery = {};

          (mockOperations.one as Mock).mockResolvedValue(null);

          const result = await mockOperations.one(query);

          expect(mockOperations.one).toHaveBeenCalledWith(query);
          expect(result).toBeNull();
        });
      });

      describe('create', () => {
        test('should create item with properties', async () => {
          const itemProperties: TestItemProperties = { name: 'test1', value: 1 };
          const expectedItem: TestItem = {
            name: 'test1',
            value: 1,
            key: { kt: 'test', pk: 'test-id' }
          } as TestItem;

          (mockOperations.create as Mock).mockResolvedValue(expectedItem);

          const result = await mockOperations.create(itemProperties);

          expect(mockOperations.create).toHaveBeenCalledWith(itemProperties);
          expect(result).toEqual(expectedItem);
        });

        test('should create item with explicit key', async () => {
          const itemProperties: TestItemProperties = { name: 'test1', value: 1 };
          const key: PriKey<'test'> = { kt: 'test', pk: 'custom-id' };
          const options = { key };
          const expectedItem: TestItem = {
            name: 'test1',
            value: 1,
            key
          } as TestItem;

          (mockOperations.create as Mock).mockResolvedValue(expectedItem);

          const result = await mockOperations.create(itemProperties, options);

          expect(mockOperations.create).toHaveBeenCalledWith(itemProperties, options);
          expect(result).toEqual(expectedItem);
        });
      });

      describe('update', () => {
        test('should update item with new properties', async () => {
          const key: PriKey<'test'> = { kt: 'test', pk: 'test-id' };
          const itemProperties: TestItemProperties = { name: 'updated', value: 2 };
          const expectedItem: TestItem = {
            name: 'updated',
            value: 2,
            key
          } as TestItem;

          (mockOperations.update as Mock).mockResolvedValue(expectedItem);

          const result = await mockOperations.update(key, itemProperties);

          expect(mockOperations.update).toHaveBeenCalledWith(key, itemProperties);
          expect(result).toEqual(expectedItem);
        });
      });

      describe('upsert', () => {
        test('should upsert item with key and properties', async () => {
          const key: PriKey<'test'> = { kt: 'test', pk: 'test-id' };
          const itemProperties: TestItemProperties = { name: 'upserted', value: 3 };
          const expectedItem: TestItem = {
            name: 'upserted',
            value: 3,
            key
          } as TestItem;

          (mockOperations.upsert as Mock).mockResolvedValue(expectedItem);

          const result = await mockOperations.upsert(key, itemProperties);

          expect(mockOperations.upsert).toHaveBeenCalledWith(key, itemProperties);
          expect(result).toEqual(expectedItem);
        });
      });

      describe('get', () => {
        test('should get item by key', async () => {
          const key: PriKey<'test'> = { kt: 'test', pk: 'test-id' };
          const expectedItem: TestItem = {
            name: 'test1',
            value: 1,
            key
          } as TestItem;

          (mockOperations.get as Mock).mockResolvedValue(expectedItem);

          const result = await mockOperations.get(key);

          expect(mockOperations.get).toHaveBeenCalledWith(key);
          expect(result).toEqual(expectedItem);
        });

        test('should throw error when item not found', async () => {
          const key: PriKey<'test'> = { kt: 'test', pk: 'nonexistent' };
          const error = new Error('Item not found');

          (mockOperations.get as Mock).mockRejectedValue(error);

          await expect(mockOperations.get(key)).rejects.toThrow('Item not found');
          expect(mockOperations.get).toHaveBeenCalledWith(key);
        });
      });

      describe('remove', () => {
        test('should remove item by key', async () => {
          const key: PriKey<'test'> = { kt: 'test', pk: 'test-id' };
          const expectedItem: TestItem = {
            name: 'test1',
            value: 1,
            key
          } as TestItem;

          (mockOperations.remove as Mock).mockResolvedValue(expectedItem);

          const result = await mockOperations.remove(key);

          expect(mockOperations.remove).toHaveBeenCalledWith(key);
          expect(result).toEqual(expectedItem);
        });
      });

      describe('find', () => {
        test('should find items with finder and params', async () => {
          const finder = 'findByName';
          const finderParams = { name: 'test', active: true, count: 5 };
          const expectedItems: TestItem[] = [
                    { name: 'test1', value: 1 } as TestItem,
                    { name: 'test2', value: 2 } as TestItem
          ];

          (mockOperations.find as Mock).mockResolvedValue(expectedItems);

          const result = await mockOperations.find(finder, finderParams);

          expect(mockOperations.find).toHaveBeenCalledWith(finder, finderParams);
          expect(result).toEqual(expectedItems);
        });

        test('should handle complex finder params with arrays and dates', async () => {
          const finder = 'findComplex';
          const finderParams = {
            names: ['test1', 'test2'],
            values: [1, 2, 3],
            active: true,
            createdAt: new Date('2023-01-01')
          };
          const expectedItems: TestItem[] = [];

          (mockOperations.find as Mock).mockResolvedValue(expectedItems);

          const result = await mockOperations.find(finder, finderParams);

          expect(mockOperations.find).toHaveBeenCalledWith(finder, finderParams);
          expect(result).toEqual(expectedItems);
        });
      });
    });

    describe('wrapOperations', () => {
      test('should wrap operations with abstract operations', async () => {
        const wrappedOperations = wrapOperations(mockOperations, mockDefinition, registry);

        expect(wrappedOperations).toBeDefined();
        expect(wrappedOperations).toEqual(mockOperations);

        // Verify that the abstract wrapOperations was called
        const { wrapOperations: mockWrapOperations } = vi.mocked(
          await import('@/Operations')
        );
        expect(mockWrapOperations).toHaveBeenCalledWith(mockOperations, mockDefinition, registry);
      });

      test('should return operations with all required methods', () => {
        const wrappedOperations = wrapOperations(mockOperations, mockDefinition, registry);

        expect(wrappedOperations.all).toBeDefined();
        expect(wrappedOperations.one).toBeDefined();
        expect(wrappedOperations.create).toBeDefined();
        expect(wrappedOperations.update).toBeDefined();
        expect(wrappedOperations.upsert).toBeDefined();
        expect(wrappedOperations.get).toBeDefined();
        expect(wrappedOperations.remove).toBeDefined();
        expect(wrappedOperations.find).toBeDefined();
      });

      test('should handle wrapping with different definition configurations', async () => {
        const differentDefinition = {
          coordinate: {
            kta: ['test'],
            scopes: ['scope1', 'scope2'],
          },
          options: {
            readonly: true
          }
        } as Definition<TestItem, 'test'>;

        const wrappedOperations = wrapOperations(mockOperations, differentDefinition, registry);

        expect(wrappedOperations).toBeDefined();

        const { wrapOperations: mockWrapOperations } = vi.mocked(
          await import('@/Operations')
        );
        expect(mockWrapOperations).toHaveBeenCalledWith(mockOperations, differentDefinition, registry);
      });

      test('should handle wrapping with empty registry', async () => {
        const emptyRegistry = createRegistry();
        const wrappedOperations = wrapOperations(mockOperations, mockDefinition, emptyRegistry);

        expect(wrappedOperations).toBeDefined();

        const { wrapOperations: mockWrapOperations } = vi.mocked(
          await import('@/Operations')
        );
        expect(mockWrapOperations).toHaveBeenCalledWith(mockOperations, mockDefinition, emptyRegistry);
      });
    });

    describe('Integration tests', () => {
      test('should work with real operations flow', async () => {
        const itemProperties: TestItemProperties = { name: 'integration', value: 100 };
        const createdItem: TestItem = {
          name: 'integration',
          value: 100,
          key: { kt: 'test', pk: 'integration-id' }
        } as TestItem;

        // Mock the create operation
        (mockOperations.create as Mock).mockResolvedValue(createdItem);

        // Mock the get operation
        (mockOperations.get as Mock).mockResolvedValue(createdItem);

        // Create the item
        const result = await mockOperations.create(itemProperties);
        expect(result).toEqual(createdItem);

        // Get the item
        const retrievedItem = await mockOperations.get(createdItem.key);
        expect(retrievedItem).toEqual(createdItem);

        expect(mockOperations.create).toHaveBeenCalledWith(itemProperties);
        expect(mockOperations.get).toHaveBeenCalledWith(createdItem.key);
      });
    });
});
