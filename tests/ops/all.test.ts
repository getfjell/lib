import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { Item, LocKey, LocKeyArray } from "@fjell/core";
import { wrapAllOperation } from "../../src/ops/all";
import { Operations } from "../../src/Operations";
import { createRegistry } from "../../src/Registry";
import { createCoordinate } from '@fjell/registry';
import { createOptions } from '../../src/Options';

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

describe('getAllOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'>;
  let mockOptions: any;
  let mockCoordinate: any;
  let allOperation: ReturnType<typeof wrapAllOperation<TestItem, 'test', 'loc1', 'loc2'>>;

  beforeEach(() => {
    mockOperations = {
      all: vi.fn(),
    } as unknown as Operations<TestItem, 'test', 'loc1', 'loc2'>;

    const registry = createRegistry();
    mockOptions = createOptions<TestItem, 'test', 'loc1', 'loc2'>();
    mockCoordinate = createCoordinate(['test', 'loc1', 'loc2'], ['scope1']);

    allOperation = wrapAllOperation(mockOperations, mockOptions, mockCoordinate, registry);
  });

  test('should call wrapped operations all with correct parameters', async () => {
    const itemQuery = { limit: 10, exclusiveStartKey: null };
    const locations: LocKeyArray<'loc1', 'loc2'> = [
      { kt: 'loc1', lk: 'loc1-id' } as LocKey<'loc1'>,
      { kt: 'loc2', lk: 'loc2-id' } as LocKey<'loc2'>
    ];
    const expectedItems: TestItem[] = [
      { name: 'test1' } as TestItem,
      { name: 'test2' } as TestItem
    ];

    (mockOperations.all as Mock).mockResolvedValue(expectedItems);

    const result = await allOperation(itemQuery, locations);

    expect(mockOperations.all).toHaveBeenCalledWith(itemQuery, locations);
    expect(result).toEqual(expectedItems);
  });

  test('should handle empty locations array', async () => {
    const itemQuery = { limit: 10, exclusiveStartKey: null };
    const locations: LocKeyArray<'loc1', 'loc2'> = [
      { kt: 'loc1', lk: 'loc1-id' } as LocKey<'loc1'>,
      { kt: 'loc2', lk: 'loc2-id' } as LocKey<'loc2'>
    ];
    const expectedItems: TestItem[] = [];

    (mockOperations.all as Mock).mockResolvedValue(expectedItems);

    const result = await allOperation(itemQuery, locations);

    expect(mockOperations.all).toHaveBeenCalledWith(itemQuery, locations);
    expect(result).toEqual(expectedItems);
  });

  test('should use undefined for locations if not provided', async () => {
    const itemQuery = { limit: 10, exclusiveStartKey: null };
    const expectedItems: TestItem[] = [];

    (mockOperations.all as Mock).mockResolvedValue(expectedItems);

    const result = await allOperation(itemQuery);
     
    expect(mockOperations.all).toHaveBeenCalledWith(itemQuery, undefined);
    expect(result).toEqual(expectedItems);
  });
});
