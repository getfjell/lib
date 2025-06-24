import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComKey, Item, ItemQuery, LocKeyArray, PriKey, TypesProperties } from "@fjell/core";

import { Operations, wrapOperations } from "@/contained/Operations";
import { Operations as AbstractOperations, wrapOperations as wrapAbstractOperations } from "@/Operations";
import { Definition } from "@/Definition";
import { Registry } from "@/Registry";

// Mock the abstract operations wrapper
vi.mock("@/Operations", () => ({
  wrapOperations: vi.fn(),
  Operations: {}
}));

// Mock dependencies
vi.mock("@/Definition");
vi.mock("@/Registry");

describe('Operations', () => {
  // Define test types
  type TestItem = Item<'test', 'loc1', 'loc2'>;
  type TestLocArray = LocKeyArray<'loc1', 'loc2'>;
  type TestComKey = ComKey<'test', 'loc1', 'loc2'>;
  type TestPriKey = PriKey<'test'>;
  type TestProperties = TypesProperties<TestItem, 'test', 'loc1', 'loc2'>;

  let mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'>;
  let mockDefinition: Definition<TestItem, 'test', 'loc1', 'loc2'>;
  let mockRegistry: Registry;
  let mockAbstractOperations: AbstractOperations<TestItem, 'test', 'loc1', 'loc2'>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock operations with all required methods
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

    mockDefinition = {} as Definition<TestItem, 'test', 'loc1', 'loc2'>;
    mockRegistry = {} as Registry;

    // Mock the abstract operations that would be returned
    mockAbstractOperations = {
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

    (wrapAbstractOperations as any).mockReturnValue(mockAbstractOperations);
  });

  describe('wrapOperations', () => {
    it('should call wrapAbstractOperations with correct parameters', () => {
      const result = wrapOperations(mockOperations, mockDefinition, mockRegistry);

      expect(wrapAbstractOperations).toHaveBeenCalledWith(
        mockOperations,
        mockDefinition,
        mockRegistry
      );
      expect(result).toBeDefined();
    });

    it('should return an operations object with all abstract operations methods', () => {
      const result = wrapOperations(mockOperations, mockDefinition, mockRegistry);

      expect(result).toEqual(mockAbstractOperations);
      expect(result).toBeDefined();
    });

    it('should preserve all operations methods from abstract wrapper', () => {
      const result = wrapOperations(mockOperations, mockDefinition, mockRegistry);

      expect(result.all).toBe(mockAbstractOperations.all);
      expect(result.one).toBe(mockAbstractOperations.one);
      expect(result.create).toBe(mockAbstractOperations.create);
      expect(result.update).toBe(mockAbstractOperations.update);
      expect(result.upsert).toBe(mockAbstractOperations.upsert);
      expect(result.get).toBe(mockAbstractOperations.get);
      expect(result.remove).toBe(mockAbstractOperations.remove);
      expect(result.find).toBe(mockAbstractOperations.find);
      expect(result.findOne).toBe(mockAbstractOperations.findOne);
      expect(result.action).toBe(mockAbstractOperations.action);
    });
  });

  describe('Operations interface contract', () => {
    it('should define all required methods with correct signatures', () => {
      // This test ensures the interface is properly typed
      const operations: Operations<TestItem, 'test', 'loc1', 'loc2'> = mockOperations;

      expect(typeof operations.all).toBe('function');
      expect(typeof operations.one).toBe('function');
      expect(typeof operations.create).toBe('function');
      expect(typeof operations.update).toBe('function');
      expect(typeof operations.upsert).toBe('function');
      expect(typeof operations.get).toBe('function');
      expect(typeof operations.remove).toBe('function');
      expect(typeof operations.find).toBe('function');
      expect(typeof operations.findOne).toBe('function');
      expect(typeof operations.action).toBe('function');
    });

    describe('method signature validation', () => {
      it('should validate all method accepts ItemQuery and locations', async () => {
        const itemQuery = {} as ItemQuery;
        const locations: TestLocArray | [] = [];

        await mockOperations.all(itemQuery, locations);

        expect(mockOperations.all).toHaveBeenCalledWith(itemQuery, locations);
      });

      it('should validate one method accepts ItemQuery and locations', async () => {
        const itemQuery = {} as ItemQuery;
        const locations: TestLocArray | [] = [];

        await mockOperations.one(itemQuery, locations);

        expect(mockOperations.one).toHaveBeenCalledWith(itemQuery, locations);
      });

      it('should validate create method accepts item properties and optional locations', async () => {
        const itemProperties = {} as TestProperties;
        const options = { locations: [] as any };

        await mockOperations.create(itemProperties, options);

        expect(mockOperations.create).toHaveBeenCalledWith(itemProperties, options);
      });

      it('should validate create method works without options', async () => {
        const itemProperties = {} as TestProperties;

        await mockOperations.create(itemProperties);

        expect(mockOperations.create).toHaveBeenCalledWith(itemProperties);
      });

      it('should validate update method accepts ComKey and item properties', async () => {
        const key = {} as TestComKey;
        const itemProperties = {} as TestProperties;

        await mockOperations.update(key, itemProperties);

        expect(mockOperations.update).toHaveBeenCalledWith(key, itemProperties);
      });

      it('should validate upsert method accepts ComKey and item properties', async () => {
        const key = {} as TestComKey;
        const itemProperties = {} as TestProperties;

        await mockOperations.upsert(key, itemProperties);

        expect(mockOperations.upsert).toHaveBeenCalledWith(key, itemProperties);
      });

      it('should validate get method accepts ComKey', async () => {
        const comKey = {} as TestComKey;

        await mockOperations.get(comKey);

        expect(mockOperations.get).toHaveBeenCalledWith(comKey);
      });

      it('should validate get method accepts PriKey', async () => {
        const priKey = {} as TestPriKey;

        await mockOperations.get(priKey);

        expect(mockOperations.get).toHaveBeenCalledWith(priKey);
      });

      it('should validate remove method accepts ComKey', async () => {
        const key = {} as TestComKey;

        await mockOperations.remove(key);

        expect(mockOperations.remove).toHaveBeenCalledWith(key);
      });

      it('should validate find method accepts finder string, params, and locations', async () => {
        const finder = 'testFinder';
        const finderParams = { param1: 'value1', param2: 123 };
        const locations: TestLocArray | [] = [];

        await mockOperations.find(finder, finderParams, locations);

        expect(mockOperations.find).toHaveBeenCalledWith(finder, finderParams, locations);
      });

      it('should validate findOne method accepts finder string, params, and locations', async () => {
        const finder = 'testFinder';
        const finderParams = { param1: 'value1', param2: 123 };
        const locations: TestLocArray | [] = [];

        await mockOperations.findOne(finder, finderParams, locations);

        expect(mockOperations.findOne).toHaveBeenCalledWith(finder, finderParams, locations);
      });

      it('should validate action method accepts key, action key, and params', async () => {
        const comKey = {} as TestComKey;
        const actionKey = 'testAction';
        const actionParams = { param1: 'value1', param2: true };

        await mockOperations.action(comKey, actionKey, actionParams);

        expect(mockOperations.action).toHaveBeenCalledWith(comKey, actionKey, actionParams);
      });

      it('should validate action method accepts PriKey', async () => {
        const priKey = {} as TestPriKey;
        const actionKey = 'testAction';
        const actionParams = { param1: 'value1' };

        await mockOperations.action(priKey, actionKey, actionParams);

        expect(mockOperations.action).toHaveBeenCalledWith(priKey, actionKey, actionParams);
      });
    });

    describe('return type validation', () => {
      it('should validate all method returns Promise<V[]>', async () => {
        const mockResult = [{} as TestItem];
        (mockOperations.all as any).mockResolvedValue(mockResult);

        const result = await mockOperations.all({} as ItemQuery, []);

        expect(result).toBe(mockResult);
        expect(Array.isArray(result)).toBe(true);
      });

      it('should validate one method returns Promise<V | null>', async () => {
        const mockResult = {} as TestItem;
        (mockOperations.one as any).mockResolvedValue(mockResult);

        const result = await mockOperations.one({} as ItemQuery, []);

        expect(result).toBe(mockResult);
      });

      it('should validate one method can return null', async () => {
        (mockOperations.one as any).mockResolvedValue(null);

        const result = await mockOperations.one({} as ItemQuery, []);

        expect(result).toBeNull();
      });

      it('should validate create method returns Promise<V>', async () => {
        const mockResult = {} as TestItem;
        (mockOperations.create as any).mockResolvedValue(mockResult);

        const result = await mockOperations.create({} as TestProperties);

        expect(result).toBe(mockResult);
      });

      it('should validate update method returns Promise<V>', async () => {
        const mockResult = {} as TestItem;
        (mockOperations.update as any).mockResolvedValue(mockResult);

        const result = await mockOperations.update({} as TestComKey, {} as TestProperties);

        expect(result).toBe(mockResult);
      });

      it('should validate upsert method returns Promise<V>', async () => {
        const mockResult = {} as TestItem;
        (mockOperations.upsert as any).mockResolvedValue(mockResult);

        const result = await mockOperations.upsert({} as TestComKey, {} as TestProperties);

        expect(result).toBe(mockResult);
      });

      it('should validate get method returns Promise<V>', async () => {
        const mockResult = {} as TestItem;
        (mockOperations.get as any).mockResolvedValue(mockResult);

        const result = await mockOperations.get({} as TestComKey);

        expect(result).toBe(mockResult);
      });

      it('should validate remove method returns Promise<V>', async () => {
        const mockResult = {} as TestItem;
        (mockOperations.remove as any).mockResolvedValue(mockResult);

        const result = await mockOperations.remove({} as TestComKey);

        expect(result).toBe(mockResult);
      });

      it('should validate find method returns Promise<V[]>', async () => {
        const mockResult = [{} as TestItem];
        (mockOperations.find as any).mockResolvedValue(mockResult);

        const result = await mockOperations.find('finder', {}, []);

        expect(result).toBe(mockResult);
        expect(Array.isArray(result)).toBe(true);
      });

      it('should validate findOne method returns Promise<V>', async () => {
        const mockResult = {} as TestItem;
        (mockOperations.findOne as any).mockResolvedValue(mockResult);

        const result = await mockOperations.findOne('finder', {}, []);

        expect(result).toBe(mockResult);
      });

      it('should validate action method returns Promise<V>', async () => {
        const mockResult = {} as TestItem;
        (mockOperations.action as any).mockResolvedValue(mockResult);

        const result = await mockOperations.action({} as TestComKey, 'action', {});

        expect(result).toBe(mockResult);
      });
    });
  });

  describe('parameter type validation', () => {
    it('should accept various parameter types in finderParams', async () => {
      const finderParams = {
        stringParam: 'test',
        numberParam: 123,
        booleanParam: true,
        dateParam: new Date(),
        stringArrayParam: ['a', 'b'],
        numberArrayParam: [1, 2, 3],
        booleanArrayParam: [true, false],
        dateArrayParam: [new Date(), new Date()]
      };

      await mockOperations.find('finder', finderParams, []);

      expect(mockOperations.find).toHaveBeenCalledWith('finder', finderParams, []);
    });

    it('should accept various parameter types in actionParams', async () => {
      const actionParams = {
        stringParam: 'test',
        numberParam: 456,
        booleanParam: false,
        dateParam: new Date(),
        arrayParam: ['x', 'y', 'z']
      };

      await mockOperations.action({} as TestComKey, 'action', actionParams);

      expect(mockOperations.action).toHaveBeenCalledWith({} as TestComKey, 'action', actionParams);
    });
  });
});
