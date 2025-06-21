import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { MockedFunction } from 'vitest';
import { createInstance, Instance } from '@/primary/Instance';
import { createInstance as createAbstractInstance } from '@/Instance';

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
  let mockDefinition: any;
  let mockOperations: any;
  let mockRegistry: any;
  let mockAbstractInstance: any;
  let mockCreateAbstractInstance: MockedFunction<typeof createAbstractInstance>;

  beforeEach(() => {
    // Create simple mock objects
    mockDefinition = {
      coordinate: { keyTypes: ['test'], scopes: ['scope1'] },
      options: { hooks: { preCreate: vi.fn(), preUpdate: vi.fn() } }
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

    mockRegistry = {
      register: vi.fn(),
      get: vi.fn(),
      libTree: {}
    };

    mockAbstractInstance = {
      definition: mockDefinition,
      operations: mockOperations,
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
    test('should create instance with definition and operations', () => {
      const instance = createInstance(mockDefinition, mockOperations, mockRegistry);

      expect(instance).toBeDefined();
      expect(instance.definition).toBe(mockDefinition);
      expect(instance.operations).toBe(mockOperations);
    });

    test('should call abstract createInstance with correct parameters', () => {
      createInstance(mockDefinition, mockOperations, mockRegistry);

      expect(mockCreateAbstractInstance).toHaveBeenCalledWith(
        mockDefinition,
        mockOperations,
        mockRegistry
      );
      expect(mockCreateAbstractInstance).toHaveBeenCalledTimes(1);
    });

    test('should return spread of abstract instance', () => {
      const instance = createInstance(mockDefinition, mockOperations, mockRegistry);

      // Should have all properties from the abstract instance
      expect(instance.definition).toBe(mockAbstractInstance.definition);
      expect(instance.operations).toBe(mockAbstractInstance.operations);
      // Registry should be included in the spread but not in the interface
      expect((instance as any).registry).toBe(mockAbstractInstance.registry);
    });

    test('should work with different mock objects', () => {
      const anotherDefinition = {
        coordinate: { keyTypes: ['another'], kta: ['another'], scopes: ['scope1'] },
        options: { hooks: { preCreate: vi.fn(), preUpdate: vi.fn() } }
      } as any;
      const anotherOperations = { all: vi.fn(), create: vi.fn() } as any;

      const anotherAbstractInstance = {
        definition: anotherDefinition,
        operations: anotherOperations,
        registry: mockRegistry
      } as any;

      mockCreateAbstractInstance.mockReturnValueOnce(anotherAbstractInstance);

      const instance = createInstance(anotherDefinition, anotherOperations, mockRegistry);

      expect(instance).toBeDefined();
      expect(instance.definition).toBe(anotherDefinition);
      expect(instance.operations).toBe(anotherOperations);
    });

    test('should handle edge case with minimal mock objects', () => {
      const minimalDefinition = {
        coordinate: { keyTypes: ['minimal'], kta: ['minimal'], scopes: ['scope1'] },
        options: { hooks: {} }
      } as any;
      const minimalOperations = {
        all: vi.fn(), one: vi.fn(), create: vi.fn(), update: vi.fn(),
        upsert: vi.fn(), get: vi.fn(), remove: vi.fn(), find: vi.fn()
      } as any;
      const minimalRegistry = { register: vi.fn(), get: vi.fn(), libTree: {} } as any;

      const minimalAbstractInstance = {
        definition: minimalDefinition,
        operations: minimalOperations,
        registry: minimalRegistry
      } as any;

      mockCreateAbstractInstance.mockReturnValueOnce(minimalAbstractInstance);

      const instance = createInstance(minimalDefinition, minimalOperations, minimalRegistry);

      expect(instance).toBeDefined();
      expect(instance.definition).toBe(minimalDefinition);
      expect(instance.operations).toBe(minimalOperations);
    });

    test('should preserve all properties from abstract instance through spread operator', () => {
      // Add extra properties to the abstract instance to test spreading
      const extendedAbstractInstance = {
        definition: mockDefinition,
        operations: mockOperations,
        registry: mockRegistry,
        extraProperty: 'test-value',
        anotherProperty: 42
      };

      mockCreateAbstractInstance.mockReturnValueOnce(extendedAbstractInstance);

      const instance = createInstance(mockDefinition, mockOperations, mockRegistry) as any;

      expect(instance.definition).toBe(mockDefinition);
      expect(instance.operations).toBe(mockOperations);
      expect(instance.registry).toBe(mockRegistry);
      expect(instance.extraProperty).toBe('test-value');
      expect(instance.anotherProperty).toBe(42);
    });

    test('should handle null/undefined returns from abstract createInstance', () => {
      mockCreateAbstractInstance.mockReturnValueOnce(null as any);

      const instance = createInstance(mockDefinition, mockOperations, mockRegistry);

      // When spreading null, we get an empty object
      expect(instance).toEqual({});
    });
  });

  describe('Instance interface', () => {
    test('should have correct interface structure', () => {
      const instance = createInstance(mockDefinition, mockOperations, mockRegistry);

      // Check that the interface only exposes definition and operations
      expect(instance).toHaveProperty('definition');
      expect(instance).toHaveProperty('operations');

      // Registry should be present in the actual object (due to spread) but not in the interface
      expect((instance as any).registry).toBeDefined();
    });

    test('should satisfy Instance interface requirements', () => {
      const instance: Instance<any, any> = createInstance(
        mockDefinition,
        mockOperations,
        mockRegistry
      );

      // These should compile and be accessible
      expect(instance.definition).toBeDefined();
      expect(instance.operations).toBeDefined();

      // TypeScript should enforce the interface
      expect(typeof instance.definition).toBe('object');
      expect(typeof instance.operations).toBe('object');
    });
  });

  describe('error handling', () => {
    test('should propagate errors from abstract createInstance', () => {
      const errorMessage = 'Abstract instance creation failed';
      mockCreateAbstractInstance.mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      expect(() => {
        createInstance(mockDefinition, mockOperations, mockRegistry);
      }).toThrow(errorMessage);
    });
  });

  describe('integration with abstract Instance', () => {
    test('should maintain compatibility with abstract Instance', () => {
      const instance = createInstance(mockDefinition, mockOperations, mockRegistry);

      // The returned instance should be compatible with the abstract instance
      expect(mockCreateAbstractInstance).toHaveBeenCalledWith(
        mockDefinition,
        mockOperations,
        mockRegistry
      );

      // All properties from abstract instance should be preserved
      expect(instance.definition).toBe(mockAbstractInstance.definition);
      expect(instance.operations).toBe(mockAbstractInstance.operations);
    });

    test('should pass through abstract instance behavior', () => {
      // Test that the primary instance doesn't interfere with abstract instance behavior
      const customAbstractInstance = {
        definition: mockDefinition,
        operations: mockOperations,
        registry: mockRegistry,
        customMethod: vi.fn(() => 'custom-result')
      };

      mockCreateAbstractInstance.mockReturnValueOnce(customAbstractInstance);

      const instance = createInstance(mockDefinition, mockOperations, mockRegistry) as any;

      expect(instance.customMethod).toBeDefined();
      expect(instance.customMethod()).toBe('custom-result');
    });
  });
});
