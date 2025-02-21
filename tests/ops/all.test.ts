import { Item, LocKey, LocKeyArray } from "@fjell/core";
import { wrapAllOperation } from "@/ops/all";
import { Definition } from "@/Definition";
import { Operations } from "@/Operations";

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

interface TestItem extends Item<'test', 'loc1', 'loc2'> {
  name: string;
}

describe('getAllOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'>;
  let mockDefinition: Definition<TestItem, 'test', 'loc1', 'loc2'>;
  let allOperation: ReturnType<typeof wrapAllOperation<TestItem, 'test', 'loc1', 'loc2'>>;

  beforeEach(() => {
    mockOperations = {
      all: jest.fn(),
    } as unknown as Operations<TestItem, 'test', 'loc1', 'loc2'>;

    mockDefinition = {} as Definition<TestItem, 'test', 'loc1', 'loc2'>;

    allOperation = wrapAllOperation(mockOperations, mockDefinition);
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

    (mockOperations.all as jest.Mock).mockResolvedValue(expectedItems);

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

    (mockOperations.all as jest.Mock).mockResolvedValue(expectedItems);

    const result = await allOperation(itemQuery, locations);

    expect(mockOperations.all).toHaveBeenCalledWith(itemQuery, locations);
    expect(result).toEqual(expectedItems);
  });

  test('should use undefined for locations if not provided', async () => {
    const itemQuery = { limit: 10, exclusiveStartKey: null };
    const expectedItems: TestItem[] = [];

    (mockOperations.all as jest.Mock).mockResolvedValue(expectedItems);

    const result = await allOperation(itemQuery);

    // eslint-disable-next-line no-undefined
    expect(mockOperations.all).toHaveBeenCalledWith(itemQuery, undefined);
    expect(result).toEqual(expectedItems);
  });
});
