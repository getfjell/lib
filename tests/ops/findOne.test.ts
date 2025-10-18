import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Item, LocKey, LocKeyArray } from "@fjell/core";
import { wrapFindOneOperation } from "../../src/ops/findOne";
import { Operations } from "../../src/Operations";
import { createRegistry, Registry } from "../../src/Registry";
import { createCoordinate } from '@fjell/core';
import { createOptions, Options } from '../../src/Options';

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
}

describe('wrapFindOneOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'>;
  let mockOptions: Options<TestItem, 'test', 'loc1', 'loc2'>;
  let mockCoordinate: any;
  let registry: Registry;

  beforeEach(() => {
    mockOperations = {
      findOne: vi.fn(),
    } as unknown as Operations<TestItem, 'test', 'loc1', 'loc2'>;

    registry = createRegistry();
    mockOptions = createOptions<TestItem, 'test', 'loc1', 'loc2'>();
    mockCoordinate = createCoordinate(['test', 'loc1', 'loc2'], ['scope1']);
  });

  test('should call wrapped operations findOne with correct parameters', async () => {
    const findOneOperation = wrapFindOneOperation(mockOperations, mockOptions, mockCoordinate, registry);
    const finder = 'testFinder';
    const finderParams = { param1: 'value1', param2: 123 };
    const locations: LocKeyArray<'loc1', 'loc2'> = [
      { kt: 'loc1', lk: 'loc1-id' } as LocKey<'loc1'>,
      { kt: 'loc2', lk: 'loc2-id' } as LocKey<'loc2'>
    ];
    const expectedItem: TestItem = {
      name: 'test1',
      key: { kt: 'test', pk: 'test-id' }
    } as TestItem;

    (mockOperations.findOne as any).mockResolvedValue(expectedItem);

    const result = await findOneOperation(finder, finderParams, locations);

    expect(mockOperations.findOne).toHaveBeenCalledWith(finder, finderParams, locations);
    expect(result).toEqual(expectedItem);
  });

  test('should handle empty locations array', async () => {
    const findOneOperation = wrapFindOneOperation(mockOperations, mockOptions, mockCoordinate, registry);
    const finder = 'testFinder';
    const finderParams = { param1: 'value1' };
    const expectedItem: TestItem = {
      name: 'test1',
      key: { kt: 'test', pk: 'test-id' }
    } as TestItem;

    (mockOperations.findOne as any).mockResolvedValue(expectedItem);

    const result = await findOneOperation(finder, finderParams);

    expect(mockOperations.findOne).toHaveBeenCalledWith(finder, finderParams, []);
    expect(result).toEqual(expectedItem);
  });

  test('should propagate errors from underlying operations', async () => {
    const findOneOperation = wrapFindOneOperation(mockOperations, mockOptions, mockCoordinate, registry);
    const finder = 'testFinder';
    const finderParams = { param1: 'value1' };
    const findError = new Error('Database error');

    (mockOperations.findOne as any).mockRejectedValue(findError);

    await expect(findOneOperation(finder, finderParams)).rejects.toThrow('Database error');
  });
});
