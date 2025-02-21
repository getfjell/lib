import { createDefaultOptions, createOptions } from '@/Options';
import { Item, PriKey } from '@fjell/core';

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

describe('Options', () => {
  describe('createDefaultOptions', () => {
    test('should create default options with hooks', () => {
      const options = createDefaultOptions<Item<'test'>, 'test'>();

      expect(options).toBeDefined();
      expect(options.hooks).toBeDefined();
      expect(options.hooks?.preCreate).toBeDefined();
      expect(options.hooks?.preUpdate).toBeDefined();
    });

    test('preCreate hook should clear aggregations', async () => {
      const options = createDefaultOptions<Item<'test'>, 'test'>();
      const item = {
        name: 'test',
        aggs: { count: 1 }
      };

      const result = await options.hooks?.preCreate?.(item);

      expect(result).toBeDefined();
      expect(result?.aggs).toBeUndefined();
      expect(result?.name).toBe('test');
    });

    test('preUpdate hook should clear aggregations', async () => {
      const options = createDefaultOptions<Item<'test'>, 'test'>();
      const key = { kt: 'test', pk: '1' } as PriKey<'test'>;
      const item = {
        name: 'test',
        aggs: { count: 1 }
      };

      const result = await options.hooks?.preUpdate?.(key, item);

      expect(result).toBeDefined();
      expect(result?.aggs).toBeUndefined();
      expect(result?.name).toBe('test');
    });
  });

  describe('createOptions', () => {
    test('should return default options when no options provided', () => {
      const options = createOptions<Item<'test'>, 'test'>();
      const defaultOptions = createDefaultOptions<Item<'test'>, 'test'>();

      expect(JSON.stringify(options.hooks?.preCreate)).toEqual(JSON.stringify(defaultOptions.hooks?.preCreate));
    });

    test('should merge custom options with default options', () => {
      const customOptions = {
        validators: {
          onCreate: async () => true
        }
      };

      const options = createOptions<Item<'test'>, 'test'>(customOptions);

      expect(options.hooks).toBeDefined();
      expect(options.validators).toBeDefined();
      expect(options.validators?.onCreate).toBeDefined();
      expect(options.hooks?.preCreate).toBeDefined();
    });

    test('should override default options with custom options', async () => {
      const customPreCreate = async (item: any) => ({ ...item, custom: true });
      const customOptions = {
        hooks: {
          preCreate: customPreCreate
        }
      };

      const options = createOptions<Item<'test'>, 'test'>(customOptions);
      const result = await options.hooks?.preCreate?.({ name: 'test' });

      expect(result).toEqual({ name: 'test', custom: true });
    });
  });
});
