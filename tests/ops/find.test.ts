import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { Item, LocKey, LocKeyArray } from "@fjell/core";
import { wrapFindOperation } from "@/ops/find";
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

describe('getFindOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'>;
  let mockDefinition: Definition<TestItem, 'test', 'loc1', 'loc2'>;
  let findOperation: ReturnType<typeof wrapFindOperation<TestItem, 'test', 'loc1', 'loc2'>>;

  beforeEach(() => {
    mockOperations = {
      find: vi.fn(),
    } as unknown as Operations<TestItem, 'test', 'loc1', 'loc2'>;

    const registry = createRegistry();
    mockDefinition = {} as Definition<TestItem, 'test', 'loc1', 'loc2'>;

    findOperation = wrapFindOperation(mockOperations, mockDefinition, registry);
  });

  test('should call wrapped operations find with correct parameters', async () => {
    const finder = 'testFinder';
    const finderParams = { param1: 'value1', param2: 123 };
    const locations: LocKeyArray<'loc1', 'loc2'> = [
      { kt: 'loc1', lk: 'loc1-id' } as LocKey<'loc1'>,
      { kt: 'loc2', lk: 'loc2-id' } as LocKey<'loc2'>
    ];
    const expectedItems: TestItem[] = [
      { name: 'test1' } as TestItem,
      { name: 'test2' } as TestItem
    ];

    (mockOperations.find as Mock).mockResolvedValue(expectedItems);

    const result = await findOperation(finder, finderParams, locations);

    expect(mockOperations.find).toHaveBeenCalledWith(finder, finderParams, locations);
    expect(result).toEqual(expectedItems);
  });

  test('should handle empty locations array', async () => {
    const finder = 'testFinder';
    const finderParams = { param1: 'value1' };
    const locations: LocKeyArray<'loc1', 'loc2'> = [
      { kt: 'loc1', lk: 'loc1-id' } as LocKey<'loc1'>,
      { kt: 'loc2', lk: 'loc2-id' } as LocKey<'loc2'>
    ];
    const expectedItems: TestItem[] = [];

    (mockOperations.find as Mock).mockResolvedValue(expectedItems);

    const result = await findOperation(finder, finderParams, locations);

    expect(mockOperations.find).toHaveBeenCalledWith(finder, finderParams, locations);
    expect(result).toEqual(expectedItems);
  });

  test('should use default empty array for locations if not provided', async () => {
    const finder = 'testFinder';
    const finderParams = { param1: 'value1' };
    const expectedItems: TestItem[] = [];

    (mockOperations.find as Mock).mockResolvedValue(expectedItems);

    const result = await findOperation(finder, finderParams);

    // eslint-disable-next-line no-undefined
    expect(mockOperations.find).toHaveBeenCalledWith(finder, finderParams, undefined);
    expect(result).toEqual(expectedItems);
  });
});
