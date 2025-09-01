import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { Item, LocKey, LocKeyArray } from '@fjell/core';

// Create mock logger functions that can be accessed by tests
const mockLoggerDebug = vi.hoisted(() => vi.fn());
const mockLoggerError = vi.hoisted(() => vi.fn());
const mockLoggerDefault = vi.hoisted(() => vi.fn());
const mockLoggerGet = vi.hoisted(() => vi.fn());

// Mock the logger
vi.mock('../../src/logger', () => ({
  default: {
    get: mockLoggerGet.mockReturnValue({
      debug: mockLoggerDebug,
      error: mockLoggerError,
      default: mockLoggerDefault,
    }),
  },
}));

import { wrapAllActionOperation } from '../../src/ops/allAction';
import { Options } from '../../src/Options';
import { Operations } from '../../src/Operations';
import { createOptions } from '../../src/Options';

// Type definitions for test data
interface TestItem extends Item<'test', 'level1', 'level2'> {
  id: string;
  name: string;
}

describe('wrapAllActionOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'level1', 'level2'>;
  let mockOptions: Options<TestItem, 'test', 'level1', 'level2'>;
  let mockActionMethod: MockedFunction<any>;

  beforeEach(() => {
    // Reset only specific mocks, not the logger get mock since it's called at module load time
    mockLoggerDebug.mockClear();
    mockLoggerError.mockClear();
    mockLoggerDefault.mockClear();

    // Create mock all action method
    mockActionMethod = vi.fn();

    // Mock the operations object
    mockOperations = {
      allAction: vi.fn(),
    } as any;

    // Mock options with allActions
    mockOptions = createOptions<TestItem, 'test', 'level1', 'level2'>({
      allActions: {
        testAction: mockActionMethod,
        complexAction: mockActionMethod,
      }
    });
  });

  describe('wrapAllActionOperation', () => {
    it('should return a function when called', () => {
      const result = wrapAllActionOperation(mockOperations, mockOptions);

      expect(typeof result).toBe('function');
    });

    it('should call LibLogger.get with correct parameters', () => {
      wrapAllActionOperation(mockOperations, mockOptions);

      expect(mockLoggerGet).toHaveBeenCalledWith('library', 'ops', 'allAction');
    });
  });

  describe('wrapped allAction function', () => {
    let wrappedAllAction: ReturnType<typeof wrapAllActionOperation<TestItem, 'test', 'level1', 'level2'>>;

    beforeEach(() => {
      wrappedAllAction = wrapAllActionOperation(mockOperations, mockOptions);
    });

    it('should call action method with correct parameters and return array result', async () => {
      const actionKey = 'testAction';
      const actionParams = { param1: 'value1', param2: 42, param3: true };
      const locations: LocKeyArray<'level1', 'level2'> = [
        { kt: 'level1', lk: 'level1-id' } as LocKey<'level1'>,
        { kt: 'level2', lk: 'level2-id' } as LocKey<'level2'>
      ];
      const expectedResult: TestItem[] = [
        { id: '1', name: 'item1' } as TestItem,
        { id: '2', name: 'item2' } as TestItem
      ];
      const affectedItems: Array<any> = [];

      mockActionMethod.mockResolvedValue([expectedResult, affectedItems]);

      const result = await wrappedAllAction(actionKey, actionParams, locations);

      expect(mockActionMethod).toHaveBeenCalledWith(actionParams, locations);
      expect(result).toEqual([expectedResult, affectedItems]);
      expect(Array.isArray(result[0])).toBe(true);
    });

    it('should work without locations parameter', async () => {
      const actionKey = 'testAction';
      const actionParams = { param1: 'value1' };
      const expectedResult: TestItem[] = [
        { id: '1', name: 'item without locations' } as TestItem
      ];
      const affectedItems: Array<any> = [];

      mockActionMethod.mockResolvedValue([expectedResult, affectedItems]);

      const result = await wrappedAllAction(actionKey, actionParams);

      // eslint-disable-next-line no-undefined
      expect(mockActionMethod).toHaveBeenCalledWith(actionParams, undefined);
      expect(result).toEqual([expectedResult, affectedItems]);
    });

    it('should work with empty locations array', async () => {
      const actionKey = 'testAction';
      const actionParams = { param1: 'value1' };
      const locations: LocKeyArray<'level1', 'level2'> | [] = [];
      const expectedResult: TestItem[] = [];
      const affectedItems: Array<any> = [];

      mockActionMethod.mockResolvedValue([expectedResult, affectedItems]);

      const result = await wrappedAllAction(actionKey, actionParams, locations);

      expect(mockActionMethod).toHaveBeenCalledWith(actionParams, locations);
      expect(result).toEqual([expectedResult, affectedItems]);
      expect(Array.isArray(result[0])).toBe(true);
      expect(result[0].length).toBe(0);
    });

    it('should log debug information before calling action', async () => {
      const actionKey = 'testAction';
      const actionParams = { param1: 'value1', param2: 42 };
      const locations: LocKeyArray<'level1', 'level2'> = [
        { kt: 'level1', lk: 'level1-id' } as LocKey<'level1'>,
        { kt: 'level2', lk: 'level2-id' } as LocKey<'level2'>
      ];
      const expectedResult: TestItem[] = [];
      const affectedItems: Array<any> = [];

      mockActionMethod.mockResolvedValue([expectedResult, affectedItems]);

      await wrappedAllAction(actionKey, actionParams, locations);

      expect(mockLoggerDebug).toHaveBeenCalledWith('allAction', {
        allActionKey: actionKey,
        allActionParams: actionParams,
        locations: locations,
      });
    });

    it('should handle complex action parameters including arrays and dates', async () => {
      const actionKey = 'complexAction';
      const testDate = new Date('2023-01-01');
      const actionParams = {
        stringParam: 'test',
        numberParam: 123,
        booleanParam: true,
        dateParam: testDate,
        arrayParam: ['item1', 'item2', 123, true],
      };
      const expectedResult: TestItem[] = [
        { id: '1', name: 'complex processing completed' } as TestItem
      ];
      const affectedItems: Array<any> = [];

      mockActionMethod.mockResolvedValue([expectedResult, affectedItems]);

      const result = await wrappedAllAction(actionKey, actionParams);

      // eslint-disable-next-line no-undefined
      expect(mockActionMethod).toHaveBeenCalledWith(actionParams, undefined);
      expect(result).toEqual([expectedResult, affectedItems]);
      expect(mockLoggerDebug).toHaveBeenCalledWith('allAction', {
        allActionKey: actionKey,
        allActionParams: actionParams,
        // eslint-disable-next-line no-undefined
        locations: undefined,
      });
    });

    it('should propagate errors from the action method', async () => {
      const actionKey = 'testAction';
      const actionParams = {};
      const testError = new Error('Action operation failed');

      mockActionMethod.mockRejectedValue(testError);

      await expect(wrappedAllAction(actionKey, actionParams)).rejects.toThrow('Action operation failed');
      // eslint-disable-next-line no-undefined
      expect(mockActionMethod).toHaveBeenCalledWith(actionParams, undefined);
    });

    it('should still log debug information even when action fails', async () => {
      const actionKey = 'testAction';
      const actionParams = { param1: 'value1' };
      const testError = new Error('Action failed');

      mockActionMethod.mockRejectedValue(testError);

      try {
        await wrappedAllAction(actionKey, actionParams);
      } catch {
        // Expected to throw
      }

      expect(mockLoggerDebug).toHaveBeenCalledWith('allAction', {
        allActionKey: actionKey,
        allActionParams: actionParams,
        // eslint-disable-next-line no-undefined
        locations: undefined,
      });
    });

    it('should throw error when allAction is not found in definition', async () => {
      const actionKey = 'testAction';
      const actionParams = {};

      // Mock options without allActions
      const optionsWithoutActions = createOptions<TestItem, 'test', 'level1', 'level2'>({});

      const wrappedAllActionWithoutActions = wrapAllActionOperation(
        mockOperations, optionsWithoutActions
      );

      await expect(wrappedAllActionWithoutActions(actionKey, actionParams)).rejects.toThrow(
        'AllAction "testAction" not found in definition. Available actions: none'
      );

      expect(mockActionMethod).not.toHaveBeenCalled();
    });

    it('should throw error when options are undefined in definition', async () => {
      const actionKey = 'testAction';
      const actionParams = {};

      // Mock options without allActions
      const optionsWithoutAllActions = createOptions<TestItem, 'test', 'level1', 'level2'>({});

      const wrappedAllActionWithoutOptions = wrapAllActionOperation(
        mockOperations, optionsWithoutAllActions
      );

      await expect(wrappedAllActionWithoutOptions(actionKey, actionParams)).rejects.toThrow(
        'AllAction "testAction" not found in definition. Available actions: none'
      );

      expect(mockActionMethod).not.toHaveBeenCalled();
    });

    it('should return empty array when action method returns empty array', async () => {
      const actionKey = 'testAction';
      const actionParams = {};
      const expectedResult: TestItem[] = [];
      const affectedItems: Array<any> = [];

      mockActionMethod.mockResolvedValue([expectedResult, affectedItems]);

      const result = await wrappedAllAction(actionKey, actionParams);

      // eslint-disable-next-line no-undefined
      expect(mockActionMethod).toHaveBeenCalledWith(actionParams, undefined);
      expect(result).toEqual([expectedResult, affectedItems]);
      expect(Array.isArray(result[0])).toBe(true);
      expect(result[0].length).toBe(0);
    });

    it('should handle multiple items in result array', async () => {
      const actionKey = 'testAction';
      const actionParams = {};
      const expectedResult: TestItem[] = [
        { id: '1', name: 'item1' } as TestItem,
        { id: '2', name: 'item2' } as TestItem,
        { id: '3', name: 'item3' } as TestItem,
      ];
      const affectedItems: Array<any> = [];

      mockActionMethod.mockResolvedValue([expectedResult, affectedItems]);

      const result = await wrappedAllAction(actionKey, actionParams);

      // eslint-disable-next-line no-undefined
      expect(mockActionMethod).toHaveBeenCalledWith(actionParams, undefined);
      expect(result).toEqual([expectedResult, affectedItems]);
      expect(Array.isArray(result[0])).toBe(true);
      expect(result[0].length).toBe(3);
    });

    it('should work with different action keys', async () => {
      const testCases = ['testAction', 'complexAction'];

      for (const actionKey of testCases) {
        const actionParams = { key: actionKey };
        const expectedResult: TestItem[] = [
          { id: '1', name: `result for ${actionKey}` } as TestItem
        ];
        const affectedItems: Array<any> = [];

        mockActionMethod.mockClear();
        mockActionMethod.mockResolvedValue([expectedResult, affectedItems]);

        const result = await wrappedAllAction(actionKey, actionParams);

        // eslint-disable-next-line no-undefined
        expect(mockActionMethod).toHaveBeenCalledWith(actionParams, undefined);
        expect(result).toEqual([expectedResult, affectedItems]);
      }
    });
  });
});
