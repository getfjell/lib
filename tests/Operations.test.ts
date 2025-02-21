import { Definition } from "@/Definition";
import { createReadOnlyOperations, Operations, wrapOperations } from "@/Operations";
import { ComKey, Item, ItemQuery, LocKeyArray, PriKey, TypesProperties } from "@fjell/core";

jest.mock('@fjell/logging', () => {
  return {
    get: jest.fn().mockReturnThis(),
    getLogger: jest.fn().mockReturnThis(),
    default: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    emergency: jest.fn(),
    alert: jest.fn(),
    critical: jest.fn(),
    notice: jest.fn(),
    time: jest.fn().mockReturnThis(),
    end: jest.fn(),
    log: jest.fn(),
  }
});

describe('Operations', () => {
  // Mock interfaces and types
  interface TestItem extends Item<'test', 'loc1', 'loc2'> {
    name: string;
  }

  type TestItemProperties = TypesProperties<TestItem, 'test', 'loc1', 'loc2'>;

  // Mock operations implementation
  const mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'> = {
    all: jest.fn(),
    one: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
    find: jest.fn()
  };

  // Mock definition
  const mockDefinition = {} as Definition<TestItem, 'test', 'loc1', 'loc2'>;

  describe('createOperations', () => {
    const operations = wrapOperations(mockOperations, mockDefinition);

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
      const locations = [{kt: 'loc1', lk: '1'}, {kt: 'loc2', lk: '2'}] as LocKeyArray<'loc1', 'loc2'>;
      
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
      const locations = [{kt: 'loc1', lk: '1'}, {kt: 'loc2', lk: '2'}] as LocKeyArray<'loc1', 'loc2'>;

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
