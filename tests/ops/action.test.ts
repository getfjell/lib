import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { ComKey, Item, PriKey } from '@fjell/core';

// Create mock logger functions that can be accessed by tests
const mockLoggerDebug = vi.hoisted(() => vi.fn());
const mockLoggerDefault = vi.hoisted(() => vi.fn());

// Mock the logger
vi.mock('@/logger', () => ({
  default: {
    get: vi.fn(() => ({
      debug: mockLoggerDebug,
      default: mockLoggerDefault,
    })),
  },
}));

import { wrapActionOperation } from '@/ops/action';
import { Definition } from '@/Definition';
import { Operations } from '@/Operations';
import { Registry } from '@/Registry';
import LibLogger from '@/logger';

// Type definitions for test data
interface TestItem extends Item<'test', 'level1'> {
  id: string;
  name: string;
}

describe('wrapActionOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'level1'>;
  let mockDefinition: Definition<TestItem, 'test', 'level1'>;
  let mockRegistry: Registry;
  let mockActionMethod: MockedFunction<any>;

  beforeEach(() => {
    // Reset only specific mocks, not the logger get mock since it's called at module load time
    mockLoggerDebug.mockClear();
    mockLoggerDefault.mockClear();

    // Create mock action method
    mockActionMethod = vi.fn();

    // Mock the operations object
    mockOperations = {
      action: vi.fn(),
    } as any;

    // Mock definition with actions
    mockDefinition = {
      coordinate: {} as any,
      options: {
        actions: {
          testAction: mockActionMethod,
          complexAction: mockActionMethod,
        }
      }
    } as Definition<TestItem, 'test', 'level1'>;

    mockRegistry = {} as Registry;
  });

  describe('wrapActionOperation', () => {
    it('should return a function when called', () => {
      const result = wrapActionOperation(mockOperations, mockDefinition, mockRegistry);

      expect(typeof result).toBe('function');
    });

    it('should call LibLogger.get with correct parameters', () => {
      // The logger is called at module load time with the correct parameters
      expect(LibLogger.get).toHaveBeenCalledWith('library', 'ops', 'action');
    });
  });

  describe('wrapped action function', () => {
    let wrappedAction: ReturnType<typeof wrapActionOperation<TestItem, 'test', 'level1'>>;

    beforeEach(() => {
      wrappedAction = wrapActionOperation(mockOperations, mockDefinition, mockRegistry);
    });

    it('should call the action method from definition with correct parameters', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const actionKey = 'testAction';
      const actionParams = { param1: 'value1', param2: 42, param3: true };

      mockActionMethod.mockResolvedValue(testItem);

      const result = await wrappedAction(testKey, actionKey, actionParams);

      expect(mockActionMethod).toHaveBeenCalledWith(testKey, actionParams);
      expect(result).toBe(testItem);
    });

    it('should work with ComKey as well as PriKey', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: ComKey<'test', 'level1'> = 'composite-key' as unknown as ComKey<'test', 'level1'>;
      const actionKey = 'testAction';
      const actionParams = { param1: 'value1' };

      mockActionMethod.mockResolvedValue(testItem);

      const result = await wrappedAction(testKey, actionKey, actionParams);

      expect(mockActionMethod).toHaveBeenCalledWith(testKey, actionParams);
      expect(result).toBe(testItem);
    });

    it('should log debug information before calling action', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const actionKey = 'testAction';
      const actionParams = { param1: 'value1', param2: 42 };

      mockActionMethod.mockResolvedValue(testItem);

      await wrappedAction(testKey, actionKey, actionParams);

      expect(mockLoggerDebug).toHaveBeenCalledWith('action', {
        key: testKey,
        actionKey,
        actionParams,
      });
    });

    it('should log the action result after successful execution', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const actionKey = 'testAction';
      const actionParams = {};

      mockActionMethod.mockResolvedValue(testItem);

      await wrappedAction(testKey, actionKey, actionParams);

      expect(mockLoggerDefault).toHaveBeenCalledWith('action result: %j', {
        actionResult: testItem,
      });
    });

    it('should handle complex action parameters including arrays and dates', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const actionKey = 'complexAction';
      const testDate = new Date('2023-01-01');
      const actionParams = {
        stringParam: 'test',
        numberParam: 123,
        booleanParam: true,
        dateParam: testDate,
        arrayParam: ['item1', 'item2', 123, true],
      };

      mockActionMethod.mockResolvedValue(testItem);

      const result = await wrappedAction(testKey, actionKey, actionParams);

      expect(mockActionMethod).toHaveBeenCalledWith(testKey, actionParams);
      expect(result).toBe(testItem);
      expect(mockLoggerDebug).toHaveBeenCalledWith('action', {
        key: testKey,
        actionKey,
        actionParams,
      });
    });

    it('should propagate errors from the action method', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const actionKey = 'testAction';
      const actionParams = {};
      const testError = new Error('Action failed');

      mockActionMethod.mockRejectedValue(testError);

      await expect(wrappedAction(testKey, actionKey, actionParams)).rejects.toThrow('Action failed');
      expect(mockActionMethod).toHaveBeenCalledWith(testKey, actionParams);
    });

    it('should still log debug information even when action fails', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const actionKey = 'testAction';
      const actionParams = { param1: 'value1' };
      const testError = new Error('Action failed');

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

    it('should not log result when action fails', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const actionKey = 'testAction';
      const actionParams = {};
      const testError = new Error('Action failed');

      // Clear the mock first to ensure clean state
      mockLoggerDefault.mockClear();
      mockActionMethod.mockRejectedValue(testError);

      try {
        await wrappedAction(testKey, actionKey, actionParams);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Expected to throw
        expect(error).toBe(testError);
      }

      expect(mockLoggerDefault).not.toHaveBeenCalled();
    });

    it('should throw error when action is not found in definition', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const actionKey = 'nonExistentAction';
      const actionParams = {};

      await expect(wrappedAction(testKey, actionKey, actionParams)).rejects.toThrow(
        'Action nonExistentAction not found in definition'
      );

      expect(mockActionMethod).not.toHaveBeenCalled();
    });

    it('should throw error when no actions are defined in definition', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const actionKey = 'testAction';
      const actionParams = {};

      // Mock definition without actions
      const definitionWithoutActions = {
        coordinate: {} as any,
        options: {}
      } as Definition<TestItem, 'test', 'level1'>;

      const wrappedActionWithoutActions = wrapActionOperation(mockOperations, definitionWithoutActions, mockRegistry);

      await expect(wrappedActionWithoutActions(testKey, actionKey, actionParams)).rejects.toThrow(
        'Action testAction not found in definition'
      );
    });
  });
});
