import { describe, expect, test, vi } from 'vitest';
import { createReadOnlyOperations, Operations, wrapOperations } from "../src/Operations";
import { createRegistry } from "../src/Registry";
import { ComKey, Item, ItemQuery, LocKeyArray, PriKey } from "@fjell/core";
import { createCoordinate } from '@fjell/registry';
import { createOptions } from '../src/Options';

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

describe('Operations', () => {
  // Mock interfaces and types
  interface TestItem extends Item<'test', 'loc1', 'loc2'> {
    name: string;
  }

  type TestItemProperties = Partial<Item<'test', 'loc1', 'loc2'>>;

  // Mock operations implementation
  const mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'> = {
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

  // Mock coordinate and options
  const mockCoordinate = createCoordinate(['test'], ['scope1']);
  const mockOptions = createOptions<TestItem, 'test', 'loc1', 'loc2'>();

  describe('createOperations', () => {
    const registry = createRegistry();
    const operations = wrapOperations(mockOperations, mockOptions, mockCoordinate, registry);

    test('should create operations object with all methods', () => {
      expect(operations.all).toBeDefined();
      expect(operations.one).toBeDefined();
      expect(operations.create).toBeDefined();
      expect(operations.update).toBeDefined();
      expect(operations.upsert).toBeDefined();
      expect(operations.get).toBeDefined();
      expect(operations.remove).toBeDefined();
      expect(operations.find).toBeDefined();
    });
  });

  describe('createReadOnlyOperations', () => {
    const readOnlyOps = createReadOnlyOperations(mockOperations);

    test('should pass through read operations unchanged', async () => {
      const query = {} as ItemQuery;
      const locations = [{ kt: 'loc1', lk: '1' }, { kt: 'loc2', lk: '2' }] as LocKeyArray<'loc1', 'loc2'>;

      await readOnlyOps.all(query, locations);
      expect(mockOperations.all).toHaveBeenCalledWith(query, locations);

      await readOnlyOps.one(query, locations);
      expect(mockOperations.one).toHaveBeenCalledWith(query, locations);

      await readOnlyOps.get({} as ComKey<'test', 'loc1', 'loc2'>);
      expect(mockOperations.get).toHaveBeenCalled();

      const finder = 'testFinder';
      const params = { param: 'value' };
      await readOnlyOps.find(finder, params, locations);
      expect(mockOperations.find).toHaveBeenCalledWith(finder, params, locations);
    });

    test('should return empty objects for write operations', async () => {
      const item = {} as TestItemProperties;
      const key = {} as PriKey<'test'>;
      const locations = [{ kt: 'loc1', lk: '1' }, { kt: 'loc2', lk: '2' }] as LocKeyArray<'loc1', 'loc2'>;

      const createResult = await readOnlyOps.create(item, { locations });
      expect(createResult).toEqual({});

      const updateResult = await readOnlyOps.update(key, item);
      expect(updateResult).toEqual({});

      const upsertResult = await readOnlyOps.upsert(key, item, locations);
      expect(upsertResult).toEqual({});

      const removeResult = await readOnlyOps.remove(key);
      expect(removeResult).toEqual({});
    });
  });
});
