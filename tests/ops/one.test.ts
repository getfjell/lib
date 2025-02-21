import { Coordinate, createCoordinate } from '@/Coordinate';
import { createDefinition } from '@/Definition';
import { Operations } from '@/Operations';
import { wrapOneOperation } from '@/ops/one';
import { Item, ItemQuery, LocKeyArray } from '@fjell/core';
import { randomUUID } from 'crypto';

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

describe('One Operation', () => {
  let operations: Operations<Item<'test'>, 'test'>;
  let oneMethodMock: jest.Mock;
  let coordinate: Coordinate<'test'>;
  
  beforeEach(() => {
    oneMethodMock = jest.fn();
    operations = {
      one: oneMethodMock,
    } as unknown as Operations<Item<'test'>, 'test'>;
    coordinate = createCoordinate(['test'], ['scope1']);
  });

  describe('basic one', () => {
    test('should return item successfully', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test'>;
      const query = { name: 'test' } as ItemQuery;
      
      const definition = createDefinition(coordinate);
      oneMethodMock.mockResolvedValueOnce(testItem);

      const one = wrapOneOperation(operations, definition);
      const result = await one(query);

      expect(result).toBe(testItem);
      expect(oneMethodMock).toHaveBeenCalledWith(query, []);
    });

    test('should return null when no item found', async () => {
      const query = { name: 'test' } as ItemQuery;
      
      const definition = createDefinition(coordinate);
      oneMethodMock.mockResolvedValueOnce(null);

      const one = wrapOneOperation(operations, definition);
      const result = await one(query);

      expect(result).toBeNull();
      expect(oneMethodMock).toHaveBeenCalledWith(query, []);
    });

    test('should pass locations to underlying operation', async () => {
      const query = { name: 'test' } as ItemQuery;
      const locations = [{ kt: 'container', lk: randomUUID() }] as LocKeyArray<'container'>;
      
      const definition = createDefinition<Item<'test', 'container'>, 'test', 'container'>(coordinate);
      oneMethodMock.mockResolvedValueOnce(null);

      const one = wrapOneOperation<Item<'test', 'container'>, 'test', 'container'>(operations, definition);
      await one(query, locations);

      expect(oneMethodMock).toHaveBeenCalledWith(query, locations);
    });
  });
});
