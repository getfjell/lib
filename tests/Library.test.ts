import { describe, expect, test, vi } from 'vitest';
import { createLibrary, isLibrary, Library } from '../src/Library';
import { Operations } from '../src/Operations';
import { Options } from '../src/Options';
import { Coordinate, Item } from '@fjell/core';
import { Registry } from '@fjell/registry';

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

// Mock the registry module
vi.mock('@fjell/registry', () => ({
  createInstance: vi.fn().mockReturnValue({
    coordinate: { keyType: 'test' },
    registry: { type: 'lib' }
  })
}));

describe('Library', () => {
  // Test types
  interface TestItem extends Item<'test', 'loc1', 'loc2'> {
    name: string;
    value: number;
  }

  let mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'>;
  let mockOptions: Options<TestItem, 'test', 'loc1', 'loc2'>;
  let mockRegistry: Registry;
  let mockCoordinate: Coordinate<'test', 'loc1', 'loc2'>;

  beforeEach(() => {
    mockOperations = {
      all: vi.fn(),
      one: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      finders: {},
      action: vi.fn(),
      actions: {},
      facet: vi.fn(),
      facets: {},
      allAction: vi.fn(),
      allActions: {},
      allFacet: vi.fn(),
      allFacets: {}
    };

    mockOptions = {
      hooks: {
        preCreate: vi.fn(),
        postCreate: vi.fn(),
        preUpdate: vi.fn(),
        postUpdate: vi.fn(),
        preRemove: vi.fn(),
        postRemove: vi.fn()
      },
      validators: {
        onCreate: vi.fn(),
        onUpdate: vi.fn(),
        onRemove: vi.fn()
      },
      finders: {
        byName: vi.fn()
      },
      actions: {
        upgrade: vi.fn()
      },
      allActions: {
        bulkUpdate: vi.fn()
      },
      facets: {
        analytics: vi.fn()
      },
      allFacets: {
        summary: vi.fn()
      }
    };

    mockRegistry = {
      type: 'lib',
      register: vi.fn(),
      get: vi.fn()
    };

    mockCoordinate = {
      keyType: 'test',
      loc1: 'loc1',
      loc2: 'loc2'
    };
  });

  describe('createLibrary', () => {
    test('should create a library with all required properties', () => {
      const library = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(library).toBeDefined();
      expect(library.coordinate).toBeDefined();
      expect(library.registry).toBeDefined();
      expect(library.operations).toBe(mockOperations);
      expect(library.options).toBe(mockOptions);
    });

    test('should create a library with default empty options when options not provided', () => {
      const library = createLibrary(mockRegistry, mockCoordinate, mockOperations);

      expect(library).toBeDefined();
      expect(library.options).toEqual({});
    });

    test('should preserve registry and coordinate from base instance', () => {
      const library = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(library.registry).toBeDefined();
      expect(library.coordinate).toBeDefined();
      expect(library.operations).toBe(mockOperations);
      expect(library.options).toBe(mockOptions);
    });
  });

  describe('isLibrary', () => {
    test('should return true for valid library object', () => {
      const validLibrary: Library<TestItem, 'test', 'loc1', 'loc2'> = {
        coordinate: mockCoordinate,
        registry: mockRegistry,
        operations: mockOperations,
        options: mockOptions
      };

      expect(isLibrary(validLibrary)).toBe(true);
    });

    test('should return false for null', () => {
      expect(isLibrary(null)).toBe(false);
    });

    test('should return false for undefined', () => {
      expect(isLibrary(undefined)).toBe(false);
    });

    test('should return false for object without coordinate', () => {
      const invalidLibrary = {
        registry: mockRegistry,
        operations: mockOperations,
        options: mockOptions
      };

      expect(isLibrary(invalidLibrary)).toBe(false);
    });

    test('should return false for object without registry', () => {
      const invalidLibrary = {
        coordinate: mockCoordinate,
        operations: mockOperations,
        options: mockOptions
      };

      expect(isLibrary(invalidLibrary)).toBe(false);
    });

    test('should return false for object without operations', () => {
      const invalidLibrary = {
        coordinate: mockCoordinate,
        registry: mockRegistry,
        options: mockOptions
      };

      expect(isLibrary(invalidLibrary)).toBe(false);
    });

    test('should return false for object without options', () => {
      const invalidLibrary = {
        coordinate: mockCoordinate,
        registry: mockRegistry,
        operations: mockOperations
      };

      expect(isLibrary(invalidLibrary)).toBe(false);
    });

    test('should return false for primitive values', () => {
      expect(isLibrary('string')).toBe(false);
      expect(isLibrary(123)).toBe(false);
      expect(isLibrary(true)).toBe(false);
      expect(isLibrary([])).toBe(false);
    });

    test('should return false for empty object', () => {
      expect(isLibrary({})).toBe(false);
    });

    test('should return false for object with some but not all required properties', () => {
      const partialLibrary = {
        coordinate: mockCoordinate,
        registry: mockRegistry
        // Missing operations and options
      };

      expect(isLibrary(partialLibrary)).toBe(false);
    });

    test('should return true for library with undefined coordinate but defined other properties', () => {
      const libraryWithUndefinedCoordinate = {
        coordinate: undefined,
        registry: mockRegistry,
        operations: mockOperations,
        options: mockOptions
      };

      expect(isLibrary(libraryWithUndefinedCoordinate)).toBe(false);
    });

    test('should handle edge cases with falsy values', () => {
      expect(isLibrary(0)).toBe(false);
      expect(isLibrary('')).toBe(false);
      expect(isLibrary(false)).toBe(false);
    });
  });
});
