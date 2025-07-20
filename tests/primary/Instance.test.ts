import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { MockedFunction } from 'vitest';
import { createInstance } from '@/primary/Instance';
import { createInstance as createAbstractInstance, Instance } from '@/Instance';

// Mock the abstract Instance module
vi.mock('@/Instance', () => ({
  createInstance: vi.fn(),
  Instance: {},
}));

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

describe('Primary Instance', () => {
  let mockRegistry: any;
  let mockCoordinate: any;
  let mockOperations: any;
  let mockOptions: any;
  let mockAbstractInstance: any;
  let mockCreateAbstractInstance: MockedFunction<typeof createAbstractInstance>;

  beforeEach(() => {
    // Create proper mock objects matching the expected interfaces
    mockRegistry = {
      register: vi.fn(),
      get: vi.fn(),
      libTree: {}
    };

    mockCoordinate = {
      keyTypes: ['test'],
      scopes: ['scope1']
    };

    mockOperations = {
      all: vi.fn(),
      one: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
      find: vi.fn()
    };

    mockOptions = {
      hooks: { preCreate: vi.fn(), preUpdate: vi.fn() }
    };

    mockAbstractInstance = {
      coordinate: mockCoordinate,
      operations: mockOperations,
      options: mockOptions,
      registry: mockRegistry
    };

    // Setup the mock for createAbstractInstance
    mockCreateAbstractInstance = vi.mocked(createAbstractInstance);
    mockCreateAbstractInstance.mockReturnValue(mockAbstractInstance);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createInstance', () => {
    test('should create instance with registry, coordinate, operations and options', () => {
      const instance = createInstance(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(instance).toBeDefined();
      expect(instance.coordinate).toBe(mockCoordinate);
      expect(instance.operations).toBe(mockOperations);
      expect(instance.options).toBe(mockOptions);
    });

    test('should call abstract createInstance with correct parameters', () => {
      createInstance(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(mockCreateAbstractInstance).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );
      expect(mockCreateAbstractInstance).toHaveBeenCalledTimes(1);
    });

    test('should return spread of abstract instance', () => {
      const instance = createInstance(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      // Should have all properties from the abstract instance
      expect(instance.coordinate).toBe(mockAbstractInstance.coordinate);
      expect(instance.operations).toBe(mockAbstractInstance.operations);
      expect(instance.options).toBe(mockAbstractInstance.options);
      // Registry should be included in the spread
      expect((instance as any).registry).toBe(mockAbstractInstance.registry);
    });

    test('should work with different mock objects', () => {
      const anotherCoordinate = {
        keyTypes: ['another'],
        kta: ['another'],
        scopes: ['scope1']
      } as any;
      const anotherOperations = { all: vi.fn(), create: vi.fn() } as any;
      const anotherOptions = { hooks: { preCreate: vi.fn() } } as any;

      const anotherAbstractInstance = {
        coordinate: anotherCoordinate,
        operations: anotherOperations,
        options: anotherOptions,
        registry: mockRegistry
      } as any;

      mockCreateAbstractInstance.mockReturnValueOnce(anotherAbstractInstance);

      const instance = createInstance(mockRegistry, anotherCoordinate, anotherOperations, anotherOptions);

      expect(instance).toBeDefined();
      expect(instance.coordinate).toBe(anotherCoordinate);
      expect(instance.operations).toBe(anotherOperations);
      expect(instance.options).toBe(anotherOptions);
    });

    test('should handle edge case with minimal mock objects', () => {
      const minimalCoordinate = {
        keyTypes: ['minimal'],
        kta: ['minimal'],
        scopes: ['scope1']
      } as any;
      const minimalOperations = {
        all: vi.fn(), one: vi.fn(), create: vi.fn(), update: vi.fn(),
        upsert: vi.fn(), get: vi.fn(), remove: vi.fn(), find: vi.fn()
      } as any;
      const minimalOptions = { hooks: {} } as any;
      const minimalRegistry = { register: vi.fn(), get: vi.fn(), libTree: {} } as any;

      const minimalAbstractInstance = {
        coordinate: minimalCoordinate,
        operations: minimalOperations,
        options: minimalOptions,
        registry: minimalRegistry
      } as any;

      mockCreateAbstractInstance.mockReturnValueOnce(minimalAbstractInstance);

      const instance = createInstance(minimalRegistry, minimalCoordinate, minimalOperations, minimalOptions);

      expect(instance).toBeDefined();
      expect(instance.coordinate).toBe(minimalCoordinate);
      expect(instance.operations).toBe(minimalOperations);
      expect(instance.options).toBe(minimalOptions);
    });

    test('should preserve all properties from abstract instance through spread operator', () => {
      // Add extra properties to the abstract instance to test spreading
      const extendedAbstractInstance = {
        coordinate: mockCoordinate,
        operations: mockOperations,
        options: mockOptions,
        registry: mockRegistry,
        extraProperty: 'test-value',
        anotherProperty: 42
      };

      mockCreateAbstractInstance.mockReturnValueOnce(extendedAbstractInstance);

      const instance = createInstance(mockRegistry, mockCoordinate, mockOperations, mockOptions) as any;

      expect(instance.coordinate).toBe(mockCoordinate);
      expect(instance.operations).toBe(mockOperations);
      expect(instance.options).toBe(mockOptions);
      expect(instance.registry).toBe(mockRegistry);
      expect(instance.extraProperty).toBe('test-value');
      expect(instance.anotherProperty).toBe(42);
    });

    test('should handle null/undefined returns from abstract createInstance', () => {
      mockCreateAbstractInstance.mockReturnValueOnce(null as any);

      const instance = createInstance(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      // If abstract createInstance returns null, we return null
      expect(instance).toBeNull();
    });
  });

  describe('Instance interface', () => {
    test('should have correct interface structure', () => {
      const instance = createInstance(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      // Check that the interface exposes coordinate, operations, and options
      expect(instance).toHaveProperty('coordinate');
      expect(instance).toHaveProperty('operations');
      expect(instance).toHaveProperty('options');

      // Registry should be present in the actual object (due to spread)
      expect((instance as any).registry).toBeDefined();
    });

    test('should satisfy Instance interface requirements', () => {
      const instance: Instance<any, any> = createInstance(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      // These should compile and be accessible
      expect(instance.coordinate).toBeDefined();
      expect(instance.operations).toBeDefined();
      expect(instance.options).toBeDefined();

      // TypeScript should enforce the interface
      expect(typeof instance.coordinate).toBe('object');
      expect(typeof instance.operations).toBe('object');
      expect(typeof instance.options).toBe('object');
    });
  });

  describe('error handling', () => {
    test('should propagate errors from abstract createInstance', () => {
      const errorMessage = 'Abstract instance creation failed';
      mockCreateAbstractInstance.mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      expect(() => {
        createInstance(mockRegistry, mockCoordinate, mockOperations, mockOptions);
      }).toThrow(errorMessage);
    });
  });

  describe('integration with abstract Instance', () => {
    test('should maintain compatibility with abstract Instance', () => {
      const instance = createInstance(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      // The returned instance should be compatible with the abstract instance
      expect(mockCreateAbstractInstance).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      // All properties from abstract instance should be preserved
      expect(instance.coordinate).toBe(mockAbstractInstance.coordinate);
      expect(instance.operations).toBe(mockAbstractInstance.operations);
      expect(instance.options).toBe(mockAbstractInstance.options);
    });

    test('should pass through abstract instance behavior', () => {
      // Test that the primary instance doesn't interfere with abstract instance behavior
      const customAbstractInstance = {
        coordinate: mockCoordinate,
        operations: mockOperations,
        options: mockOptions,
        registry: mockRegistry,
        customMethod: vi.fn(() => 'custom-result')
      };

      mockCreateAbstractInstance.mockReturnValueOnce(customAbstractInstance);

      const instance = createInstance(mockRegistry, mockCoordinate, mockOperations, mockOptions) as any;

      expect(instance.customMethod).toBeDefined();
      expect(instance.customMethod()).toBe('custom-result');
    });
  });
});
