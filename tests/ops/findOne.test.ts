import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { Item, LocKey, LocKeyArray } from "@fjell/core";
import { wrapFindOneOperation } from "@/ops/findOne";
import { Definition } from "@/Definition";
import { Operations } from "@/Operations";
import { createRegistry } from "@/Registry";

vi.mock('@fjell/logging', () => {
  const logger = {
    get: vi.fn().mockReturnThis(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    emergency: vi.fn(),
    default: vi.fn(),
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

interface TestItem extends Item<'test', 'loc1', 'loc2'> {
  name: string;
  id: string;
}

describe('wrapFindOneOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'>;
  let mockDefinition: Definition<TestItem, 'test', 'loc1', 'loc2'>;
  let findOneOperation: ReturnType<typeof wrapFindOneOperation<TestItem, 'test', 'loc1', 'loc2'>>;

  beforeEach(() => {
    mockOperations = {
      findOne: vi.fn(),
    } as unknown as Operations<TestItem, 'test', 'loc1', 'loc2'>;

    const registry = createRegistry();
    mockDefinition = {} as Definition<TestItem, 'test', 'loc1', 'loc2'>;

    findOneOperation = wrapFindOneOperation(mockOperations, mockDefinition, registry);
  });

  test('should call wrapped operations findOne with correct parameters', async () => {
    const finder = 'byName';
    const finderParams = { name: 'testItem', status: 'active' };
    const locations: LocKeyArray<'loc1', 'loc2'> = [
      { kt: 'loc1', lk: 'loc1-id' } as LocKey<'loc1'>,
      { kt: 'loc2', lk: 'loc2-id' } as LocKey<'loc2'>
    ];
    const expectedItem: TestItem = {
      name: 'testItem',
      id: 'test-id-123'
    } as TestItem;

    (mockOperations.findOne as Mock).mockResolvedValue(expectedItem);

    const result = await findOneOperation(finder, finderParams, locations);

    expect(mockOperations.findOne).toHaveBeenCalledWith(finder, finderParams, locations);
    expect(result).toEqual(expectedItem);
  });

  test('should handle findOne with minimal parameters', async () => {
    const finder = 'byId';
    const finderParams = { id: 'test-123' };
    const expectedItem: TestItem = {
      name: 'foundItem',
      id: 'test-123'
    } as TestItem;

    (mockOperations.findOne as Mock).mockResolvedValue(expectedItem);

    const result = await findOneOperation(finder, finderParams);

    // eslint-disable-next-line no-undefined
    expect(mockOperations.findOne).toHaveBeenCalledWith(finder, finderParams, undefined);
    expect(result).toEqual(expectedItem);
  });

  test('should handle empty locations array', async () => {
    const finder = 'byEmail';
    const finderParams = { email: 'test@example.com' };
    const locations: [] = [];
    const expectedItem: TestItem = {
      name: 'userItem',
      id: 'user-456'
    } as TestItem;

    (mockOperations.findOne as Mock).mockResolvedValue(expectedItem);

    const result = await findOneOperation(finder, finderParams, locations);

    expect(mockOperations.findOne).toHaveBeenCalledWith(finder, finderParams, locations);
    expect(result).toEqual(expectedItem);
  });

  test('should handle complex finder parameters with various data types', async () => {
    const finder = 'complexSearch';
    const finderParams = {
      name: 'testItem',
      count: 42,
      isActive: true,
      createdAt: new Date('2023-01-01'),
      tags: ['tag1', 'tag2', 'tag3'],
      scores: [95, 87, 92]
    };
    const expectedItem: TestItem = {
      name: 'complexItem',
      id: 'complex-789'
    } as TestItem;

    (mockOperations.findOne as Mock).mockResolvedValue(expectedItem);

    const result = await findOneOperation(finder, finderParams);

    // eslint-disable-next-line no-undefined
    expect(mockOperations.findOne).toHaveBeenCalledWith(finder, finderParams, undefined);
    expect(result).toEqual(expectedItem);
  });

  test('should propagate errors from underlying findOne operation', async () => {
    const finder = 'errorFinder';
    const finderParams = { id: 'error-id' };
    const error = new Error('Database connection failed');

    (mockOperations.findOne as Mock).mockRejectedValue(error);

    await expect(findOneOperation(finder, finderParams))
      .rejects
      .toThrow('Database connection failed');

    // eslint-disable-next-line no-undefined
    expect(mockOperations.findOne).toHaveBeenCalledWith(finder, finderParams, undefined);
  });

  test('should handle null return from underlying findOne operation', async () => {
    const finder = 'notFoundFinder';
    const finderParams = { id: 'nonexistent-id' };

    (mockOperations.findOne as Mock).mockResolvedValue(null);

    const result = await findOneOperation(finder, finderParams);

    expect(result).toBeNull();
    // eslint-disable-next-line no-undefined
    expect(mockOperations.findOne).toHaveBeenCalledWith(finder, finderParams, undefined);
  });

  test('should handle undefined return from underlying findOne operation', async () => {
    const finder = 'undefinedFinder';
    const finderParams = { id: 'undefined-id' };

    // eslint-disable-next-line no-undefined
    (mockOperations.findOne as Mock).mockResolvedValue(undefined);

    const result = await findOneOperation(finder, finderParams);

    expect(result).toBeUndefined();
    // eslint-disable-next-line no-undefined
    expect(mockOperations.findOne).toHaveBeenCalledWith(finder, finderParams, undefined);
  });

  test('should work with single location key', async () => {
    type SingleLocItem = Item<'test', 'loc1'>;
    const singleLocOperations = {
      findOne: vi.fn(),
    } as unknown as Operations<SingleLocItem, 'test', 'loc1'>;

    const registry = createRegistry();
    const singleLocDefinition = {} as Definition<SingleLocItem, 'test', 'loc1'>;
    const singleLocFindOne = wrapFindOneOperation(singleLocOperations, singleLocDefinition, registry);

    const finder = 'singleLocFinder';
    const finderParams = { name: 'singleLoc' };
    const locations: LocKeyArray<'loc1'> = [
      { kt: 'loc1', lk: 'single-loc-id' } as LocKey<'loc1'>
    ];
    const expectedItem = { name: 'singleLoc' } as unknown as SingleLocItem;

    (singleLocOperations.findOne as Mock).mockResolvedValue(expectedItem);

    const result = await singleLocFindOne(finder, finderParams, locations);

    expect(singleLocOperations.findOne).toHaveBeenCalledWith(finder, finderParams, locations);
    expect(result).toEqual(expectedItem);
  });

  test('should work with no location keys', async () => {
    type NoLocItem = Item<'test'>;
    const noLocOperations = {
      findOne: vi.fn(),
    } as unknown as Operations<NoLocItem, 'test'>;

    const registry = createRegistry();
    const noLocDefinition = {} as Definition<NoLocItem, 'test'>;
    const noLocFindOne = wrapFindOneOperation(noLocOperations, noLocDefinition, registry);

    const finder = 'noLocFinder';
    const finderParams = { name: 'noLoc' };
    const expectedItem = { name: 'noLoc' } as unknown as NoLocItem;

    (noLocOperations.findOne as Mock).mockResolvedValue(expectedItem);

    const result = await noLocFindOne(finder, finderParams);

    // eslint-disable-next-line no-undefined
    expect(noLocOperations.findOne).toHaveBeenCalledWith(finder, finderParams, undefined);
    expect(result).toEqual(expectedItem);
  });

  test('should maintain function reference consistency', () => {
    const registry = createRegistry();
    const findOne1 = wrapFindOneOperation(mockOperations, mockDefinition, registry);
    const findOne2 = wrapFindOneOperation(mockOperations, mockDefinition, registry);

    // Each call should return a new function instance
    expect(findOne1).not.toBe(findOne2);
    expect(typeof findOne1).toBe('function');
    expect(typeof findOne2).toBe('function');
  });
});
