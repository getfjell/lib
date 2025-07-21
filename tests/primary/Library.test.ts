import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createLibrary, Library } from '@/primary/Library';
import { Item } from '@fjell/core';
import { Coordinate, Registry } from '@fjell/registry';
import { Operations } from '@/primary/Operations';
import { Options } from '@/primary/Options';

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
vi.mock('@/logger', () => {
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
    default: logger,
  };
});

// Mock the abstract library module
vi.mock('@/Library', () => ({
  createLibrary: vi.fn()
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
    const { createLibrary: mockCreateAbstractLibrary } = await import('@/Library');
    vi.mocked(mockCreateAbstractLibrary).mockReturnValue(mockAbstractLibrary);
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
      const { createLibrary: mockCreateAbstractLibrary } = await import('@/Library');

      createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(mockCreateAbstractLibrary).toHaveBeenCalledTimes(1);
      expect(mockCreateAbstractLibrary).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );
    });

    test('should log debug information with correct parameters', async () => {
      const LoggerModule = await import('@/logger');
      const debugSpy = LoggerModule.default.debug;

      createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(debugSpy).toHaveBeenCalledTimes(1);
      expect(debugSpy).toHaveBeenCalledWith(
        'createLibrary',
        {
          coordinate: mockCoordinate,
          operations: mockOperations,
          registry: mockRegistry,
          options: mockOptions
        }
      );
    });

    test('should extend abstract library with operations property', () => {
      const result = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      // Should have all properties from abstract library
      expect(result.coordinate).toBe(mockAbstractLibrary.coordinate);
      expect(result.registry).toBe(mockAbstractLibrary.registry);

      // Should have added operations property
      expect(result.operations).toBe(mockOperations);
    });

    test('should handle null return from abstract createLibrary', async () => {
      const { createLibrary: mockCreateAbstractLibrary } = await import('@/Library');
      vi.mocked(mockCreateAbstractLibrary).mockReturnValue(null as any);

      const result = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(result).toBeNull();
      expect(mockCreateAbstractLibrary).toHaveBeenCalledTimes(1);
    });

    test('should handle undefined return from abstract createLibrary', async () => {
      const { createLibrary: mockCreateAbstractLibrary } = await import('@/Library');
      // eslint-disable-next-line no-undefined
      vi.mocked(mockCreateAbstractLibrary).mockReturnValue(undefined as any);

      const result = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(result).toBeUndefined();
      expect(mockCreateAbstractLibrary).toHaveBeenCalledTimes(1);
    });

    test('should work with minimal operations object', () => {
      const minimalOperations = {
        all: vi.fn(),
        create: vi.fn()
      } as any;

      const result = createLibrary(mockRegistry, mockCoordinate, minimalOperations, mockOptions);

      expect(result).toBeDefined();
      expect(result.operations).toBe(minimalOperations);
    });

    test('should preserve all abstract library properties', async () => {
      const extendedAbstractLibrary = {
        ...mockAbstractLibrary,
        customProperty: 'test-value',
        anotherMethod: vi.fn()
      };
      const { createLibrary: mockCreateAbstractLibrary } = await import('@/Library');
      vi.mocked(mockCreateAbstractLibrary).mockReturnValue(extendedAbstractLibrary);

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
      const emptyRegistry = {} as Registry;

      const result = createLibrary(emptyRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(result).toBeDefined();
      expect(result.operations).toBe(mockOperations);
    });

    test('should handle coordinate with empty arrays', () => {
      const emptyCoordinate = {
        kta: [],
        scopes: []
      } as any;

      const result = createLibrary(mockRegistry, emptyCoordinate, mockOperations, mockOptions);

      expect(result).toBeDefined();
      expect(result.operations).toBe(mockOperations);
    });

    test('should handle operations with additional custom methods', () => {
      const extendedOperations = {
        ...mockOperations,
        customMethod: vi.fn(),
        anotherCustom: vi.fn()
      };

      const result = createLibrary(mockRegistry, mockCoordinate, extendedOperations, mockOptions);

      expect(result.operations).toBe(extendedOperations);
      expect((result.operations as any).customMethod).toBeDefined();
    });

    test('should call abstract createLibrary even when it throws', async () => {
      const { createLibrary: mockCreateAbstractLibrary } = await import('@/Library');
      const error = new Error('Abstract library creation failed');
      vi.mocked(mockCreateAbstractLibrary).mockImplementation(() => {
        throw error;
      });

      expect(() => {
        createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);
      }).toThrow('Abstract library creation failed');

      expect(mockCreateAbstractLibrary).toHaveBeenCalledTimes(1);
    });
  });

  describe('parameter validation', () => {
    test('should work with all required parameters provided', () => {
      expect(() => {
        createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);
      }).not.toThrow();
    });

    test('should pass through all parameters to abstract createLibrary', async () => {
      const customRegistry = { custom: 'registry' } as any;
      const customCoordinate = { custom: 'coordinate' } as any;
      const customOperations = { custom: 'operations' } as any;
      const customOptions = { custom: 'options' } as any;

      const { createLibrary: mockCreateAbstractLibrary } = await import('@/Library');

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
      const originalOperations = { ...mockOperations };
      const originalOptions = { ...mockOptions };

      createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(mockOperations).toEqual(originalOperations);
      expect(mockOptions).toEqual(originalOptions);
    });

    test('should create new object instance each time', () => {
      const library1 = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);
      const library2 = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(library1).not.toBe(library2);
      expect(library1.operations).toBe(library2.operations); // Same reference to operations
    });

    test('should handle complex coordinate structures', async () => {
      const complexCoordinate = {
        kta: ['user', 'profile', 'nested'],
        scopes: ['tenant1', 'organization', 'department']
      } as any;

      const { createLibrary: mockCreateAbstractLibrary } = await import('@/Library');

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
