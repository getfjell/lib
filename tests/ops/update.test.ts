import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createCoordinate } from '@fjell/core';
import { HookError, UpdateError, UpdateValidationError } from '../../src/errors';
import { Operations } from '../../src/Operations';
import { createOptions, Options } from '../../src/Options';
import { wrapUpdateOperation } from '../../src/ops/update';
import { createRegistry, Registry } from '../../src/Registry';
import { ComKey, Item } from '@fjell/core';

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
    mockCoordinate = createCoordinate(['test', 'level1']);
  });

  describe('basic update operation', () => {
    test('should call wrapped operations update with correct parameters using ComKey', async () => {
      const updateOperation = wrapUpdateOperation(mockOperations, mockOptions, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
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

    test('should propagate errors from underlying operations as UpdateError', async () => {
      const updateOperation = wrapUpdateOperation(mockOperations, mockOptions, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const item: Partial<TestItem> = { name: 'updated-name' };
      const updateError = new Error('Database error');

      (mockOperations.update as any).mockRejectedValue(updateError);

      await expect(updateOperation(key, item)).rejects.toThrow(UpdateError);
    });
  });

  describe('pre-update hooks', () => {
    test('should run preUpdate hook and use modified item', async () => {
      const preUpdateHook = vi.fn().mockResolvedValue({ name: 'hook-modified-name', id: 'hook-id' });
      const optionsWithHook = {
        ...mockOptions,
        hooks: { preUpdate: preUpdateHook }
      };

      const updateOperation = wrapUpdateOperation(mockOperations, optionsWithHook, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const originalItem: Partial<TestItem> = { name: 'original-name' };
      const expectedResult: TestItem = {
        id: 'hook-id',
        name: 'hook-modified-name',
        key
      } as TestItem;

      (mockOperations.update as any).mockResolvedValue(expectedResult);

      const result = await updateOperation(key, originalItem);

      expect(preUpdateHook).toHaveBeenCalledWith(key, originalItem);
      expect(mockOperations.update).toHaveBeenCalledWith(key, { name: 'hook-modified-name', id: 'hook-id' });
      expect(result).toEqual(expectedResult);
    });

    test('should throw HookError when preUpdate hook fails', async () => {
      const hookError = new Error('Hook failed');
      const preUpdateHook = vi.fn().mockRejectedValue(hookError);
      const optionsWithHook = {
        ...mockOptions,
        hooks: { preUpdate: preUpdateHook }
      };

      const updateOperation = wrapUpdateOperation(mockOperations, optionsWithHook, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const item: Partial<TestItem> = { name: 'test-name' };

      await expect(updateOperation(key, item)).rejects.toThrow(HookError);
      expect(mockOperations.update).not.toHaveBeenCalled();
    });

    test('should work without preUpdate hook', async () => {
      const updateOperation = wrapUpdateOperation(mockOperations, mockOptions, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const item: Partial<TestItem> = { name: 'test-name' };
      const expectedResult: TestItem = {
        id: 'test-id',
        name: 'test-name',
        key
      } as TestItem;

      (mockOperations.update as any).mockResolvedValue(expectedResult);

      const result = await updateOperation(key, item);

      expect(mockOperations.update).toHaveBeenCalledWith(key, item);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('post-update hooks', () => {
    test('should run postUpdate hook and return modified result', async () => {
      const postUpdateHook = vi.fn().mockResolvedValue({
        id: 'modified-id',
        name: 'hook-modified-result',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem);
      const optionsWithHook = {
        ...mockOptions,
        hooks: { postUpdate: postUpdateHook }
      };

      const updateOperation = wrapUpdateOperation(mockOperations, optionsWithHook, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const item: Partial<TestItem> = { name: 'test-name' };
      const updateResult: TestItem = {
        id: 'test-id',
        name: 'test-name',
        key
      } as TestItem;

      (mockOperations.update as any).mockResolvedValue(updateResult);

      const result = await updateOperation(key, item);

      expect(postUpdateHook).toHaveBeenCalledWith(updateResult);
      expect(result).toEqual({
        id: 'modified-id',
        name: 'hook-modified-result',
        key: { kt: 'test', pk: 'test-id' }
      });
    });

    test('should throw UpdateError with HookError as cause when postUpdate hook fails', async () => {
      const hookError = new Error('Post-hook failed');
      const postUpdateHook = vi.fn().mockRejectedValue(hookError);
      const optionsWithHook = {
        ...mockOptions,
        hooks: { postUpdate: postUpdateHook }
      };

      const updateOperation = wrapUpdateOperation(mockOperations, optionsWithHook, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const item: Partial<TestItem> = { name: 'test-name' };
      const updateResult: TestItem = {
        id: 'test-id',
        name: 'test-name',
        key
      } as TestItem;

      (mockOperations.update as any).mockResolvedValue(updateResult);

      await expect(updateOperation(key, item)).rejects.toThrow(UpdateError);
      try {
        await updateOperation(key, item);
      } catch (error: any) {
        expect(error.cause).toBeInstanceOf(HookError);
      }
    });

    test('should work without postUpdate hook', async () => {
      const updateOperation = wrapUpdateOperation(mockOperations, mockOptions, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const item: Partial<TestItem> = { name: 'test-name' };
      const expectedResult: TestItem = {
        id: 'test-id',
        name: 'test-name',
        key
      } as TestItem;

      (mockOperations.update as any).mockResolvedValue(expectedResult);

      const result = await updateOperation(key, item);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('validation', () => {
    test('should run validation and proceed when valid', async () => {
      const validator = vi.fn().mockResolvedValue(true);
      const optionsWithValidator = {
        ...mockOptions,
        validators: { onUpdate: validator }
      };

      const updateOperation = wrapUpdateOperation(mockOperations, optionsWithValidator, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const item: Partial<TestItem> = { name: 'test-name' };
      const expectedResult: TestItem = {
        id: 'test-id',
        name: 'test-name',
        key
      } as TestItem;

      (mockOperations.update as any).mockResolvedValue(expectedResult);

      const result = await updateOperation(key, item);

      expect(validator).toHaveBeenCalledWith(key, item);
      expect(mockOperations.update).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    test('should throw UpdateValidationError when validation returns false', async () => {
      const validator = vi.fn().mockResolvedValue(false);
      const optionsWithValidator = {
        ...mockOptions,
        validators: { onUpdate: validator }
      };

      const updateOperation = wrapUpdateOperation(mockOperations, optionsWithValidator, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const item: Partial<TestItem> = { name: 'test-name' };

      await expect(updateOperation(key, item)).rejects.toThrow(UpdateValidationError);
      expect(validator).toHaveBeenCalledWith(key, item);
      expect(mockOperations.update).not.toHaveBeenCalled();
    });

    test('should throw UpdateValidationError when validator throws error', async () => {
      const validationError = new Error('Validation failed');
      const validator = vi.fn().mockRejectedValue(validationError);
      const optionsWithValidator = {
        ...mockOptions,
        validators: { onUpdate: validator }
      };

      const updateOperation = wrapUpdateOperation(mockOperations, optionsWithValidator, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const item: Partial<TestItem> = { name: 'test-name' };

      await expect(updateOperation(key, item)).rejects.toThrow(UpdateValidationError);
      expect(validator).toHaveBeenCalledWith(key, item);
      expect(mockOperations.update).not.toHaveBeenCalled();
    });

    test('should work without validation', async () => {
      const updateOperation = wrapUpdateOperation(mockOperations, mockOptions, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const item: Partial<TestItem> = { name: 'test-name' };
      const expectedResult: TestItem = {
        id: 'test-id',
        name: 'test-name',
        key
      } as TestItem;

      (mockOperations.update as any).mockResolvedValue(expectedResult);

      const result = await updateOperation(key, item);

      expect(mockOperations.update).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('combined scenarios', () => {
    test('should run preUpdate hook, validation, update, and postUpdate hook in sequence', async () => {
      const preUpdateHook = vi.fn().mockResolvedValue({ name: 'pre-hook-modified' });
      const validator = vi.fn().mockResolvedValue(true);
      const postUpdateHook = vi.fn().mockResolvedValue({
        id: 'post-hook-id',
        name: 'post-hook-modified',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem);

      const optionsWithAll = {
        ...mockOptions,
        hooks: {
          preUpdate: preUpdateHook,
          postUpdate: postUpdateHook
        },
        validators: { onUpdate: validator }
      };

      const updateOperation = wrapUpdateOperation(mockOperations, optionsWithAll, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const originalItem: Partial<TestItem> = { name: 'original' };
      const updateResult: TestItem = {
        id: 'updated-id',
        name: 'pre-hook-modified',
        key
      } as TestItem;

      (mockOperations.update as any).mockResolvedValue(updateResult);

      const result = await updateOperation(key, originalItem);

      expect(preUpdateHook).toHaveBeenCalledWith(key, originalItem);
      expect(validator).toHaveBeenCalledWith(key, { name: 'pre-hook-modified' });
      expect(mockOperations.update).toHaveBeenCalledWith(key, { name: 'pre-hook-modified' });
      expect(postUpdateHook).toHaveBeenCalledWith(updateResult);
      expect(result).toEqual({
        id: 'post-hook-id',
        name: 'post-hook-modified',
        key: { kt: 'test', pk: 'test-id' }
      });
    });

    test('should stop execution if preUpdate hook fails', async () => {
      const preUpdateHook = vi.fn().mockRejectedValue(new Error('Pre-hook failed'));
      const validator = vi.fn();
      const postUpdateHook = vi.fn();

      const optionsWithAll = {
        ...mockOptions,
        hooks: {
          preUpdate: preUpdateHook,
          postUpdate: postUpdateHook
        },
        validators: { onUpdate: validator }
      };

      const updateOperation = wrapUpdateOperation(mockOperations, optionsWithAll, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const item: Partial<TestItem> = { name: 'test' };

      await expect(updateOperation(key, item)).rejects.toThrow(HookError);
      expect(preUpdateHook).toHaveBeenCalled();
      expect(validator).not.toHaveBeenCalled();
      expect(mockOperations.update).not.toHaveBeenCalled();
      expect(postUpdateHook).not.toHaveBeenCalled();
    });

    test('should stop execution if validation fails', async () => {
      const preUpdateHook = vi.fn().mockResolvedValue({ name: 'pre-hook-modified' });
      const validator = vi.fn().mockResolvedValue(false);
      const postUpdateHook = vi.fn();

      const optionsWithAll = {
        ...mockOptions,
        hooks: {
          preUpdate: preUpdateHook,
          postUpdate: postUpdateHook
        },
        validators: { onUpdate: validator }
      };

      const updateOperation = wrapUpdateOperation(mockOperations, optionsWithAll, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const item: Partial<TestItem> = { name: 'test' };

      await expect(updateOperation(key, item)).rejects.toThrow(UpdateValidationError);
      expect(preUpdateHook).toHaveBeenCalled();
      expect(validator).toHaveBeenCalled();
      expect(mockOperations.update).not.toHaveBeenCalled();
      expect(postUpdateHook).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    test('should handle empty item object', async () => {
      const updateOperation = wrapUpdateOperation(mockOperations, mockOptions, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const item: Partial<TestItem> = {};
      const expectedResult: TestItem = {
        id: 'test-id',
        name: 'existing-name',
        key
      } as TestItem;

      (mockOperations.update as any).mockResolvedValue(expectedResult);

      const result = await updateOperation(key, item);

      expect(mockOperations.update).toHaveBeenCalledWith(key, {});
      expect(result).toEqual(expectedResult);
    });

    test('should handle undefined options', async () => {
      const updateOperation = wrapUpdateOperation(mockOperations, {} as Options<TestItem, 'test', 'level1'>, mockCoordinate, registry);
      const key: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const item: Partial<TestItem> = { name: 'test-name' };
      const expectedResult: TestItem = {
        id: 'test-id',
        name: 'test-name',
        key
      } as TestItem;

      (mockOperations.update as any).mockResolvedValue(expectedResult);

      const result = await updateOperation(key, item);

      expect(result).toEqual(expectedResult);
    });
  });
});
