import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createCoordinate } from '@fjell/registry';
import { Operations } from '../../src/Operations';
import { wrapOneOperation } from '../../src/ops/one';
import { createOptions, Options } from '../../src/Options';
import { createRegistry, Registry } from '../../src/Registry';
import { Item, ItemQuery, LocKeyArray } from '@fjell/core';
import LibLogger from '../../src/logger';

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

// Type definitions for test data
interface TestItem extends Item<'test', 'level1'> {
  id: string;
  name: string;
}

describe('wrapOneOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'level1'>;
  let mockOptions: Options<TestItem, 'test', 'level1'>;
  let mockCoordinate: any;
  let mockRegistry: Registry;

  beforeEach(() => {
    // Mock the operations object
    mockOperations = {
      one: vi.fn(),
    } as any;

    // Mock options
    mockOptions = createOptions<TestItem, 'test', 'level1'>({});

    mockCoordinate = createCoordinate(['test'], ['level1']);
    mockRegistry = createRegistry();
  });

  describe('wrapOneOperation', () => {
    test('should return a function when called', () => {
      const result = wrapOneOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);

      expect(typeof result).toBe('function');
    });

    test('should call LibLogger.get with correct parameters', () => {
      wrapOneOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);

      expect(LibLogger.get).toHaveBeenCalledWith('library', 'ops', 'one');
    });
  });

  describe('wrapped one function', () => {
    let wrappedOne: ReturnType<typeof wrapOneOperation<TestItem, 'test', 'level1'>>;

    beforeEach(() => {
      wrappedOne = wrapOneOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);
    });

    test('should return item successfully', async () => {
      const testItem = {
        name: 'test',
        id: 'test-id',
        key: { kt: 'test', pk: 'test-pk' }
      } as TestItem;
      const query = { name: 'test' } as ItemQuery;

      (mockOperations.one as any).mockResolvedValueOnce(testItem);

      const result = await wrappedOne(query);

      expect(result).toBe(testItem);
      expect(mockOperations.one).toHaveBeenCalledWith(query, []);
    });

    test('should return null when no item found', async () => {
      const query = { name: 'test' } as ItemQuery;

      (mockOperations.one as any).mockResolvedValueOnce(null);

      const result = await wrappedOne(query);

      expect(result).toBeNull();
      expect(mockOperations.one).toHaveBeenCalledWith(query, []);
    });

    test('should pass locations to underlying operation', async () => {
      const query = { name: 'test' } as ItemQuery;
      const locations = [{ kt: 'level1', lk: 'loc-123' }] as LocKeyArray<'level1'>;
      const testItem = {
        name: 'test',
        id: 'test-id',
        key: { kt: 'test', pk: 'test-pk' }
      } as TestItem;

      (mockOperations.one as any).mockResolvedValueOnce(testItem);

      const result = await wrappedOne(query, locations);

      expect(result).toBe(testItem);
      expect(mockOperations.one).toHaveBeenCalledWith(query, locations);
    });

    test('should propagate errors from underlying operations', async () => {
      const query = { name: 'test' } as ItemQuery;
      const error = new Error('Database error');

      (mockOperations.one as any).mockRejectedValueOnce(error);

      await expect(wrappedOne(query)).rejects.toThrow('Database error');
      expect(mockOperations.one).toHaveBeenCalledWith(query, []);
    });
  });
});
