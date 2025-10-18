import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createLibrary, Library } from '../../src/primary/Library';
import { Coordinate, Item } from '@fjell/core';
import { Registry } from '@fjell/registry';
import { Operations } from '../../src/primary/Operations';
import { Options } from '../../src/primary/Options';

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

// Mock the logger module
const mockLoggerGet = vi.hoisted(() => vi.fn());
const mockLoggerDebug = vi.hoisted(() => vi.fn());

vi.mock('../../src/logger', () => {
  return {
    default: {
      get: mockLoggerGet.mockReturnValue({
        debug: mockLoggerDebug,
      }),
    },
  };
});

// Mock the abstract library module
const mockCreateAbstractLibrary = vi.hoisted(() => vi.fn());
vi.mock('../../src/Library', () => ({
  createLibrary: mockCreateAbstractLibrary
}));

// Test data interfaces
interface TestUser extends Item<'user'> {
  id: string;
  name: string;
  email: string;
}

describe('Primary Library', () => {
  let mockRegistry: Registry;
  let mockCoordinate: Coordinate<'user'>;
  let mockOperations: Operations<TestUser, 'user'>;
  let mockOptions: Options<TestUser, 'user'>;
  let mockAbstractLibrary: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup mock registry
    mockRegistry = {
      register: vi.fn(),
      get: vi.fn(),
      libTree: {}
    } as any;

    // Setup mock coordinate
    mockCoordinate = {
      kta: ['user'],
      scopes: ['test']
    } as any;

    // Setup mock operations
    mockOperations = {
      all: vi.fn(),
      one: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
      find: vi.fn()
    } as any;

    // Setup mock options
    mockOptions = {
      hooks: {},
      validators: {},
      finders: {},
      actions: {},
      facets: {}
    } as any;

    // Setup mock abstract library
    mockAbstractLibrary = {
      coordinate: mockCoordinate,
      registry: mockRegistry,
      options: mockOptions
    };

    // Setup mock return value for abstract createLibrary
    mockCreateAbstractLibrary.mockReturnValue(mockAbstractLibrary);
  });

  describe('createLibrary function', () => {
    test('should create library successfully with all parameters', () => {
      const result = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(result).toBeDefined();
      expect(result.coordinate).toBe(mockCoordinate);
      expect(result.registry).toBe(mockRegistry);
      expect(result.operations).toBe(mockOperations);
      expect(result.options).toBe(mockOptions);
    });

    test('should call abstract createLibrary with correct parameters', async () => {
      createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(mockCreateAbstractLibrary).toHaveBeenCalledTimes(1);
      expect(mockCreateAbstractLibrary).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );
    });

    test('should log debug information with correct parameters', () => {
      // Mock the debug spy
      const debugSpy = mockLoggerDebug;

      createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(debugSpy).toHaveBeenCalledTimes(1);
      expect(debugSpy).toHaveBeenCalledWith(
        'createLibrary',
        {
          coordinate: mockCoordinate,
          operations: mockOperations,
          options: mockOptions,
          registry: mockRegistry
        }
      );
    });

    test('should extend abstract library with operations property', () => {
      mockCreateAbstractLibrary.mockReturnValue(mockAbstractLibrary);

      const result = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(result.operations).toBe(mockOperations);
    });

    test('should handle null return from abstract createLibrary', () => {
      mockCreateAbstractLibrary.mockReturnValue(null);

      const result = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(result).toBeNull();
      expect(mockCreateAbstractLibrary).toHaveBeenCalledTimes(1);
    });

    test('should handle undefined return from abstract createLibrary', () => {
      mockCreateAbstractLibrary.mockReturnValue(null);

      const result = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(result).toBeNull();
      expect(mockCreateAbstractLibrary).toHaveBeenCalledTimes(1);
    });

    test('should work with minimal operations object', () => {
      mockCreateAbstractLibrary.mockReturnValue(mockAbstractLibrary);

      const minimalOperations = {
        all: vi.fn(),
        one: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        upsert: vi.fn(),
        get: vi.fn(),
        remove: vi.fn(),
        find: vi.fn()
      } as any;

      const result = createLibrary(mockRegistry, mockCoordinate, minimalOperations, mockOptions);

      expect(result).toBeDefined();
      expect(result.operations).toBe(minimalOperations);
    });

    test('should preserve all abstract library properties', () => {
      const extendedAbstractLibrary = {
        ...mockAbstractLibrary,
        customProperty: 'test-value',
        anotherMethod: vi.fn()
      };

      mockCreateAbstractLibrary.mockReturnValue(extendedAbstractLibrary);

      const result = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions) as any;

      expect(result.customProperty).toBe('test-value');
      expect(result.anotherMethod).toBe(extendedAbstractLibrary.anotherMethod);
      expect(result.operations).toBe(mockOperations);
    });
  });

  describe('Library interface', () => {
    test('should conform to Library interface structure', () => {
      const library = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      // Type assertion to test interface compliance
      const typedLibrary: Library<TestUser, 'user'> = library as Library<TestUser, 'user'>;

      expect(typedLibrary.operations).toBeDefined();
      expect(typedLibrary.coordinate).toBeDefined();
      expect(typedLibrary.registry).toBeDefined();
    });

    test('should extend AbstractLibrary interface', () => {
      const library = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      // Should have properties from AbstractLibrary
      expect(library.coordinate).toBeDefined();
      expect(library.registry).toBeDefined();

      // Should have additional operations property
      expect(library.operations).toBeDefined();
    });

    test('should maintain operations type consistency', () => {
      const library = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(library.operations).toBe(mockOperations);
      expect(typeof library.operations.all).toBe('function');
      expect(typeof library.operations.create).toBe('function');
    });
  });

  describe('edge cases and error scenarios', () => {
    test('should handle empty registry object', () => {
      mockCreateAbstractLibrary.mockReturnValue(mockAbstractLibrary);

      const emptyRegistry = { register: vi.fn(), get: vi.fn(), libTree: {} } as any;
      const result = createLibrary(emptyRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(result).toBeDefined();
    });

    test('should handle coordinate with empty arrays', () => {
      mockCreateAbstractLibrary.mockReturnValue(mockAbstractLibrary);

      const emptyCoordinate = { kta: [], scopes: [] } as any;
      const result = createLibrary(mockRegistry, emptyCoordinate, mockOperations, mockOptions);

      expect(result).toBeDefined();
    });

    test('should handle operations with additional custom methods', () => {
      mockCreateAbstractLibrary.mockReturnValue(mockAbstractLibrary);

      const extendedOperations = {
        ...mockOperations,
        customMethod: vi.fn(),
        anotherCustomMethod: vi.fn()
      } as any;

      const result = createLibrary(mockRegistry, mockCoordinate, extendedOperations, mockOptions);

      expect(result).toBeDefined();
      expect(result.operations).toBe(extendedOperations);
    });

    test('should call abstract createLibrary even when it throws', () => {
      mockCreateAbstractLibrary.mockImplementation(() => {
        throw new Error('Abstract library creation failed');
      });

      expect(() => {
        createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);
      }).toThrow('Abstract library creation failed');

      expect(mockCreateAbstractLibrary).toHaveBeenCalledTimes(1);
    });
  });

  describe('parameter validation', () => {
    test('should work with all required parameters provided', () => {
      mockCreateAbstractLibrary.mockReturnValue(mockAbstractLibrary);

      const result = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(result).toBeDefined();
      expect(result.coordinate).toBe(mockCoordinate);
      expect(result.registry).toBe(mockRegistry);
      expect(result.operations).toBe(mockOperations);
      expect(result.options).toBe(mockOptions);
    });

    test('should pass through all parameters to abstract createLibrary', () => {
      const customRegistry = { custom: 'registry' } as any;
      const customCoordinate = { custom: 'coordinate' } as any;
      const customOperations = { custom: 'operations' } as any;
      const customOptions = { custom: 'options' } as any;

      createLibrary(customRegistry, customCoordinate, customOperations, customOptions);

      expect(mockCreateAbstractLibrary).toHaveBeenCalledWith(
        customRegistry,
        customCoordinate,
        customOperations,
        customOptions
      );
    });
  });

  describe('integration behavior', () => {
    test('should maintain immutability of input parameters', () => {
      mockCreateAbstractLibrary.mockReturnValue(mockAbstractLibrary);

      const originalRegistry = { ...mockRegistry };
      const originalCoordinate = { ...mockCoordinate };
      const originalOperations = { ...mockOperations };
      const originalOptions = { ...mockOptions };

      createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(mockRegistry).toEqual(originalRegistry);
      expect(mockCoordinate).toEqual(originalCoordinate);
      expect(mockOperations).toEqual(originalOperations);
      expect(mockOptions).toEqual(originalOptions);
    });

    test('should create new object instance each time', () => {
      mockCreateAbstractLibrary.mockReturnValue(mockAbstractLibrary);

      const result1 = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);
      const result2 = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(result1).not.toBe(result2);
    });

    test('should handle complex coordinate structures', () => {
      const complexCoordinate = {
        kta: ['user', 'profile', 'settings'],
        scopes: ['read', 'write', 'admin']
      } as any;

      const result = createLibrary(mockRegistry, complexCoordinate, mockOperations, mockOptions);

      expect(result).toBeDefined();
      expect(mockCreateAbstractLibrary).toHaveBeenCalledWith(
        mockRegistry,
        complexCoordinate,
        mockOperations,
        mockOptions
      );
    });
  });
});
