import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { Item, LocKey, LocKeyArray } from "@fjell/core";
import { wrapAllOperation } from "@/ops/all";
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
}

describe('getAllOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'>;
  let mockDefinition: Definition<TestItem, 'test', 'loc1', 'loc2'>;
  let allOperation: ReturnType<typeof wrapAllOperation<TestItem, 'test', 'loc1', 'loc2'>>;

  beforeEach(() => {
    mockOperations = {
      all: vi.fn(),
    } as unknown as Operations<TestItem, 'test', 'loc1', 'loc2'>;

    const registry = createRegistry();
    mockDefinition = {} as Definition<TestItem, 'test', 'loc1', 'loc2'>;

    allOperation = wrapAllOperation(mockOperations, mockDefinition, registry);
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

    // eslint-disable-next-line no-undefined
    expect(mockOperations.all).toHaveBeenCalledWith(itemQuery, undefined);
    expect(result).toEqual(expectedItems);
  });
});
