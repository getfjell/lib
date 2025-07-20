
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createInstanceFactory } from '@/InstanceFactory';
import { Operations } from '@/Operations';
import { createOptions } from '@/Options';
import { Item } from '@fjell/core';
import { createCoordinate, Registry, RegistryHub } from '@fjell/registry';
import { createInstance } from '@/Instance';

// Mock the logger
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

// Mock the createInstance function
vi.mock('@/Instance', () => ({
  createInstance: vi.fn(),
}));

const mockedCreateInstance = vi.mocked(createInstance);

describe('InstanceFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createInstanceFactory', () => {
    test('should return a function that creates instances', () => {
      const mockOperations = {} as Operations<Item<'test'>, 'test'>;
      const mockOptions = createOptions<Item<'test'>, 'test'>();

      const factory = createInstanceFactory(mockOperations, mockOptions);

      expect(factory).toBeDefined();
      expect(typeof factory).toBe('function');
    });

    test('should create instance when factory function is called', () => {
      const mockOperations = {} as Operations<Item<'test'>, 'test'>;
      const mockOptions = createOptions<Item<'test'>, 'test'>();
      const mockCoordinate = createCoordinate(['test'], ['scope1']);
      const mockRegistry = { type: 'lib' } as Registry;
      const mockRegistryHub = {} as RegistryHub;
      const mockInstance = {
        coordinate: mockCoordinate,
        operations: mockOperations,
        registry: mockRegistry,
        options: mockOptions
      };

      mockedCreateInstance.mockReturnValue(mockInstance as any);

      const factory = createInstanceFactory(mockOperations, mockOptions);
      const context = { registry: mockRegistry, registryHub: mockRegistryHub };

      const result = factory(mockCoordinate, context);

      expect(mockedCreateInstance).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );
      expect(result).toBe(mockInstance);
    });

    test('should create instance without registryHub', () => {
      const mockOperations = {} as Operations<Item<'test'>, 'test'>;
      const mockOptions = createOptions<Item<'test'>, 'test'>();
      const mockCoordinate = createCoordinate(['test'], ['scope1']);
      const mockRegistry = { type: 'lib' } as Registry;
      const mockInstance = {
        coordinate: mockCoordinate,
        operations: mockOperations,
        registry: mockRegistry,
        options: mockOptions
      };

      mockedCreateInstance.mockReturnValue(mockInstance as any);

      const factory = createInstanceFactory(mockOperations, mockOptions);
      const context = { registry: mockRegistry };

      const result = factory(mockCoordinate, context);

      expect(mockedCreateInstance).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );
      expect(result).toBe(mockInstance);
    });

    test('should work with multi-level coordinates', () => {
      const mockOperations = {} as Operations<Item<'test', 'level1', 'level2'>, 'test', 'level1', 'level2'>;
      const mockOptions = createOptions<Item<'test', 'level1', 'level2'>, 'test', 'level1', 'level2'>();
      const mockCoordinate = createCoordinate(['test'], ['scope1']);
      const mockRegistry = { type: 'lib' } as Registry;
      const mockInstance = {
        coordinate: mockCoordinate,
        operations: mockOperations,
        registry: mockRegistry,
        options: mockOptions
      };

      mockedCreateInstance.mockReturnValue(mockInstance as any);

      const factory = createInstanceFactory(mockOperations, mockOptions);
      const context = { registry: mockRegistry };

      const result = factory(mockCoordinate, context);

      expect(mockedCreateInstance).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );
      expect(result).toBe(mockInstance);
    });

    test('should pass through complex operations and options', () => {
      const mockOperations = {
        get: vi.fn(),
        find: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn()
      } as any as Operations<Item<'test'>, 'test'>;

      const mockOptions = createOptions<Item<'test'>, 'test'>({
        hooks: {
          preCreate: vi.fn(),
          postCreate: vi.fn()
        },
        finders: {
          findByName: vi.fn()
        }
      });

      const mockCoordinate = createCoordinate(['test'], ['scope1']);
      const mockRegistry = { type: 'lib' } as Registry;
      const mockInstance = {
        coordinate: mockCoordinate,
        operations: mockOperations,
        registry: mockRegistry,
        options: mockOptions
      };

      mockedCreateInstance.mockReturnValue(mockInstance as any);

      const factory = createInstanceFactory(mockOperations, mockOptions);
      const context = { registry: mockRegistry };

      const result = factory(mockCoordinate, context);

      expect(mockedCreateInstance).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );
      expect(result).toBe(mockInstance);
    });

    test('should handle empty operations and default options', () => {
      const mockOperations = {} as Operations<Item<'test'>, 'test'>;
      const mockOptions = createOptions<Item<'test'>, 'test'>();
      const mockCoordinate = createCoordinate(['test'], ['scope1']);
      const mockRegistry = { type: 'lib' } as Registry;
      const mockInstance = {
        coordinate: mockCoordinate,
        operations: mockOperations,
        registry: mockRegistry,
        options: mockOptions
      };

      mockedCreateInstance.mockReturnValue(mockInstance as any);

      const factory = createInstanceFactory(mockOperations, mockOptions);
      const context = { registry: mockRegistry };

      const result = factory(mockCoordinate, context);

      expect(mockedCreateInstance).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );
      expect(result).toBe(mockInstance);
    });
  });
});
