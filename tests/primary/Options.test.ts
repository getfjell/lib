import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Options } from '@/primary/Options';
import { Item, PriKey, TypesProperties } from '@fjell/core';
import { FinderParams } from '@/Options';

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

// Test interfaces for testing purposes
interface TestItem extends Item<'test'> {
  name: string;
  value: number;
}

type TestProperties = TypesProperties<TestItem, 'test'>;

describe('Primary Options Interface', () => {
  describe('Interface Structure', () => {
    test('should allow empty options object', () => {
      const options: Options<TestItem, 'test'> = {};

      expect(options).toBeDefined();
      expect(options.hooks).toBeUndefined();
      expect(options.validators).toBeUndefined();
      expect(options.finders).toBeUndefined();
    });

    test('should allow options with only hooks', () => {
      const preCreateHook = vi.fn().mockResolvedValue({ name: 'test', value: 1 });

      const options: Options<TestItem, 'test'> = {
        hooks: {
          preCreate: preCreateHook
        }
      };

      expect(options.hooks).toBeDefined();
      expect(options.hooks?.preCreate).toBe(preCreateHook);
      expect(options.validators).toBeUndefined();
      expect(options.finders).toBeUndefined();
    });

    test('should allow options with only validators', () => {
      const onCreateValidator = vi.fn().mockResolvedValue(true);

      const options: Options<TestItem, 'test'> = {
        validators: {
          onCreate: onCreateValidator
        }
      };

      expect(options.validators).toBeDefined();
      expect(options.validators?.onCreate).toBe(onCreateValidator);
      expect(options.hooks).toBeUndefined();
      expect(options.finders).toBeUndefined();
    });

    test('should allow options with only finders', () => {
      const testFinder = vi.fn().mockResolvedValue([]);

      const options: Options<TestItem, 'test'> = {
        finders: {
          byName: testFinder
        }
      };

      expect(options.finders).toBeDefined();
      expect(options.finders?.byName).toBe(testFinder);
      expect(options.hooks).toBeUndefined();
      expect(options.validators).toBeUndefined();
    });
  });

  describe('Hooks', () => {
    let testItem: TestProperties;
    let testKey: PriKey<'test'>;

    beforeEach(() => {
      testItem = {
        name: 'test-item',
        value: 42
      };
      testKey = {
        kt: 'test',
        pk: 'test-key'
      } as PriKey<'test'>;
    });

    describe('preCreate hook', () => {
      test('should accept preCreate hook with item parameter', async () => {
        const preCreateHook = vi.fn().mockResolvedValue(testItem);

        const options: Options<TestItem, 'test'> = {
          hooks: {
            preCreate: preCreateHook
          }
        };

        const result = await options.hooks?.preCreate?.(testItem);

        expect(preCreateHook).toHaveBeenCalledWith(testItem);
        expect(result).toEqual(testItem);
      });

      test('should accept preCreate hook with item and key option', async () => {
        const preCreateHook = vi.fn().mockResolvedValue(testItem);

        const options: Options<TestItem, 'test'> = {
          hooks: {
            preCreate: preCreateHook
          }
        };

        const result = await options.hooks?.preCreate?.(testItem, { key: testKey });

        expect(preCreateHook).toHaveBeenCalledWith(testItem, { key: testKey });
        expect(result).toEqual(testItem);
      });

      test('should return modified item from preCreate hook', async () => {
        const modifiedItem = { ...testItem, name: 'modified' };
        const preCreateHook = vi.fn().mockResolvedValue(modifiedItem);

        const options: Options<TestItem, 'test'> = {
          hooks: {
            preCreate: preCreateHook
          }
        };

        const result = await options.hooks?.preCreate?.(testItem);

        expect(result).toEqual(modifiedItem);
        expect(result?.name).toBe('modified');
      });
    });

    describe('postCreate hook', () => {
      test('should accept postCreate hook with item parameter', async () => {
        const testItemWithId = { ...testItem, key: testKey } as TestItem;
        const postCreateHook = vi.fn().mockResolvedValue(testItemWithId);

        const options: Options<TestItem, 'test'> = {
          hooks: {
            postCreate: postCreateHook
          }
        };

        const result = await options.hooks?.postCreate?.(testItemWithId);

        expect(postCreateHook).toHaveBeenCalledWith(testItemWithId);
        expect(result).toEqual(testItemWithId);
      });
    });

    describe('preUpdate hook', () => {
      test('should accept preUpdate hook with key and item parameters', async () => {
        const preUpdateHook = vi.fn().mockResolvedValue(testItem);

        const options: Options<TestItem, 'test'> = {
          hooks: {
            preUpdate: preUpdateHook
          }
        };

        const result = await options.hooks?.preUpdate?.(testKey, testItem);

        expect(preUpdateHook).toHaveBeenCalledWith(testKey, testItem);
        expect(result).toEqual(testItem);
      });

      test('should return modified item from preUpdate hook', async () => {
        const modifiedItem = { ...testItem, value: 100 };
        const preUpdateHook = vi.fn().mockResolvedValue(modifiedItem);

        const options: Options<TestItem, 'test'> = {
          hooks: {
            preUpdate: preUpdateHook
          }
        };

        const result = await options.hooks?.preUpdate?.(testKey, testItem);

        expect(result).toEqual(modifiedItem);
        expect(result?.value).toBe(100);
      });
    });

    describe('postUpdate hook', () => {
      test('should accept postUpdate hook with item parameter', async () => {
        const updatedItem = { ...testItem, value: 100, key: testKey } as TestItem;
        const postUpdateHook = vi.fn().mockResolvedValue(updatedItem);

        const options: Options<TestItem, 'test'> = {
          hooks: {
            postUpdate: postUpdateHook
          }
        };

        const result = await options.hooks?.postUpdate?.(updatedItem);

        expect(postUpdateHook).toHaveBeenCalledWith(updatedItem);
        expect(result).toEqual(updatedItem);
      });
    });

    describe('preRemove hook', () => {
      test('should accept preRemove hook with key parameter', async () => {
        const preRemoveHook = vi.fn().mockResolvedValue(testItem);

        const options: Options<TestItem, 'test'> = {
          hooks: {
            preRemove: preRemoveHook
          }
        };

        const result = await options.hooks?.preRemove?.(testKey);

        expect(preRemoveHook).toHaveBeenCalledWith(testKey);
        expect(result).toEqual(testItem);
      });
    });

    describe('postRemove hook', () => {
      test('should accept postRemove hook with item parameter', async () => {
        const removedItem = { ...testItem, key: testKey } as TestItem;
        const postRemoveHook = vi.fn().mockResolvedValue(removedItem);

        const options: Options<TestItem, 'test'> = {
          hooks: {
            postRemove: postRemoveHook
          }
        };

        const result = await options.hooks?.postRemove?.(removedItem);

        expect(postRemoveHook).toHaveBeenCalledWith(removedItem);
        expect(result).toEqual(removedItem);
      });
    });

    test('should allow all hooks together', () => {
      const options: Options<TestItem, 'test'> = {
        hooks: {
          preCreate: vi.fn().mockResolvedValue(testItem),
          postCreate: vi.fn().mockResolvedValue({} as TestItem),
          preUpdate: vi.fn().mockResolvedValue(testItem),
          postUpdate: vi.fn().mockResolvedValue({} as TestItem),
          preRemove: vi.fn().mockResolvedValue(testItem),
          postRemove: vi.fn().mockResolvedValue({} as TestItem)
        }
      };

      expect(options.hooks?.preCreate).toBeDefined();
      expect(options.hooks?.postCreate).toBeDefined();
      expect(options.hooks?.preUpdate).toBeDefined();
      expect(options.hooks?.postUpdate).toBeDefined();
      expect(options.hooks?.preRemove).toBeDefined();
      expect(options.hooks?.postRemove).toBeDefined();
    });
  });

  describe('Validators', () => {
    let testItem: TestProperties;
    let testKey: PriKey<'test'>;

    beforeEach(() => {
      testItem = {
        name: 'test-item',
        value: 42
      };
      testKey = {
        kt: 'test',
        pk: 'test-key'
      } as PriKey<'test'>;
    });

    describe('onCreate validator', () => {
      test('should accept onCreate validator with item parameter', async () => {
        const onCreateValidator = vi.fn().mockResolvedValue(true);

        const options: Options<TestItem, 'test'> = {
          validators: {
            onCreate: onCreateValidator
          }
        };

        const result = await options.validators?.onCreate?.(testItem);

        expect(onCreateValidator).toHaveBeenCalledWith(testItem);
        expect(result).toBe(true);
      });

      test('should accept onCreate validator with item and key option', async () => {
        const onCreateValidator = vi.fn().mockResolvedValue(false);

        const options: Options<TestItem, 'test'> = {
          validators: {
            onCreate: onCreateValidator
          }
        };

        const result = await options.validators?.onCreate?.(testItem, { key: testKey });

        expect(onCreateValidator).toHaveBeenCalledWith(testItem, { key: testKey });
        expect(result).toBe(false);
      });

      test('should return boolean from onCreate validator', async () => {
        const onCreateValidator = vi.fn().mockResolvedValue(true);

        const options: Options<TestItem, 'test'> = {
          validators: {
            onCreate: onCreateValidator
          }
        };

        const result = await options.validators?.onCreate?.(testItem);

        expect(typeof result).toBe('boolean');
      });
    });

    describe('onUpdate validator', () => {
      test('should accept onUpdate validator with key and item parameters', async () => {
        const onUpdateValidator = vi.fn().mockResolvedValue(true);

        const options: Options<TestItem, 'test'> = {
          validators: {
            onUpdate: onUpdateValidator
          }
        };

        const result = await options.validators?.onUpdate?.(testKey, testItem);

        expect(onUpdateValidator).toHaveBeenCalledWith(testKey, testItem);
        expect(result).toBe(true);
      });

      test('should return boolean from onUpdate validator', async () => {
        const onUpdateValidator = vi.fn().mockResolvedValue(false);

        const options: Options<TestItem, 'test'> = {
          validators: {
            onUpdate: onUpdateValidator
          }
        };

        const result = await options.validators?.onUpdate?.(testKey, testItem);

        expect(typeof result).toBe('boolean');
      });
    });

    describe('onRemove validator', () => {
      test('should accept onRemove validator with key parameter', async () => {
        const onRemoveValidator = vi.fn().mockResolvedValue(true);

        const options: Options<TestItem, 'test'> = {
          validators: {
            onRemove: onRemoveValidator
          }
        };

        const result = await options.validators?.onRemove?.(testKey);

        expect(onRemoveValidator).toHaveBeenCalledWith(testKey);
        expect(result).toBe(true);
      });

      test('should return boolean from onRemove validator', async () => {
        const onRemoveValidator = vi.fn().mockResolvedValue(false);

        const options: Options<TestItem, 'test'> = {
          validators: {
            onRemove: onRemoveValidator
          }
        };

        const result = await options.validators?.onRemove?.(testKey);

        expect(typeof result).toBe('boolean');
      });
    });

    test('should allow all validators together', () => {
      const options: Options<TestItem, 'test'> = {
        validators: {
          onCreate: vi.fn().mockResolvedValue(true),
          onUpdate: vi.fn().mockResolvedValue(true),
          onRemove: vi.fn().mockResolvedValue(true)
        }
      };

      expect(options.validators?.onCreate).toBeDefined();
      expect(options.validators?.onUpdate).toBeDefined();
      expect(options.validators?.onRemove).toBeDefined();
    });
  });

  describe('Finders', () => {
    let testKey: PriKey<'test'>;

    beforeEach(() => {
      testKey = {
        kt: 'test',
        pk: 'test-key'
      } as PriKey<'test'>;
    });

    test('should accept finders as Record of string to function', async () => {
      const byNameFinder = vi.fn().mockResolvedValue([]);
      const byValueFinder = vi.fn().mockResolvedValue([]);

      const options: Options<TestItem, 'test'> = {
        finders: {
          byName: byNameFinder,
          byValue: byValueFinder
        }
      };

      expect(options.finders?.byName).toBe(byNameFinder);
      expect(options.finders?.byValue).toBe(byValueFinder);
    });

    test('should accept finder with FinderParams parameter', async () => {
      const testParams: FinderParams = {
        name: 'test',
        value: 42,
        active: true,
        date: new Date(),
        tags: ['tag1', 'tag2']
      };

      const testResults = [{ name: 'item1', value: 10, key: testKey } as TestItem];
      const finderFunction = vi.fn().mockResolvedValue(testResults);

      const options: Options<TestItem, 'test'> = {
        finders: {
          search: finderFunction
        }
      };

      const result = await options.finders?.search?.(testParams);

      expect(finderFunction).toHaveBeenCalledWith(testParams);
      expect(result).toEqual(testResults);
    });

    test('should return array of items and handle different finder scenarios', async () => {
      const testResults = [
         { name: 'item1', value: 10, key: testKey } as TestItem,
         { name: 'item2', value: 20, key: testKey } as TestItem
      ];

      const finderFunction = vi.fn().mockResolvedValue(testResults);
      const emptyFinder = vi.fn().mockResolvedValue([]);

      const options: Options<TestItem, 'test'> = {
        finders: {
          getAll: finderFunction,
          findNone: emptyFinder,
          byString: vi.fn().mockResolvedValue([]),
          byNumber: vi.fn().mockResolvedValue([])
        }
      };

      const result = await options.finders?.getAll?.({});
      const emptyResult = await options.finders?.findNone?.({});

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(Array.isArray(emptyResult)).toBe(true);
      expect(emptyResult).toHaveLength(0);

      // Test multiple parameter types
      await options.finders?.byString?.({ text: 'hello' });
      await options.finders?.byNumber?.({ count: 42 });
    });
  });

  describe('Complete Options Configuration', () => {
    let testKey: PriKey<'test'>;

    beforeEach(() => {
      testKey = {
        kt: 'test',
        pk: 'test-key'
      } as PriKey<'test'>;
    });

    test('should allow full options configuration with all properties', () => {
      const fullOptions: Options<TestItem, 'test'> = {
        hooks: {
          preCreate: vi.fn().mockResolvedValue({} as TestProperties),
          postCreate: vi.fn().mockResolvedValue({ name: 'test', value: 1, key: testKey } as TestItem),
          preUpdate: vi.fn().mockResolvedValue({} as TestProperties),
          postUpdate: vi.fn().mockResolvedValue({ name: 'test', value: 1, key: testKey } as TestItem),
          preRemove: vi.fn().mockResolvedValue({} as TestProperties),
          postRemove: vi.fn().mockResolvedValue({ name: 'test', value: 1, key: testKey } as TestItem)
        },
        validators: {
          onCreate: vi.fn().mockResolvedValue(true),
          onUpdate: vi.fn().mockResolvedValue(true),
          onRemove: vi.fn().mockResolvedValue(true)
        },
        finders: {
          byName: vi.fn().mockResolvedValue([]),
          byValue: vi.fn().mockResolvedValue([]),
          search: vi.fn().mockResolvedValue([])
        }
      };

      expect(fullOptions.hooks).toBeDefined();
      expect(fullOptions.validators).toBeDefined();
      expect(fullOptions.finders).toBeDefined();
      expect(Object.keys(fullOptions.hooks || {})).toHaveLength(6);
      expect(Object.keys(fullOptions.validators || {})).toHaveLength(3);
      expect(Object.keys(fullOptions.finders || {})).toHaveLength(3);
    });

    test('should maintain type safety across all properties', async () => {
      const testItem: TestProperties = { name: 'test', value: 42 };
      const testKey: PriKey<'test'> = { kt: 'test', pk: 'key' } as PriKey<'test'>;
      const testResult: TestItem = { ...testItem, key: testKey } as TestItem;

      const options: Options<TestItem, 'test'> = {
        hooks: {
          preCreate: async (item, opts) => {
            expect(item.name).toBeDefined();
            expect(item.value).toBeDefined();
            if (opts?.key) {
              expect(opts.key.kt).toBe('test');
            }
            return item;
          },
          postCreate: async (item) => {
            expect(item.name).toBeDefined();
            expect(item.value).toBeDefined();
            return item;
          }
        },
        validators: {
          onCreate: async (item, opts) => {
            expect(item.name).toBeDefined();
            expect(item.value).toBeDefined();
            if (opts?.key) {
              expect(opts.key.kt).toBe('test');
            }
            return true;
          }
        },
        finders: {
          search: async (params) => {
            expect(params).toBeDefined();
            return [testResult];
          }
        }
      };

      // Test type safety by calling the functions
      await options.hooks?.preCreate?.(testItem, { key: testKey });
      await options.hooks?.postCreate?.(testResult);
      await options.validators?.onCreate?.(testItem, { key: testKey });
      const searchResults = await options.finders?.search?.({ name: 'test' });

      expect(searchResults).toEqual([testResult]);
    });
  });
});
