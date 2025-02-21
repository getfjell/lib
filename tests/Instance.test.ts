/* eslint-disable no-undefined */
import { createInstance, isInstance } from '@/Instance';
import { Definition } from '@/Definition';
import { Operations } from '@/Operations';
import { Item } from '@fjell/core';

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

describe('Instance', () => {
  describe('createInstance', () => {
    test('should create instance with definition and operations', () => {
      const mockDefinition = {} as Definition<Item<'test'>, 'test'>;
      const mockOperations = {} as Operations<Item<'test'>, 'test'>;

      const instance = createInstance(mockDefinition, mockOperations);

      expect(instance).toBeDefined();
      expect(instance.definition).toBe(mockDefinition);
      expect(instance.operations).toBe(mockOperations);
    });
  });

  describe('isInstance', () => {
    test('should return true for valid instance', () => {
      const mockInstance = {
        definition: {},
        operations: {}
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
