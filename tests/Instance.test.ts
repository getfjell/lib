/* eslint-disable no-undefined */
import { describe, expect, test, vi } from 'vitest';
import { createInstance, isInstance } from '@/Instance';
import { Operations } from '@/Operations';
import { Item } from '@fjell/core';
import { Registry } from '@/Registry';
import { createOptions } from '@/Options';
import { createCoordinate } from '@fjell/registry';

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

describe('Instance', () => {
  describe('createInstance', () => {
    test('should create instance with definition and operations', () => {
      const mockCoordinate = createCoordinate(['test'], ['scope1']);
      const mockOperations = {} as Operations<Item<'test'>, 'test'>;
      const mockRegistry = { type: 'lib' } as Registry;
      const mockOptions = createOptions<Item<'test'>, 'test'>();

      const instance = createInstance(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(instance).toBeDefined();
      expect(instance.coordinate).toBe(mockCoordinate);
      expect(instance.operations).toBe(mockOperations);
      expect(instance.registry).toBe(mockRegistry);
      expect(instance.options).toBe(mockOptions);
    });
  });

  describe('isInstance', () => {
    test('should return true for valid instance', () => {
      const mockInstance = {
        coordinate: {},
        operations: {},
        options: {},
        registry: {}
      };

      expect(isInstance(mockInstance)).toBe(true);
    });

    test('should return false for invalid instance', () => {
      const mockInvalidInstance = {
        definition: undefined,
        operations: {}
      };

      expect(isInstance(mockInvalidInstance)).toBe(false);
    });

    test('should return false for non-object', () => {
      expect(isInstance(null)).toBe(false);
      expect(isInstance(undefined)).toBe(false);
      expect(isInstance('not an instance')).toBe(false);
    });
  });
});
