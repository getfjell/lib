 
import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { ComKey, Item, LocKey, LocKeyArray } from "@fjell/types";
import { wrapCreateOperation } from "../../src/ops/create";
import { Operations } from "../../src/Operations";
import { createRegistry } from "../../src/Registry";
import { CreateValidationError, HookError } from "../../src/errors";
import { createCoordinate } from '@fjell/core';
import { createOptions } from '../../src/Options';

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

interface TestItem extends Item<'test', 'loc1', 'loc2'> {
  name: string;
}

describe('getCreateOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'>;
  let mockDefinition: any;
  let mockCoordinate: any;
  let registry: ReturnType<typeof createRegistry>;

  beforeEach(() => {
    mockOperations = {
      create: vi.fn(),
    } as unknown as Operations<TestItem, 'test', 'loc1', 'loc2'>;

    registry = createRegistry();
    mockDefinition = createOptions<TestItem, 'test', 'loc1', 'loc2'>();
    mockCoordinate = createCoordinate(['test', 'loc1', 'loc2'], ['scope1']);
  });

  test('should call wrapped operations create with correct parameters', async () => {
    const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
    const item: Partial<TestItem> = { name: 'test1' };
    const locations: LocKeyArray<'loc1', 'loc2'> = [
      { kt: 'loc1', lk: 'loc1-id' } as LocKey<'loc1'>,
      { kt: 'loc2', lk: 'loc2-id' } as LocKey<'loc2'>
    ];
    const expectedItem: TestItem = {
      name: 'test1',
      key: { kt: 'test', pk: 'test-id' }
    } as TestItem;

    (mockOperations.create as Mock).mockResolvedValue(expectedItem);

    const result = await createOperation(item, { locations });

    expect(mockOperations.create).toHaveBeenCalledWith(item, { locations });
    expect(result).toEqual(expectedItem);
  });

  test('should handle empty locations array', async () => {
    const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
    const item: Partial<TestItem> = { name: 'test1' };
    const expectedItem: TestItem = {
      name: 'test1',
      key: { kt: 'test', pk: 'test-id' }
    } as TestItem;

    (mockOperations.create as Mock).mockResolvedValue(expectedItem);

    const result = await createOperation(item);

    expect(mockOperations.create).toHaveBeenCalledWith(item, undefined);
    expect(result).toEqual(expectedItem);
  });

  test('should use default empty array for locations if not provided', async () => {
    const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
    const item: Partial<TestItem> = { name: 'test1' };
    const expectedItem: TestItem = {
      name: 'test1',
      key: { kt: 'test', pk: 'test-id' }
    } as TestItem;

    (mockOperations.create as Mock).mockResolvedValue(expectedItem);

    const result = await createOperation(item);

    expect(mockOperations.create).toHaveBeenCalledWith(item, undefined);
    expect(result).toEqual(expectedItem);
  });

  describe('preCreate hook functionality', () => {
    test('should execute preCreate hook and use modified item', async () => {
      const item: Partial<TestItem> = { name: 'original' };
      const modifiedItem: Partial<TestItem> = { name: 'modified' };
      const expectedItem: TestItem = {
        name: 'modified',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;

      const preCreateHook = vi.fn().mockResolvedValue(modifiedItem);
      mockDefinition.hooks = {
        preCreate: preCreateHook
      };

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      (mockOperations.create as Mock).mockResolvedValue(expectedItem);

      const result = await createOperation(item);

      expect(preCreateHook).toHaveBeenCalledWith(item, undefined);
      expect(mockOperations.create).toHaveBeenCalledWith(modifiedItem, undefined);
      expect(result).toEqual(expectedItem);
    });

    test('should execute preCreate hook with options', async () => {
      const item: Partial<TestItem> = { name: 'test1' };
      const locations: LocKeyArray<'loc1', 'loc2'> = [
        { kt: 'loc1', lk: 'loc1-id' } as LocKey<'loc1'>,
        { kt: 'loc2', lk: 'loc2-id' } as LocKey<'loc2'>
      ];
      const options = { locations };
      const expectedItem: TestItem = {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;

      const preCreateHook = vi.fn().mockResolvedValue(item);
      mockDefinition.hooks = {
        preCreate: preCreateHook
      };

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      (mockOperations.create as Mock).mockResolvedValue(expectedItem);

      await createOperation(item, options);

      expect(preCreateHook).toHaveBeenCalledWith(item, options);
    });

    test('should execute preCreate hook with key option', async () => {
      const item: Partial<TestItem> = { name: 'test1' };
      const key: ComKey<'test', 'loc1', 'loc2'> = {
        kt: 'test',
        pk: 'custom-id',
        loc: [
          { kt: 'loc1', lk: 'loc1-id' } as LocKey<'loc1'>,
          { kt: 'loc2', lk: 'loc2-id' } as LocKey<'loc2'>
        ]
      };
      const options = { key };
      const expectedItem: TestItem = {
        name: 'test1',
        key
      } as TestItem;

      const preCreateHook = vi.fn().mockResolvedValue(item);
      mockDefinition.hooks = {
        preCreate: preCreateHook
      };

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      (mockOperations.create as Mock).mockResolvedValue(expectedItem);

      await createOperation(item, options);

      expect(preCreateHook).toHaveBeenCalledWith(item, options);
    });

    test('should wrap preCreate hook errors with HookError', async () => {
      const item: Partial<TestItem> = { name: 'test1' };
      const hookError = new Error('Hook failed');
      const preCreateHook = vi.fn().mockRejectedValue(hookError);

      mockDefinition.hooks = {
        preCreate: preCreateHook
      };

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);

      try {
        await createOperation(item);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.cause).toBeInstanceOf(HookError);
        expect(error.message).toContain('Error in preCreate');
      }
    });

    test('should not execute preCreate hook if not defined', async () => {
      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      const item: Partial<TestItem> = { name: 'test1' };
      const expectedItem: TestItem = {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;

      // No hooks defined

      (mockOperations.create as Mock).mockResolvedValue(expectedItem);

      const result = await createOperation(item);

      expect(mockOperations.create).toHaveBeenCalledWith(item, undefined);
      expect(result).toEqual(expectedItem);
    });
  });

  describe('postCreate hook functionality', () => {
    test('should execute postCreate hook and use modified item', async () => {
      const item: Partial<TestItem> = { name: 'test1' };
      const createdItem: TestItem = {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;
      const modifiedCreatedItem: TestItem = {
        name: 'modified after create',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;

      const postCreateHook = vi.fn().mockResolvedValue(modifiedCreatedItem);
      mockDefinition.hooks = {
        postCreate: postCreateHook
      };

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      (mockOperations.create as Mock).mockResolvedValue(createdItem);

      const result = await createOperation(item);

      expect(postCreateHook).toHaveBeenCalledWith(createdItem);
      expect(result).toEqual(modifiedCreatedItem);
    });

    test('should wrap postCreate hook errors with HookError', async () => {
      const item: Partial<TestItem> = { name: 'test1' };
      const createdItem: TestItem = {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;
      const hookError = new Error('Post hook failed');
      const postCreateHook = vi.fn().mockRejectedValue(hookError);

      mockDefinition.hooks = {
        postCreate: postCreateHook
      };

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      (mockOperations.create as Mock).mockResolvedValue(createdItem);

      try {
        await createOperation(item);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.cause).toBeInstanceOf(HookError);
        expect(error.message).toContain('Error in postCreate');
      }
    });

    test('should not execute postCreate hook if not defined', async () => {
      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      const item: Partial<TestItem> = { name: 'test1' };
      const expectedItem: TestItem = {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;

      // No hooks defined

      (mockOperations.create as Mock).mockResolvedValue(expectedItem);

      const result = await createOperation(item);

      expect(result).toEqual(expectedItem);
    });
  });

  describe('validation functionality', () => {
    test('should execute onCreate validator and proceed when valid', async () => {
      const item: Partial<TestItem> = { name: 'test1' };
      const expectedItem: TestItem = {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;

      const onCreateValidator = vi.fn().mockResolvedValue(true);
      mockDefinition.validators = {
        onCreate: onCreateValidator
      };

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      (mockOperations.create as Mock).mockResolvedValue(expectedItem);

      const result = await createOperation(item);

      expect(onCreateValidator).toHaveBeenCalledWith(item, undefined);
      expect(result).toEqual(expectedItem);
    });

    test('should execute onCreate validator with options', async () => {
      const item: Partial<TestItem> = { name: 'test1' };
      const locations: LocKeyArray<'loc1', 'loc2'> = [
        { kt: 'loc1', lk: 'loc1-id' } as LocKey<'loc1'>,
        { kt: 'loc2', lk: 'loc2-id' } as LocKey<'loc2'>
      ];
      const options = { locations };
      const expectedItem: TestItem = {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;

      const onCreateValidator = vi.fn().mockResolvedValue(true);
      mockDefinition.validators = {
        onCreate: onCreateValidator
      };

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      (mockOperations.create as Mock).mockResolvedValue(expectedItem);

      await createOperation(item, options);

      expect(onCreateValidator).toHaveBeenCalledWith(item, options);
    });

    test('should throw CreateValidationError when validator returns false', async () => {
      const item: Partial<TestItem> = { name: 'test1' };

      const onCreateValidator = vi.fn().mockResolvedValue(false);
      mockDefinition.validators = {
        onCreate: onCreateValidator
      };

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);

      try {
        await createOperation(item);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(CreateValidationError);
      }
    });

    test('should wrap validation errors with CreateValidationError', async () => {
      const item: Partial<TestItem> = { name: 'test1' };
      const validationError = new Error('Validation failed');

      const onCreateValidator = vi.fn().mockRejectedValue(validationError);
      mockDefinition.validators = {
        onCreate: onCreateValidator
      };

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);

      try {
        await createOperation(item);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(CreateValidationError);
      }
    });

    test('should not execute onCreate validator if not defined', async () => {
      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      const item: Partial<TestItem> = { name: 'test1' };
      const expectedItem: TestItem = {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;

      // No validators defined

      (mockOperations.create as Mock).mockResolvedValue(expectedItem);

      const result = await createOperation(item);

      expect(result).toEqual(expectedItem);
    });
  });

  describe('combined hook and validation functionality', () => {
    test('should execute preCreate hook, validation, and postCreate hook in correct order', async () => {
      const item: Partial<TestItem> = { name: 'original' };
      const modifiedItem: Partial<TestItem> = { name: 'modified by preCreate' };
      const createdItem: TestItem = {
        name: 'modified by preCreate',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;
      const finalItem: TestItem = {
        name: 'modified by postCreate',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;

      const executionOrder: string[] = [];
      const preCreateHook = vi.fn().mockImplementation(async () => {
        executionOrder.push('preCreate');
        return modifiedItem;
      });
      const onCreateValidator = vi.fn().mockImplementation(async () => {
        executionOrder.push('validate');
        return true;
      });
      const postCreateHook = vi.fn().mockImplementation(async () => {
        executionOrder.push('postCreate');
        return finalItem;
      });

      mockDefinition.hooks = {
        preCreate: preCreateHook,
        postCreate: postCreateHook
      };
      mockDefinition.validators = {
        onCreate: onCreateValidator
      };

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      (mockOperations.create as Mock).mockImplementation(async () => {
        executionOrder.push('create');
        return createdItem;
      });

      const result = await createOperation(item);

      expect(executionOrder).toEqual(['preCreate', 'validate', 'create', 'postCreate']);
      expect(preCreateHook).toHaveBeenCalledWith(item, undefined);
      expect(onCreateValidator).toHaveBeenCalledWith(modifiedItem, undefined);
      expect(mockOperations.create).toHaveBeenCalledWith(modifiedItem, undefined);
      expect(postCreateHook).toHaveBeenCalledWith(createdItem);
      expect(result).toEqual(finalItem);
    });

    test('should stop execution if validation fails after preCreate hook', async () => {
      const item: Partial<TestItem> = { name: 'original' };
      const modifiedItem: Partial<TestItem> = { name: 'modified by preCreate' };

      const preCreateHook = vi.fn().mockResolvedValue(modifiedItem);
      const onCreateValidator = vi.fn().mockResolvedValue(false);
      const postCreateHook = vi.fn();

      mockDefinition.hooks = {
        preCreate: preCreateHook,
        postCreate: postCreateHook
      };
      mockDefinition.validators = {
        onCreate: onCreateValidator
      };

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);

      try {
        await createOperation(item);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(CreateValidationError);
      }

      expect(preCreateHook).toHaveBeenCalled();
      expect(onCreateValidator).toHaveBeenCalledWith(modifiedItem, undefined);
      expect(mockOperations.create).not.toHaveBeenCalled();
      expect(postCreateHook).not.toHaveBeenCalled();
    });
  });

  describe('error handling from underlying operations', () => {
    test('should propagate errors from toWrap.create', async () => {
      const item: Partial<TestItem> = { name: 'test1' };
      const createError = new Error('Database error');

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      (mockOperations.create as Mock).mockRejectedValue(createError);

      await expect(createOperation(item)).rejects.toThrow('Database error');
    });

    test('should propagate errors even when hooks are present', async () => {
      const item: Partial<TestItem> = { name: 'test1' };
      const createError = new Error('Database error');
      const preCreateHook = vi.fn().mockResolvedValue(item);
      const postCreateHook = vi.fn();

      mockDefinition.hooks = {
        preCreate: preCreateHook,
        postCreate: postCreateHook
      };

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      (mockOperations.create as Mock).mockRejectedValue(createError);

      await expect(createOperation(item)).rejects.toThrow('Database error');
      expect(preCreateHook).toHaveBeenCalled();
      expect(postCreateHook).not.toHaveBeenCalled(); // Should not be called due to error
    });
  });

  describe('edge cases and option handling', () => {
    test('should handle ComKey options', async () => {
      const item: Partial<TestItem> = { name: 'test1' };
      const key: ComKey<'test', 'loc1', 'loc2'> = {
        kt: 'test',
        pk: 'primary-key',
        loc: [
          { kt: 'loc1', lk: 'loc1-key' },
          { kt: 'loc2', lk: 'loc2-key' }
        ]
      };
      const options = { key };
      const expectedItem: TestItem = {
        name: 'test1',
        key
      } as TestItem;

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      (mockOperations.create as Mock).mockResolvedValue(expectedItem);

      const result = await createOperation(item, options);

      expect(mockOperations.create).toHaveBeenCalledWith(item, options);
      expect(result).toEqual(expectedItem);
    });

    test('should handle undefined options gracefully', async () => {
      const item: Partial<TestItem> = { name: 'test1' };
      const expectedItem: TestItem = {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      (mockOperations.create as Mock).mockResolvedValue(expectedItem);

      const result = await createOperation(item, undefined);

      expect(mockOperations.create).toHaveBeenCalledWith(item, undefined);
      expect(result).toEqual(expectedItem);
    });

    test('should handle empty options object', async () => {
      const item: Partial<TestItem> = { name: 'test1' };
      const expectedItem: TestItem = {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      (mockOperations.create as Mock).mockResolvedValue(expectedItem);

      // @ts-expect-error Testing edge case with empty object
      const result = await createOperation(item, {});

      expect(mockOperations.create).toHaveBeenCalledWith(item, {});
      expect(result).toEqual(expectedItem);
    });
  });

  describe('type safety and parameter validation', () => {
    test('should maintain type safety with TypesProperties', async () => {
      const item: Partial<Item<'test', 'loc1', 'loc2'>> = { name: 'test1' };
      const expectedItem: TestItem = {
        name: 'test1',
        key: { kt: 'test', pk: 'test-id' }
      } as TestItem;

      const createOperation = wrapCreateOperation(mockOperations, mockDefinition, mockCoordinate, registry);
      (mockOperations.create as Mock).mockResolvedValue(expectedItem);

      const result = await createOperation(item);

      expect(result).toEqual(expectedItem);
      expect(typeof result.name).toBe('string');
      expect(result.key).toBeDefined();
    });
  });
});
