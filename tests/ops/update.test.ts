import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createCoordinate } from '@fjell/registry';
import { UpdateError } from '@/errors';
import { Operations } from '@/Operations';
import { createOptions, Options } from '@/Options';
import { wrapUpdateOperation } from '@/ops/update';
import { createRegistry, Registry } from '@/Registry';
import { Item, PriKey } from '@fjell/core';

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

interface TestItem extends Item<'test', 'level1'> {
  id: string;
  name: string;
}

describe('wrapUpdateOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'level1'>;
  let mockOptions: Options<TestItem, 'test', 'level1'>;
  let mockCoordinate: any;
  let registry: Registry;

  beforeEach(() => {
    mockOperations = {
      update: vi.fn(),
    } as unknown as Operations<TestItem, 'test', 'level1'>;

    registry = createRegistry();
    mockOptions = createOptions<TestItem, 'test', 'level1'>();
    mockCoordinate = createCoordinate(['test'], ['level1']);
  });

  test('should call wrapped operations update with correct parameters', async () => {
    const updateOperation = wrapUpdateOperation(mockOperations, mockOptions, mockCoordinate, registry);
    const key: PriKey<'test'> = { kt: 'test', pk: 'test-id' };
    const item: Partial<TestItem> = { name: 'updated-name' };
    const expectedItem: TestItem = {
      id: 'test-id',
      name: 'updated-name',
      key
    } as TestItem;

    (mockOperations.update as any).mockResolvedValue(expectedItem);

    const result = await updateOperation(key, item);

    expect(mockOperations.update).toHaveBeenCalledWith(key, item);
    expect(result).toEqual(expectedItem);
  });

  test('should propagate errors from underlying operations', async () => {
    const updateOperation = wrapUpdateOperation(mockOperations, mockOptions, mockCoordinate, registry);
    const key: PriKey<'test'> = { kt: 'test', pk: 'test-id' };
    const item: Partial<TestItem> = { name: 'updated-name' };
    const updateError = new Error('Database error');

    (mockOperations.update as any).mockRejectedValue(updateError);

    await expect(updateOperation(key, item)).rejects.toThrow(UpdateError);
  });
});
