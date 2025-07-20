import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Item, LocKey, LocKeyArray } from "@fjell/core";
import { wrapFindOperation } from "@/ops/find";
import { Operations } from "@/Operations";
import { createRegistry, Registry } from "@/Registry";
import { createCoordinate } from '@fjell/registry';
import { createOptions } from '@/Options';

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

describe('wrapFindOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'>;
  let mockCoordinate: any;
  let registry: Registry;

  beforeEach(() => {
    mockOperations = {
      find: vi.fn(),
    } as unknown as Operations<TestItem, 'test', 'loc1', 'loc2'>;

    registry = createRegistry();
    mockCoordinate = createCoordinate(['test'], ['scope1']);
  });

  test('should call wrapped operations find with correct parameters', async () => {
    const mockFinderMethod = vi.fn();
    const customOptions = createOptions<TestItem, 'test', 'loc1', 'loc2'>({
      finders: {
        testFinder: mockFinderMethod
      }
    });
    const findOperation = wrapFindOperation(mockOperations, customOptions, mockCoordinate, registry);
    const finder = 'testFinder';
    const finderParams = { param1: 'value1', param2: 123 };
    const locations: LocKeyArray<'loc1', 'loc2'> = [
      { kt: 'loc1', lk: 'loc1-id' } as LocKey<'loc1'>,
      { kt: 'loc2', lk: 'loc2-id' } as LocKey<'loc2'>
    ];
    const expectedItems: TestItem[] = [
      {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id-1' }
      } as TestItem
    ];

    (mockOperations.find as any).mockResolvedValue(expectedItems);

    const result = await findOperation(finder, finderParams, locations);

    expect(mockOperations.find).toHaveBeenCalledWith(finder, finderParams, locations);
    expect(result).toEqual(expectedItems);
  });

  test('should handle empty locations array', async () => {
    const mockFinderMethod = vi.fn();
    const customOptions = createOptions<TestItem, 'test', 'loc1', 'loc2'>({
      finders: {
        testFinder: mockFinderMethod
      }
    });
    const findOperation = wrapFindOperation(mockOperations, customOptions, mockCoordinate, registry);
    const finder = 'testFinder';
    const finderParams = { param1: 'value1' };
    const expectedItems: TestItem[] = [
      {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id-1' }
      } as TestItem
    ];

    (mockOperations.find as any).mockResolvedValue(expectedItems);

    const result = await findOperation(finder, finderParams);

    expect(mockOperations.find).toHaveBeenCalledWith(finder, finderParams, void 0);
    expect(result).toEqual(expectedItems);
  });

  test('should use default empty array for locations if not provided', async () => {
    const mockFinderMethod = vi.fn();
    const customOptions = createOptions<TestItem, 'test', 'loc1', 'loc2'>({
      finders: {
        testFinder: mockFinderMethod
      }
    });
    const findOperation = wrapFindOperation(mockOperations, customOptions, mockCoordinate, registry);
    const finder = 'testFinder';
    const finderParams = { param1: 'value1' };
    const expectedItems: TestItem[] = [
      {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id-1' }
      } as TestItem
    ];

    (mockOperations.find as any).mockResolvedValue(expectedItems);

    const result = await findOperation(finder, finderParams);

    expect(mockOperations.find).toHaveBeenCalledWith(finder, finderParams, void 0);
    expect(result).toEqual(expectedItems);
  });

  test('should propagate errors from underlying operations', async () => {
    const mockFinderMethod = vi.fn();
    const customOptions = createOptions<TestItem, 'test', 'loc1', 'loc2'>({
      finders: {
        testFinder: mockFinderMethod
      }
    });
    const findOperation = wrapFindOperation(mockOperations, customOptions, mockCoordinate, registry);
    const finder = 'testFinder';
    const finderParams = { param1: 'value1' };
    const findError = new Error('Database error');

    (mockOperations.find as any).mockRejectedValue(findError);

    await expect(findOperation(finder, finderParams)).rejects.toThrow('Database error');
  });

  test('should work with custom finder methods', async () => {
    const mockFinderMethod = vi.fn();
    const customOptions = createOptions<TestItem, 'test', 'loc1', 'loc2'>({
      finders: {
        testFinder: mockFinderMethod
      }
    });

    const findOperation = wrapFindOperation(mockOperations, customOptions, mockCoordinate, registry);
    const finder = 'testFinder';
    const finderParams = { param1: 'value1' };
    const expectedItems: TestItem[] = [
      {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id-1' }
      } as TestItem
    ];

    (mockOperations.find as any).mockResolvedValue(expectedItems);

    const result = await findOperation(finder, finderParams);

    expect(result).toEqual(expectedItems);
  });
});
