import { Item, LocKey, LocKeyArray } from "@fjell/core";
import { wrapCreateOperation } from "@/ops/create";
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

describe('getCreateOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'>;
  let mockDefinition: Definition<TestItem, 'test', 'loc1', 'loc2'>;
  let createOperation: ReturnType<typeof wrapCreateOperation<TestItem, 'test', 'loc1', 'loc2'>>;

  beforeEach(() => {
    mockOperations = {
      create: jest.fn(),
    } as unknown as Operations<TestItem, 'test', 'loc1', 'loc2'>;

    mockDefinition = {
      collectionNames: ['tests', 'loc1s', 'loc2s'],
      coordinate: {
        kta: ['test', 'loc1', 'loc2'],
        scopes: [],
      },
      options: {}
    } as Definition<TestItem, 'test', 'loc1', 'loc2'>;

    createOperation = wrapCreateOperation(mockOperations, mockDefinition);
  });

  test('should call wrapped operations create with correct parameters', async () => {
    const item: Partial<TestItem> = { name: 'test1' };
    const locations: LocKeyArray<'loc1', 'loc2'> = [
      { kt: 'loc1', lk: 'loc1-id' } as LocKey<'loc1'>,
      { kt: 'loc2', lk: 'loc2-id' } as LocKey<'loc2'>
    ];
    const expectedItem: TestItem = {
      name: 'test1',
      key: { kt: 'test', pk: 'test-id' }
    } as TestItem;

    (mockOperations.create as jest.Mock).mockResolvedValue(expectedItem);

    const result = await createOperation(item, { locations });

    expect(mockOperations.create).toHaveBeenCalledWith(item, { locations });
    expect(result).toEqual(expectedItem);
  });

  test('should handle empty locations array', async () => {
    const item: Partial<TestItem> = { name: 'test1' };
    const expectedItem: TestItem = {
      name: 'test1',
      key: { kt: 'test', pk: 'test-id' }
    } as TestItem;

    (mockOperations.create as jest.Mock).mockResolvedValue(expectedItem);

    const result = await createOperation(item);

    // eslint-disable-next-line no-undefined
    expect(mockOperations.create).toHaveBeenCalledWith(item, undefined);
    expect(result).toEqual(expectedItem);
  });

  test('should use default empty array for locations if not provided', async () => {
    const item: Partial<TestItem> = { name: 'test1' };
    const expectedItem: TestItem = {
      name: 'test1',
      key: { kt: 'test', pk: 'test-id' }
    } as TestItem;

    (mockOperations.create as jest.Mock).mockResolvedValue(expectedItem);

    const result = await createOperation(item);

    // eslint-disable-next-line no-undefined
    expect(mockOperations.create).toHaveBeenCalledWith(item, undefined);
    expect(result).toEqual(expectedItem);
  });
});
