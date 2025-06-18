import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { Coordinate, createCoordinate } from '@/Coordinate';
import { createDefinition } from '@/Definition';
import { Operations } from '@/Operations';
import { wrapGetOperation } from '@/ops/get';
import { createRegistry } from '@/Registry';
import { ComKey, Item, LocKeyArray, PriKey } from '@fjell/core';
import { randomUUID } from 'crypto';

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
  let operations: Operations<Item<'test'>, 'test'>;
  let getMethodMock: Mock;
  let coordinate: Coordinate<'test'>;

  beforeEach(() => {
    getMethodMock = vi.fn();
    operations = {
      get: getMethodMock,
    } as unknown as Operations<Item<'test'>, 'test'>;
    coordinate = createCoordinate(['test'], ['scope1']);
  });

  describe('basic get', () => {
    test('should get item successfully', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;

      const registry = createRegistry();
      const definition = createDefinition(coordinate);
      getMethodMock.mockResolvedValueOnce(testItem);

      const get = wrapGetOperation(operations, definition, registry);
      const result = await get(key);

      expect(result).toBe(testItem);
      expect(getMethodMock).toHaveBeenCalledWith(key);
    });

    test('should return null when item not found', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;

      const registry = createRegistry();
      const definition = createDefinition(coordinate);
      getMethodMock.mockResolvedValueOnce(null);

      const get = wrapGetOperation(operations, definition, registry);
      const result = await get(key);

      expect(result).toBeNull();
      expect(getMethodMock).toHaveBeenCalledWith(key);
    });

    test('should handle composite keys', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test', 'container'>;
      const key = {
        kt: 'test',
        pk: randomUUID(),
        loc: [{ kt: 'container', lk: randomUUID() }] as LocKeyArray<'container'>
      } as ComKey<'test', 'container'>;

      const registry = createRegistry();
      const definition = createDefinition<Item<'test', 'container'>, 'test', 'container'>(coordinate);
      getMethodMock.mockResolvedValueOnce(testItem);

      const get = wrapGetOperation<Item<'test', 'container'>, 'test', 'container'>(operations, definition, registry);
      const result = await get(key);

      expect(result).toBe(testItem);
      expect(getMethodMock).toHaveBeenCalledWith(key);
    });
  });
});
