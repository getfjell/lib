import { Coordinate, createCoordinate } from '@/Coordinate';
import { createDefinition } from '@/Definition';
import { Operations } from '@/Operations';
import { wrapGetOperation } from '@/ops/get';
import { ComKey, Item, LocKeyArray, PriKey } from '@fjell/core';
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

describe('Get Operation', () => {
  let operations: Operations<Item<'test'>, 'test'>;
  let getMethodMock: jest.Mock;
  let coordinate: Coordinate<'test'>;
  
  beforeEach(() => {
    getMethodMock = jest.fn();
    operations = {
      get: getMethodMock,
    } as unknown as Operations<Item<'test'>, 'test'>;
    coordinate = createCoordinate(['test'], ['scope1']);
  });

  describe('basic get', () => {
    test('should get item successfully', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      
      const definition = createDefinition(coordinate);
      getMethodMock.mockResolvedValueOnce(testItem);

      const get = wrapGetOperation(operations, definition);
      const result = await get(key);

      expect(result).toBe(testItem);
      expect(getMethodMock).toHaveBeenCalledWith(key);
    });

    test('should return null when item not found', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      
      const definition = createDefinition(coordinate);
      getMethodMock.mockResolvedValueOnce(null);

      const get = wrapGetOperation(operations, definition);
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
      
      const definition = createDefinition<Item<'test', 'container'>, 'test', 'container'>(coordinate);
      getMethodMock.mockResolvedValueOnce(testItem);

      const get = wrapGetOperation<Item<'test', 'container'>, 'test', 'container'>(operations, definition);
      const result = await get(key);

      expect(result).toBe(testItem);
      expect(getMethodMock).toHaveBeenCalledWith(key);
    });
  });
});
