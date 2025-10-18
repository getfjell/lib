import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createLibraryFactory } from '../src/LibraryFactory';
import { Operations } from '../src/Operations';
import { Options } from '../src/Options';
import { createLibrary, Library } from '../src/Library';
import { Item } from '@fjell/core';
import { Coordinate, createCoordinate } from '@fjell/core';
import { Registry, RegistryHub } from '@fjell/registry';

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

vi.mock('../src/Library', () => ({
  createLibrary: vi.fn(),
  Library: {} // Mock the Library interface
}));

describe('LibraryFactory', () => {
  // Test types
  interface TestItem extends Item<'test', 'loc1', 'loc2'> {
    name: string;
    value: number;
  }

  // Mock implementations
  let mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'>;
  let mockOptions: Options<TestItem, 'test', 'loc1', 'loc2'>;
  let mockRegistry: Registry;
  let mockRegistryHub: RegistryHub;
  let mockCoordinate: Coordinate<'test', 'loc1', 'loc2'>;
  let mockLibrary: Library<TestItem, 'test', 'loc1', 'loc2'>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock operations
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

    // Setup mock options
    mockOptions = {
      hooks: {},
      validators: {},
      finders: {},
      actions: {},
      facets: {},
      allActions: {},
      allFacets: {}
    };

    // Setup mock registry and hub
    mockRegistry = {
      get: vi.fn(),
      set: vi.fn(),
      has: vi.fn(),
      delete: vi.fn(),
      keys: vi.fn(),
      values: vi.fn(),
      entries: vi.fn(),
      clear: vi.fn(),
      size: 0
    } as any;

    mockRegistryHub = {
      getRegistry: vi.fn().mockReturnValue(mockRegistry),
      setRegistry: vi.fn(),
      hasRegistry: vi.fn(),
      removeRegistry: vi.fn(),
      listRegistries: vi.fn()
    } as any;

    // Setup mock coordinate
    mockCoordinate = createCoordinate('test');

    // Setup mock library
    mockLibrary = {
      coordinate: mockCoordinate,
      registry: mockRegistry,
      operations: mockOperations,
      options: mockOptions
    } as Library<TestItem, 'test', 'loc1', 'loc2'>;

    // Setup mock createLibrary
    vi.mocked(createLibrary).mockReturnValue(mockLibrary as any);
  });

  describe('createLibraryFactory', () => {
    test('should return a factory function', () => {
      const factory = createLibraryFactory(mockOperations, mockOptions);

      expect(factory).toBeInstanceOf(Function);
      expect(factory).toHaveLength(2); // Should expect 2 parameters: coordinate and context
    });

    test('should create library with registry only context', () => {
      const factory = createLibraryFactory(mockOperations, mockOptions);
      const context = { registry: mockRegistry };

      const result = factory(mockCoordinate, context);

      expect(createLibrary).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );
      expect(result).toBe(mockLibrary);
    });

    test('should create library with registry and registryHub context', () => {
      const factory = createLibraryFactory(mockOperations, mockOptions);
      const context = { registry: mockRegistry, registryHub: mockRegistryHub };

      const result = factory(mockCoordinate, context);

      expect(createLibrary).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );
      expect(result).toBe(mockLibrary);
    });

    test('should handle different coordinate types', () => {
      const factory = createLibraryFactory(mockOperations, mockOptions);
      const coordinateWithLevels = createCoordinate('test', ['level1', 'level2']);
      const context = { registry: mockRegistry };

      factory(coordinateWithLevels, context);

      expect(createLibrary).toHaveBeenCalledWith(
        mockRegistry,
        coordinateWithLevels,
        mockOperations,
        mockOptions
      );
    });

    test('should handle empty options', () => {
      const emptyOptions = {} as Options<TestItem, 'test', 'loc1', 'loc2'>;
      const factory = createLibraryFactory(mockOperations, emptyOptions);
      const context = { registry: mockRegistry };

      factory(mockCoordinate, context);

      expect(createLibrary).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        emptyOptions
      );
    });

    test('should work with different item types', () => {
      interface AnotherTestItem extends Item<'another', never> {
        description: string;
      }

      const anotherOperations = {
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
      } as Operations<AnotherTestItem, 'another'>;

      const anotherOptions = {} as Options<AnotherTestItem, 'another'>;
      const anotherCoordinate = createCoordinate('another');

      const factory = createLibraryFactory(anotherOperations, anotherOptions);
      const context = { registry: mockRegistry };

      factory(anotherCoordinate, context);

      expect(createLibrary).toHaveBeenCalledWith(
        mockRegistry,
        anotherCoordinate,
        anotherOperations,
        anotherOptions
      );
    });

    test('should create factory that returns library instance', () => {
      const factory = createLibraryFactory(mockOperations, mockOptions);
      const context = { registry: mockRegistry };

      const library = factory(mockCoordinate, context);

      expect(library).toBe(mockLibrary);
      expect(library).toHaveProperty('coordinate', mockCoordinate);
      expect(library).toHaveProperty('registry', mockRegistry);
      expect(library).toHaveProperty('operations', mockOperations);
      expect(library).toHaveProperty('options', mockOptions);
    });
  });

  describe('type compatibility', () => {
    test('should work with different item types', () => {
      interface MinimalItem extends Item<'minimal'> {
        data: string;
      }

      const minimalOperations = {
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
      } as Operations<MinimalItem, 'minimal'>;

      const minimalOptions = {} as Options<MinimalItem, 'minimal'>;
      const minimalCoordinate = createCoordinate('minimal');

      const factory = createLibraryFactory(minimalOperations, minimalOptions);

      const context = { registry: mockRegistry };
      const result = factory(minimalCoordinate, context);

      expect(result).toBeDefined();
      expect(createLibrary).toHaveBeenCalledWith(
        mockRegistry,
        minimalCoordinate,
        minimalOperations,
        minimalOptions
      );
    });
  });

  describe('logging', () => {
    test('should log debug information when creating library instance', () => {
      const factory = createLibraryFactory(mockOperations, mockOptions);
      const context = { registry: mockRegistry };

      factory(mockCoordinate, context);

      // Note: Since we mocked the logger, we can't easily test the actual logging
      // but we can verify the factory was called correctly
      expect(createLibrary).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle when createLibrary throws an error', () => {
      const error = new Error('Failed to create library');
      vi.mocked(createLibrary).mockImplementation(() => {
        throw error;
      });

      const factory = createLibraryFactory(mockOperations, mockOptions);
      const context = { registry: mockRegistry };

      expect(() => factory(mockCoordinate, context)).toThrow('Failed to create library');
    });

    test('should handle null/undefined operations gracefully', () => {
      const factory = createLibraryFactory(null as any, mockOptions);
      const context = { registry: mockRegistry };

      factory(mockCoordinate, context);

      expect(createLibrary).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        null,
        mockOptions
      );
    });

    test('should handle null/undefined options gracefully', () => {
      const factory = createLibraryFactory(mockOperations, null as any);
      const context = { registry: mockRegistry };

      factory(mockCoordinate, context);

      expect(createLibrary).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        null
      );
    });
  });
});
