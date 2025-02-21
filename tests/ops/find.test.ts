import { Item, LocKey, LocKeyArray } from "@fjell/core";
import { wrapFindOperation } from "@/ops/find";
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

describe('getFindOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'>;
  let mockDefinition: Definition<TestItem, 'test', 'loc1', 'loc2'>;
  let findOperation: ReturnType<typeof wrapFindOperation<TestItem, 'test', 'loc1', 'loc2'>>;

  beforeEach(() => {
    mockOperations = {
      find: jest.fn(),
    } as unknown as Operations<TestItem, 'test', 'loc1', 'loc2'>;

    mockDefinition = {} as Definition<TestItem, 'test', 'loc1', 'loc2'>;

    findOperation = wrapFindOperation(mockOperations, mockDefinition);
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

    (mockOperations.find as jest.Mock).mockResolvedValue(expectedItems);

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

    (mockOperations.find as jest.Mock).mockResolvedValue(expectedItems);

    const result = await findOperation(finder, finderParams, locations);

    expect(mockOperations.find).toHaveBeenCalledWith(finder, finderParams, locations);
    expect(result).toEqual(expectedItems);
  });

  test('should use default empty array for locations if not provided', async () => {
    const finder = 'testFinder';
    const finderParams = { param1: 'value1' };
    const expectedItems: TestItem[] = [];

    (mockOperations.find as jest.Mock).mockResolvedValue(expectedItems);

    const result = await findOperation(finder, finderParams);

    // eslint-disable-next-line no-undefined
    expect(mockOperations.find).toHaveBeenCalledWith(finder, finderParams, undefined);
    expect(result).toEqual(expectedItems);
  });
});
