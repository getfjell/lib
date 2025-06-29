import { describe, expect, test, vi } from 'vitest';
import { createDefaultOptions, createOptions } from '@/Options';
import { Item, PriKey } from '@fjell/core';

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
      const item: Partial<Item<'test'>> = {
        name: 'test',
        aggs: { count: 1 } as any
      };

      const result = await options.hooks?.preCreate?.(item);

      expect(result).toBeDefined();
      expect(result?.aggs).toBeUndefined();
      expect(result?.name).toBe('test');
    });

    test('preUpdate hook should clear aggregations', async () => {
      const options = createDefaultOptions<Item<'test'>, 'test'>();
      const key = { kt: 'test', pk: '1' } as PriKey<'test'>;
      const item: Partial<Item<'test'>> = {
        name: 'test',
        aggs: { count: 1 } as any
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
