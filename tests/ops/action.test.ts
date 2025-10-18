import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { ComKey, Item } from '@fjell/core';

// Create mock logger functions that can be accessed by tests
const mockLoggerDebug = vi.hoisted(() => vi.fn());
const mockLoggerDefault = vi.hoisted(() => vi.fn());
const mockLoggerError = vi.hoisted(() => vi.fn());
const mockLoggerGet = vi.hoisted(() => vi.fn());

// Mock the logger
vi.mock('../../src/logger', () => ({
  default: {
    get: mockLoggerGet.mockReturnValue({
      debug: mockLoggerDebug,
      default: mockLoggerDefault,
      error: mockLoggerError,
    }),
  },
}));

import { wrapActionOperation } from '../../src/ops/action';
import { Operations } from '../../src/Operations';
import { createOptions, Options } from '../../src/Options';
import { Coordinate, createCoordinate } from '@fjell/core';

// Type definitions for test data
interface TestItem extends Item<'test', 'level1'> {
  id: string;
  name: string;
}

describe('wrapActionOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'level1'>;
  let mockOptions: Options<TestItem, 'test', 'level1'>;
  let mockCoordinate: Coordinate<'test', 'level1'>;
  let mockActionMethod: MockedFunction<any>;

  beforeEach(() => {
    // Reset only specific mocks, not the logger get mock since it's called at module load time
    mockLoggerDebug.mockClear();
    mockLoggerDefault.mockClear();
    mockLoggerError.mockClear();

    // Create mock action method
    mockActionMethod = vi.fn();

    // Mock the operations object - this is what will be called, not the action methods directly
    mockOperations = {
      action: vi.fn(),
      get: vi.fn(),
    } as any;

    // Mock options with actions
    mockOptions = createOptions<TestItem, 'test', 'level1'>({
      actions: {
        testAction: mockActionMethod,
        complexAction: mockActionMethod,
      }
    });

    // Create coordinate for tests
    mockCoordinate = createCoordinate(['test', 'level1']);
  });

  describe('wrapActionOperation', () => {
    it('should return a function when called', () => {
      const result = wrapActionOperation(mockOperations, mockOptions, mockCoordinate);

      expect(typeof result).toBe('function');
    });

    it('should call LibLogger.get with correct parameters', () => {
      // The logger is called at module load time with the correct parameters
      expect(mockLoggerGet).toHaveBeenCalledWith('library', 'ops', 'action');
    });
  });

  describe('wrapped action function', () => {
    let wrappedAction: ReturnType<typeof wrapActionOperation<TestItem, 'test', 'level1'>>;

    beforeEach(() => {
      wrappedAction = wrapActionOperation(mockOperations, mockOptions, mockCoordinate);
    });

    it('should forward calls to wrapped operations action method with correct parameters', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const actionKey = 'testAction';
      const actionParams = { param1: 'value1', param2: 42, param3: true };
      const actionResult = { id: '1', name: 'updated item' } as TestItem;
      const affectedItems: Array<any> = [];

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockActionMethod.mockResolvedValue([actionResult, affectedItems]);

      const result = await wrappedAction(testKey, actionKey, actionParams);

      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
      expect(mockActionMethod).toHaveBeenCalledWith(testItem, actionParams);
      expect(result).toEqual([actionResult, affectedItems]);
    });

    it('should work with ComKey as well as PriKey', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const actionKey = 'testAction';
      const actionParams = { param1: 'value1' };
      const actionResult = { id: '1', name: 'updated with composite key' } as TestItem;
      const affectedItems: Array<any> = [];

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockActionMethod.mockResolvedValue([actionResult, affectedItems]);

      const result = await wrappedAction(testKey, actionKey, actionParams);

      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
      expect(mockActionMethod).toHaveBeenCalledWith(testItem, actionParams);
      expect(result).toEqual([actionResult, affectedItems]);
    });

    it('should log debug information before calling action', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const actionResult = { id: '1', name: 'updated item' } as TestItem;
      const affectedItems: Array<any> = [];
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const actionKey = 'testAction';
      const actionParams = { param1: 'value1', param2: 42 };

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockActionMethod.mockResolvedValue([actionResult, affectedItems]);

      await wrappedAction(testKey, actionKey, actionParams);

      expect(mockLoggerDebug).toHaveBeenCalledWith('action', {
        key: testKey,
        actionKey,
        actionParams,
      });
    });

    it('should return the action result after successful execution', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const actionKey = 'testAction';
      const actionParams = {};
      const actionResult = { id: '1', name: 'action completed' } as TestItem;
      const affectedItems: Array<any> = [];

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockActionMethod.mockResolvedValue([actionResult, affectedItems]);

      const result = await wrappedAction(testKey, actionKey, actionParams);

      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
      expect(mockActionMethod).toHaveBeenCalledWith(testItem, actionParams);
      expect(result).toEqual([actionResult, affectedItems]);
    });

    it('should handle complex action parameters including arrays and dates', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const actionKey = 'complexAction';
      const testDate = new Date('2023-01-01');
      const actionParams = {
        stringParam: 'test',
        numberParam: 123,
        booleanParam: true,
        dateParam: testDate,
        arrayParam: ['item1', 'item2', 123, true],
      };
      const actionResult = { id: '1', name: 'complex processing completed' } as TestItem;
      const affectedItems: Array<any> = [];

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockActionMethod.mockResolvedValue([actionResult, affectedItems]);

      const result = await wrappedAction(testKey, actionKey, actionParams);

      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
      expect(mockActionMethod).toHaveBeenCalledWith(testItem, actionParams);
      expect(result).toEqual([actionResult, affectedItems]);
      expect(mockLoggerDebug).toHaveBeenCalledWith('action', {
        key: testKey,
        actionKey,
        actionParams,
      });
    });

    it('should propagate errors from the wrapped action operation', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const actionKey = 'testAction';
      const actionParams = {};
      const testError = new Error('Action failed');

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockActionMethod.mockRejectedValue(testError);

      await expect(wrappedAction(testKey, actionKey, actionParams)).rejects.toThrow('Action failed');
      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
    });

    it('should still log debug information even when action fails', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const actionKey = 'testAction';
      const actionParams = { param1: 'value1' };
      const testError = new Error('Action failed');

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockActionMethod.mockRejectedValue(testError);

      try {
        await wrappedAction(testKey, actionKey, actionParams);
      } catch {
        // Expected to throw
      }

      expect(mockLoggerDebug).toHaveBeenCalledWith('action', {
        key: testKey,
        actionKey,
        actionParams,
      });
    });

    it('should propagate errors when action method fails', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const actionKey = 'testAction';
      const actionParams = {};
      const testError = new Error('Action failed');

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockActionMethod.mockRejectedValue(testError);

      await expect(wrappedAction(testKey, actionKey, actionParams)).rejects.toThrow('Action failed');
      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
    });

    it('should throw error when action is not found in definition', async () => {
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const actionKey = 'nonExistentAction';
      const actionParams = {};

      await expect(wrappedAction(testKey, actionKey, actionParams)).rejects.toThrow(
        'Action nonExistentAction not found in definition'
      );

      expect(mockOperations.action).not.toHaveBeenCalled();
    });

    it('should throw error when no actions are defined in definition', async () => {
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const actionKey = 'testAction';
      const actionParams = {};

      // Mock definition without actions
      const definitionWithoutActions = createOptions<TestItem, 'test', 'level1'>({
        actions: {}
      });

      const wrappedActionWithoutActions = wrapActionOperation(mockOperations, definitionWithoutActions, mockCoordinate);

      await expect(wrappedActionWithoutActions(testKey, actionKey, actionParams)).rejects.toThrow(
        'Action testAction not found in definition'
      );

      expect(mockOperations.action).not.toHaveBeenCalled();
    });
  });
});
