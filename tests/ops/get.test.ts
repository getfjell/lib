import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { createCoordinate } from '@fjell/registry';
import { Operations } from '@/Operations';
import { wrapGetOperation } from '@/ops/get';
import { createOptions } from '@/Options';
import { createRegistry } from '@/Registry';
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

describe('Get Operation', () => {
  let operations: Operations<Item<'test', 'container'>, 'test', 'container'>;
  let getMethodMock: Mock;

  beforeEach(() => {
    getMethodMock = vi.fn();
    operations = {
      get: getMethodMock,
    } as any;
  });

  describe('basic get', () => {
    test('should get item successfully', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test', 'container'>;
      const key = { kt: 'test', pk: 'test-id' } as PriKey<'test'>;

      const registry = createRegistry();
      const coordinate = createCoordinate(['test'], ['scope1']);
      const options = createOptions<Item<'test', 'container'>, 'test', 'container'>();
      getMethodMock.mockResolvedValueOnce(testItem);

      const get = wrapGetOperation(operations, options, coordinate, registry);
      const result = await get(key);

      expect(result).toBe(testItem);
      expect(getMethodMock).toHaveBeenCalledWith(key);
    });

    test('should return null when item not found', async () => {
      const key = { kt: 'test', pk: 'test-id' } as PriKey<'test'>;

      const registry = createRegistry();
      const coordinate = createCoordinate(['test'], ['scope1']);
      const options = createOptions<Item<'test', 'container'>, 'test', 'container'>();
      getMethodMock.mockResolvedValueOnce(null);

      const get = wrapGetOperation(operations, options, coordinate, registry);
      const result = await get(key);

      expect(result).toBeNull();
      expect(getMethodMock).toHaveBeenCalledWith(key);
    });

    test('should handle complex item queries', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test', 'container'>;
      const key = { kt: 'test', pk: 'test-id' } as PriKey<'test'>;

      const registry = createRegistry();
      const coordinate = createCoordinate(['test'], ['scope1']);
      const options = createOptions<Item<'test', 'container'>, 'test', 'container'>();
      getMethodMock.mockResolvedValueOnce(testItem);

      const get = wrapGetOperation<Item<'test', 'container'>, 'test', 'container'>(
        operations,
        options,
        coordinate,
        registry
      );
      const result = await get(key);

      expect(result).toBe(testItem);
      expect(getMethodMock).toHaveBeenCalledWith(key);
    });
  });
});
