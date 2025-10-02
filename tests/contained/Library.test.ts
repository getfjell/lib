import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Item } from "@fjell/core";
import { Registry } from "../../src/Registry";
import { Coordinate, createCoordinate } from '@fjell/registry';
import { Library as AbstractLibrary, createLibrary as createAbstractLibrary } from "../../src/Library";

import { createLibrary } from "../../src/contained/Library";
import { Operations } from "../../src/contained/Operations";
import { Options } from "../../src/contained/Options";

// Mock the abstract library
const mockCreateAbstractLibrary = vi.hoisted(() => vi.fn());
vi.mock("../../src/Library", () => ({
  createLibrary: mockCreateAbstractLibrary,
  Library: {}
}));

// Mock dependencies
vi.mock("../../src/Registry");

describe('contained/Library', () => {
  // Define test types
  type TestItem = Item<'test', 'loc1', 'loc2'>;
  type ParentItem = Item<'loc1', 'loc2'>;

  let mockRegistry: Registry;
  let mockCoordinate: Coordinate<'test'>;
  let mockOperations: Operations<TestItem, 'test', 'loc1', 'loc2'>;
  let mockOptions: Options<TestItem, 'test', 'loc1', 'loc2'>;
  let mockParentLibrary: AbstractLibrary<ParentItem, 'loc1', 'loc2'>;
  let mockAbstractLibrary: AbstractLibrary<TestItem, 'test', 'loc1', 'loc2'>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Registry
    mockRegistry = {
      register: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
      clear: vi.fn()
    } as any;

    // Mock Coordinate
    mockCoordinate = createCoordinate('test');

    // Mock Operations
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
      action: vi.fn(),
      facet: vi.fn(),
      allAction: vi.fn(),
      allFacet: vi.fn()
    } as any;

    // Mock Options
    mockOptions = {
      hooks: {},
      validators: {},
      finders: {},
      actions: {},
      facets: {}
    } as any;

    // Mock Parent Library
    mockParentLibrary = {
      coordinate: createCoordinate('loc1'),
      registry: mockRegistry,
      operations: {} as any,
      options: {} as any
    } as any;

    // Mock Abstract Library
    mockAbstractLibrary = {
      coordinate: mockCoordinate,
      registry: mockRegistry,
      operations: mockOperations,
      options: mockOptions
    } as any;

    // Mock the createAbstractLibrary function
    mockCreateAbstractLibrary.mockReturnValue(mockAbstractLibrary as any);
  });

  describe('createLibrary', () => {
    it('should create a contained library with parent reference', () => {
      const result = createLibrary(
        mockParentLibrary,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      expect(createAbstractLibrary).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      expect(result).toBeDefined();
      expect(result.parent).toBe(mockParentLibrary);
      expect(result.coordinate).toBe(mockCoordinate);
      expect(result.registry).toBe(mockRegistry);
      expect(result.operations).toBe(mockOperations);
      expect(result.options).toBe(mockOptions);
    });

    it('should preserve all properties from abstract library', () => {
      const result = createLibrary(
        mockParentLibrary,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      // Check that all abstract library properties are preserved
      expect(result.coordinate).toBe(mockAbstractLibrary.coordinate);
      expect(result.registry).toBe(mockAbstractLibrary.registry);
      expect(result.operations).toBe(mockAbstractLibrary.operations);
      expect(result.options).toBe(mockAbstractLibrary.options);
    });

    it('should handle different coordinates and operations', () => {
      const customCoordinate = createCoordinate('custom');
      const customOperations = { ...mockOperations } as any;
      const customOptions = { ...mockOptions } as any;
      const customParent = { ...mockParentLibrary } as any;

      const customAbstractLibrary = {
        coordinate: customCoordinate,
        registry: mockRegistry,
        operations: customOperations,
        options: customOptions
      } as any;

      vi.mocked(createAbstractLibrary).mockReturnValue(customAbstractLibrary as any);

      const result = createLibrary(
        customParent,
        mockRegistry,
        customCoordinate,
        customOperations,
        customOptions
      );

      expect(result.parent).toBe(customParent);
      expect(result.coordinate).toBe(customCoordinate);
      expect(result.operations).toBe(customOperations);
      expect(result.options).toBe(customOptions);
    });

    it('should create library with different coordinate values', () => {
      const simpleCoordinate = createCoordinate('simple');
      const simpleOperations = { ...mockOperations } as any;
      const simpleOptions = { ...mockOptions } as any;
      const simpleParent = { ...mockParentLibrary } as any;

      const simpleAbstractLibrary = {
        coordinate: simpleCoordinate,
        registry: mockRegistry,
        operations: simpleOperations,
        options: simpleOptions
      } as any;

      vi.mocked(createAbstractLibrary).mockReturnValue(simpleAbstractLibrary as any);

      const result = createLibrary(
        simpleParent,
        mockRegistry,
        simpleCoordinate,
        simpleOperations,
        simpleOptions
      );

      expect(result.parent).toBe(simpleParent);
      expect(result.coordinate).toBe(simpleCoordinate);
    });
  });

  describe('Library interface', () => {
    it('should extend AbstractLibrary interface correctly', () => {
      const library = createLibrary(
        mockParentLibrary,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      // Verify it has all AbstractLibrary properties
      expect(library.coordinate).toBeDefined();
      expect(library.registry).toBeDefined();
      expect(library.operations).toBeDefined();
      expect(library.options).toBeDefined();

      // Verify it has the additional parent property
      expect(library.parent).toBeDefined();
      expect(library.parent).toBe(mockParentLibrary);
    });

    it('should maintain type safety with parent hierarchy', () => {
      const library = createLibrary(
        mockParentLibrary,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      // Verify parent relationship maintains proper typing
      expect(library.parent).toBe(mockParentLibrary);
      expect(library.parent?.coordinate).toBeDefined();
      expect(library.parent?.registry).toBe(mockRegistry);
    });
  });

  describe('integration with dependencies', () => {
    it('should call createAbstractLibrary with correct parameters', () => {
      createLibrary(
        mockParentLibrary,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      expect(createAbstractLibrary).toHaveBeenCalledTimes(1);
      expect(createAbstractLibrary).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );
    });

    it('should handle when createAbstractLibrary returns different properties', () => {
      const differentAbstractLibrary = {
        coordinate: createCoordinate('different'),
        registry: {} as Registry,
        operations: {} as any,
        options: {} as any
      };

      vi.mocked(createAbstractLibrary).mockReturnValue(differentAbstractLibrary as any);

      const result = createLibrary(
        mockParentLibrary,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      expect(result.coordinate).toBe(differentAbstractLibrary.coordinate);
      expect(result.registry).toBe(differentAbstractLibrary.registry);
      expect(result.parent).toBe(mockParentLibrary);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle null parent gracefully', () => {
      const result = createLibrary(
        null as any,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      expect(result.parent).toBeNull();
      expect(result.coordinate).toBe(mockCoordinate);
    });

    it('should handle undefined parent gracefully', () => {
      const result = createLibrary(
         
        undefined as any,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );
       
      expect(result.parent).toBe(undefined);
      expect(result.coordinate).toBe(mockCoordinate);
    });

    it('should work when abstract library creation returns minimal object', () => {
      const minimalAbstractLibrary = {
        coordinate: mockCoordinate,
        registry: mockRegistry,
        operations: mockOperations,
        options: mockOptions
      };

      vi.mocked(createAbstractLibrary).mockReturnValue(minimalAbstractLibrary as any);

      const result = createLibrary(
        mockParentLibrary,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      expect(result).toEqual({
        ...minimalAbstractLibrary,
        parent: mockParentLibrary
      });
    });
  });

  describe('type checking and compatibility', () => {
    it('should be compatible with AbstractLibrary interface', () => {
      const containedLibrary = createLibrary(
        mockParentLibrary,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      // Verify it has all required AbstractLibrary properties
      expect(containedLibrary.coordinate).toBe(mockCoordinate);
      expect(containedLibrary.registry).toBe(mockRegistry);
      expect(containedLibrary.operations).toBe(mockOperations);
      expect(containedLibrary.options).toBe(mockOptions);
    });

    it('should maintain proper type relationships', () => {
      const library = createLibrary(
        mockParentLibrary,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      // Verify correct property assignments
      expect(library.operations).toBe(mockOperations);
      expect(library.parent).toBe(mockParentLibrary);
      expect(library.coordinate).toBe(mockCoordinate);
    });
  });
});
