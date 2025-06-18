import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { Coordinate, createCoordinate } from '@/Coordinate';
import { createDefinition } from '@/Definition';
import { Operations } from '@/Operations';
import { wrapOneOperation } from '@/ops/one';
import { createRegistry } from '@/Registry';
import { Item, ItemQuery, LocKeyArray } from '@fjell/core';
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

describe('One Operation', () => {
  let operations: Operations<Item<'test'>, 'test'>;
  let oneMethodMock: Mock;
  let coordinate: Coordinate<'test'>;

  beforeEach(() => {
    oneMethodMock = vi.fn();
    operations = {
      one: oneMethodMock,
    } as unknown as Operations<Item<'test'>, 'test'>;
    coordinate = createCoordinate(['test'], ['scope1']);
  });

  describe('basic one', () => {
    test('should return item successfully', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test'>;
      const query = { name: 'test' } as ItemQuery;
      const registry = createRegistry();

      const definition = createDefinition(coordinate);
      oneMethodMock.mockResolvedValueOnce(testItem);

      const one = wrapOneOperation(operations, definition, registry);
      const result = await one(query);

      expect(result).toBe(testItem);
      expect(oneMethodMock).toHaveBeenCalledWith(query, []);
    });

    test('should return null when no item found', async () => {
      const query = { name: 'test' } as ItemQuery;

      const registry = createRegistry();
      const definition = createDefinition(coordinate);
      oneMethodMock.mockResolvedValueOnce(null);

      const one = wrapOneOperation(operations, definition, registry);
      const result = await one(query);

      expect(result).toBeNull();
      expect(oneMethodMock).toHaveBeenCalledWith(query, []);
    });

    test('should pass locations to underlying operation', async () => {
      const query = { name: 'test' } as ItemQuery;
      const locations = [{ kt: 'container', lk: randomUUID() }] as LocKeyArray<'container'>;

      const registry = createRegistry();
      const definition = createDefinition<Item<'test', 'container'>, 'test', 'container'>(coordinate);
      oneMethodMock.mockResolvedValueOnce(null);

      const one = wrapOneOperation<Item<'test', 'container'>, 'test', 'container'>(operations, definition, registry);
      await one(query, locations);

      expect(oneMethodMock).toHaveBeenCalledWith(query, locations);
    });
  });
});
