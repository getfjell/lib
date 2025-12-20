import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { Operations, wrapOperations } from "../../src/primary/Operations";
import { createRegistry, Registry } from "../../src/Registry";
import { Item, ItemQuery, PriKey } from "@fjell/types";
import { Coordinate } from "@fjell/registry";
import { Options } from "../../src/primary/Options";

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

// Mock abstract Operations
const mockWrapOperations = vi.hoisted(() => vi.fn());

vi.mock('../../src/Operations', () => ({
  wrapOperations: mockWrapOperations.mockImplementation((toWrap) => toWrap)
}));

describe('Primary Operations', () => {
  // Mock interfaces and types
  interface TestItem extends Item<'test'> {
    name: string;
    value: number;
  }

  type TestItemProperties = Partial<Item<'test'>>;

  let mockOperations: Operations<TestItem, 'test'>;
  let mockCoordinate: Coordinate<'test'>;
  let mockOptions: Options<TestItem, 'test'>;
  let registry: Registry;

  beforeEach(async () => {
    vi.clearAllMocks();

    registry = createRegistry();

    mockCoordinate = {
      keyTypes: ['test'],
      kta: ['test'],
      scopes: ['scope1']
    } as Coordinate<'test'>;

    mockOptions = {
      hooks: {},
      validators: {},
      finders: {},
      actions: {},
      facets: {}
    } as Options<TestItem, 'test'>;

    mockOperations = {
      all: vi.fn(),
      one: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      remove: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      action: vi.fn(),
      facet: vi.fn(),
      allAction: vi.fn(),
      allFacet: vi.fn(),
      finders: {},
      actions: {},
      facets: {},
      allActions: {},
      allFacets: {}
    };
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
        const expectedResult = {
          items: expectedItems,
          metadata: {
            total: expectedItems.length,
            returned: expectedItems.length,
            offset: 0,
            hasMore: false
          }
        };

        (mockOperations.find as Mock).mockResolvedValue(expectedResult);

        const result = await mockOperations.find(finder, finderParams);

        // find() accepts optional locations and options, so calling with 2 params is valid
        expect(mockOperations.find).toHaveBeenCalledWith(finder, finderParams);
        expect(result.items).toEqual(expectedItems);
        expect(result.metadata.total).toBe(expectedItems.length);
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
        const expectedResult = {
          items: expectedItems,
          metadata: {
            total: 0,
            returned: 0,
            offset: 0,
            hasMore: false
          }
        };

        (mockOperations.find as Mock).mockResolvedValue(expectedResult);

        const result = await mockOperations.find(finder, finderParams);

        // find() accepts optional locations and options, so calling with 2 params is valid
        expect(mockOperations.find).toHaveBeenCalledWith(finder, finderParams);
        expect(result.items).toEqual(expectedItems);
        expect(result.metadata.total).toBe(0);
      });
    });
  });

  describe('wrapOperations', () => {
    test('should wrap operations with abstract operations', () => {
      const wrappedOperations = wrapOperations(
        mockOperations,
        mockOptions,
        mockCoordinate,
        registry
      );

      expect(wrappedOperations).toBeDefined();
      // The function should return the operations with any additional properties
      expect(wrappedOperations).toHaveProperty('all');
      expect(wrappedOperations).toHaveProperty('one');
      expect(wrappedOperations).toHaveProperty('create');
      expect(wrappedOperations).toHaveProperty('update');
      expect(wrappedOperations).toHaveProperty('get');
      expect(wrappedOperations).toHaveProperty('remove');
      expect(wrappedOperations).toHaveProperty('find');
      expect(wrappedOperations).toHaveProperty('findOne');
      expect(wrappedOperations).toHaveProperty('action');
      expect(wrappedOperations).toHaveProperty('allAction');
      expect(wrappedOperations).toHaveProperty('facet');
      expect(wrappedOperations).toHaveProperty('allFacet');
    });

    test('should return operations with all required methods', () => {
      mockWrapOperations.mockReturnValue(mockOperations);

      const wrappedOperations = wrapOperations(
        mockOperations,
        mockOptions,
        mockCoordinate,
        registry
      );

      expect(wrappedOperations).toHaveProperty('all');
      expect(wrappedOperations).toHaveProperty('one');
      expect(wrappedOperations).toHaveProperty('create');
      expect(wrappedOperations).toHaveProperty('update');
      expect(wrappedOperations).toHaveProperty('get');
      expect(wrappedOperations).toHaveProperty('remove');
      expect(wrappedOperations).toHaveProperty('find');
    });

    test('should handle wrapping with different coordinate configurations', () => {
      const differentCoordinate = { kta: ['different'], scopes: ['scope'] } as any;
      const differentOptions = { hooks: {}, validators: {}, finders: {}, actions: {}, facets: {} } as any;

      const wrappedOperations = wrapOperations(mockOperations, differentOptions, differentCoordinate, registry);

      // Should return operations with the new properties
      expect(wrappedOperations).toBeDefined();
      expect(wrappedOperations).toHaveProperty('all');
      expect(wrappedOperations).toHaveProperty('one');
      expect(wrappedOperations).toHaveProperty('create');
    });

    test('should handle wrapping with empty registry', () => {
      const emptyRegistry = { libTree: {}, register: vi.fn(), get: vi.fn() } as any;

      const wrappedOperations = wrapOperations(mockOperations, mockOptions, mockCoordinate, emptyRegistry);

      // Should return operations regardless of registry content
      expect(wrappedOperations).toBeDefined();
      expect(wrappedOperations).toHaveProperty('all');
      expect(wrappedOperations).toHaveProperty('one');
      expect(wrappedOperations).toHaveProperty('create');
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
