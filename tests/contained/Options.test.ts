import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { MockedFunction } from 'vitest';
import { createOptions, Options } from '@/contained/Options';
import { createOptions as createAbstractOptions } from '@/Options';
import { ComKey, Item, LocKeyArray, PriKey, TypesProperties } from '@fjell/core';

// Mock the logging module
vi.mock('@fjell/logging', () => {
  const logger = {
    get: vi.fn().mockReturnThis(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    emergency: vi.fn(),
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

// Mock the abstract Options module
vi.mock('@/Options', () => ({
  createOptions: vi.fn(),
}));

const mockCreateAbstractOptions = createAbstractOptions as MockedFunction<typeof createAbstractOptions>;

// Test types
type TestItem = Item<'test', 'loc1', 'loc2'>;
type TestKey = PriKey<'test'>;
type TestComKey = ComKey<'test', 'loc1', 'loc2'>;
type TestLocations = LocKeyArray<'loc1', 'loc2'>;

describe('Contained Options', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOptions', () => {
    test('should call abstract createOptions with provided options', () => {
      const mockAbstractOptions = {
        hooks: {
          preCreate: vi.fn(),
          postCreate: vi.fn(),
        },
        validators: {
          onCreate: vi.fn(),
        }
      };

      mockCreateAbstractOptions.mockReturnValue(mockAbstractOptions);

      const inputOptions: Options<TestItem, 'test', 'loc1', 'loc2'> = {
        hooks: {
          preCreate: async (item) => item,
          postCreate: async (item) => item,
        },
        validators: {
          onCreate: async () => true,
        }
      };

      const result = createOptions(inputOptions);

      expect(mockCreateAbstractOptions).toHaveBeenCalledWith(inputOptions);
      expect(result).toEqual(mockAbstractOptions);
    });

    test('should call abstract createOptions when no options provided', () => {
      const mockAbstractOptions = {
        hooks: {
          preCreate: vi.fn(),
        }
      };

      mockCreateAbstractOptions.mockReturnValue(mockAbstractOptions);

      const result = createOptions<TestItem, 'test', 'loc1', 'loc2'>();

      expect(mockCreateAbstractOptions).toHaveBeenCalledTimes(1);
      const callArgs = mockCreateAbstractOptions.mock.calls[0];
      expect(callArgs[0]).toBeUndefined();
      expect(result).toEqual(mockAbstractOptions);
    });

    test('should return options with all properties from abstract options', () => {
      const mockAbstractOptions = {
        hooks: {
          preCreate: vi.fn(),
          postCreate: vi.fn(),
          preUpdate: vi.fn(),
          postUpdate: vi.fn(),
          preRemove: vi.fn(),
          postRemove: vi.fn(),
        },
        validators: {
          onCreate: vi.fn(),
          onUpdate: vi.fn(),
          onRemove: vi.fn(),
        },
        finders: {
          findByName: vi.fn(),
        },
        actions: {
          customAction: vi.fn(),
        }
      };

      mockCreateAbstractOptions.mockReturnValue(mockAbstractOptions);

      const result = createOptions<TestItem, 'test', 'loc1', 'loc2'>();

      expect(result.hooks).toBeDefined();
      expect(result.validators).toBeDefined();
      expect(result.finders).toBeDefined();
      expect(result.actions).toBeDefined();
    });
  });

  describe('Options interface', () => {
    test('should support hooks with contained-specific signatures', async () => {
      const preCreateHook = vi.fn().mockResolvedValue({ name: 'test' });
      const postCreateHook = vi.fn().mockResolvedValue({} as TestItem);
      const preUpdateHook = vi.fn().mockResolvedValue({ name: 'updated' });
      const postUpdateHook = vi.fn().mockResolvedValue({} as TestItem);
      const preRemoveHook = vi.fn().mockResolvedValue({ name: 'removed' });
      const postRemoveHook = vi.fn().mockResolvedValue({} as TestItem);

      const options: Options<TestItem, 'test', 'loc1', 'loc2'> = {
        hooks: {
          preCreate: preCreateHook,
          postCreate: postCreateHook,
          preUpdate: preUpdateHook,
          postUpdate: postUpdateHook,
          preRemove: preRemoveHook,
          postRemove: postRemoveHook,
        }
      };

      const testItem = { name: 'test' } as TypesProperties<TestItem, 'test', 'loc1', 'loc2'>;
      const testKey = { kt: 'test', pk: '1' } as TestKey;
      const testCreatedItem = {} as TestItem;
      const testLocations = [] as unknown as TestLocations;

      // Test preCreate hook with locations
      await options.hooks?.preCreate?.(testItem, { locations: testLocations });
      expect(preCreateHook).toHaveBeenCalledWith(testItem, { locations: testLocations });

      // Test postCreate hook
      await options.hooks?.postCreate?.(testCreatedItem);
      expect(postCreateHook).toHaveBeenCalledWith(testCreatedItem);

      // Test preUpdate hook
      await options.hooks?.preUpdate?.(testKey, testItem);
      expect(preUpdateHook).toHaveBeenCalledWith(testKey, testItem);

      // Test postUpdate hook
      await options.hooks?.postUpdate?.(testCreatedItem);
      expect(postUpdateHook).toHaveBeenCalledWith(testCreatedItem);

      // Test preRemove hook
      await options.hooks?.preRemove?.(testKey);
      expect(preRemoveHook).toHaveBeenCalledWith(testKey);

      // Test postRemove hook
      await options.hooks?.postRemove?.(testCreatedItem);
      expect(postRemoveHook).toHaveBeenCalledWith(testCreatedItem);
    });

    test('should support validators with contained-specific signatures', async () => {
      const onCreateValidator = vi.fn().mockResolvedValue(true);
      const onUpdateValidator = vi.fn().mockResolvedValue(true);
      const onRemoveValidator = vi.fn().mockResolvedValue(true);

      const options: Options<TestItem, 'test', 'loc1', 'loc2'> = {
        validators: {
          onCreate: onCreateValidator,
          onUpdate: onUpdateValidator,
          onRemove: onRemoveValidator,
        }
      };

      const testItem = { name: 'test' } as TypesProperties<TestItem, 'test', 'loc1', 'loc2'>;
      const testKey = { kt: 'test', pk: '1' } as TestKey;
      const testLocations = [] as unknown as TestLocations;

      // Test onCreate validator with locations
      const createResult = await options.validators?.onCreate?.(testItem, { locations: testLocations });
      expect(onCreateValidator).toHaveBeenCalledWith(testItem, { locations: testLocations });
      expect(createResult).toBe(true);

      // Test onUpdate validator
      const updateResult = await options.validators?.onUpdate?.(testKey, testItem);
      expect(onUpdateValidator).toHaveBeenCalledWith(testKey, testItem);
      expect(updateResult).toBe(true);

      // Test onRemove validator
      const removeResult = await options.validators?.onRemove?.(testKey);
      expect(onRemoveValidator).toHaveBeenCalledWith(testKey);
      expect(removeResult).toBe(true);
    });

    test('should support finders that return promise of items array', async () => {
      const mockItems = [] as TestItem[];
      const finderMethod = vi.fn().mockResolvedValue(mockItems);

      const options: Options<TestItem, 'test', 'loc1', 'loc2'> = {
        finders: {
          findByName: finderMethod,
          findByStatus: finderMethod,
        }
      };

      const finderParams = { name: 'test', active: true };
      const result = await options.finders?.findByName?.(finderParams);

      expect(finderMethod).toHaveBeenCalledWith(finderParams);
      expect(result).toEqual(mockItems);
      expect(Array.isArray(result)).toBe(true);
    });

    test('should support actions with proper signatures', async () => {
      const mockResult = {} as TestItem;
      const actionMethod = vi.fn().mockResolvedValue(mockResult);

      const options: Options<TestItem, 'test', 'loc1', 'loc2'> = {
        actions: {
          activate: actionMethod,
          deactivate: actionMethod,
        }
      };

      const testItem = {} as TestItem;
      const actionParams = { status: 'active', timestamp: new Date() };

      const result = await options.actions?.activate?.(testItem, actionParams);

      expect(actionMethod).toHaveBeenCalledWith(testItem, actionParams);
      expect(result).toEqual(mockResult);
    });

    test('should support composite keys in hooks and validators', async () => {
      const preUpdateHook = vi.fn().mockResolvedValue({ name: 'updated' });
      const onUpdateValidator = vi.fn().mockResolvedValue(true);

      const options: Options<TestItem, 'test', 'loc1', 'loc2'> = {
        hooks: {
          preUpdate: preUpdateHook,
        },
        validators: {
          onUpdate: onUpdateValidator,
        }
      };

      const testComKey = {} as TestComKey;
      const testItem = { name: 'test' } as TypesProperties<TestItem, 'test', 'loc1', 'loc2'>;

      // Test with composite key
      await options.hooks?.preUpdate?.(testComKey, testItem);
      expect(preUpdateHook).toHaveBeenCalledWith(testComKey, testItem);

      await options.validators?.onUpdate?.(testComKey, testItem);
      expect(onUpdateValidator).toHaveBeenCalledWith(testComKey, testItem);
    });

    test('should handle empty options object', () => {
      const mockAbstractOptions = {};
      mockCreateAbstractOptions.mockReturnValue(mockAbstractOptions);

      const options: Options<TestItem, 'test', 'loc1', 'loc2'> = {};
      const result = createOptions(options);

      expect(mockCreateAbstractOptions).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockAbstractOptions);
    });
  });
});
