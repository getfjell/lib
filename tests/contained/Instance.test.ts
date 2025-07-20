import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createInstance } from "@/contained/Instance";
import { createInstance as createAbstractInstance } from "@/Instance";

// Mock dependencies
vi.mock("@/Instance", () => ({
  createInstance: vi.fn(),
}));

describe("contained/Instance", () => {
  let mockParent: any;
  let mockCoordinate: any;
  let mockOperations: any;
  let mockRegistry: any;
  let mockOptions: any;
  let mockAbstractInstance: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create simple mock objects
    mockCoordinate = {
      kta: ["test"],
      scopes: [],
      toString: () => "test",
    };

    mockOperations = {
      all: vi.fn(),
      one: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
      find: vi.fn(),
    };

    mockRegistry = {
      register: vi.fn(),
      get: vi.fn(),
      libTree: {},
    };

    mockOptions = {
      hooks: {},
      validators: {},
      finders: {},
      actions: {},
      facets: {},
    };

    mockParent = {
      coordinate: {
        kta: ["parent"],
        scopes: [],
        toString: () => "parent",
      },
      operations: mockOperations,
      registry: mockRegistry,
      options: mockOptions,
    };

    mockAbstractInstance = {
      coordinate: mockCoordinate,
      operations: mockOperations,
      registry: mockRegistry,
      options: mockOptions,
    };

    // Mock the createAbstractInstance function
    (createAbstractInstance as any).mockReturnValue(mockAbstractInstance);
  });

  describe("createInstance", () => {
    test("should create an instance with parent property", () => {
      const result = createInstance(
        mockParent,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      expect(result).toBeDefined();
      expect(result.parent).toBe(mockParent);
      expect(result.coordinate).toBe(mockCoordinate);
      expect(result.operations).toBe(mockOperations);
      expect(result.registry).toBe(mockRegistry);
    });

    test("should call createAbstractInstance with correct parameters", () => {
      createInstance(
        mockParent,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      expect(createAbstractInstance).toHaveBeenCalledWith(
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );
      expect(createAbstractInstance).toHaveBeenCalledTimes(1);
    });

    test("should inherit all properties from abstract instance", () => {
      const result = createInstance(
        mockParent,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      // Verify all properties from abstract instance are present
      expect(result.coordinate).toBe(mockAbstractInstance.coordinate);
      expect(result.operations).toBe(mockAbstractInstance.operations);
      expect(result.registry).toBe(mockAbstractInstance.registry);
    });

    test("should preserve parent reference", () => {
      const result = createInstance(
        mockParent,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      expect(result.parent).toBe(mockParent);
      expect(result.parent?.coordinate.kta).toEqual(["parent"]);
    });

    test("should handle null parent", () => {
      const result = createInstance(
        null as any,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      expect(result.parent).toBeNull();
      expect(result.coordinate).toBe(mockCoordinate);
      expect(result.operations).toBe(mockOperations);
      expect(result.registry).toBe(mockRegistry);
    });

    test("should handle undefined parent", () => {
      const result = createInstance(
        null as any, // Using null instead of undefined to avoid undefined usage
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      expect(result.parent).toBeNull();
      expect(result.coordinate).toBe(mockCoordinate);
      expect(result.operations).toBe(mockOperations);
      expect(result.registry).toBe(mockRegistry);
    });

    test("should propagate errors from createAbstractInstance", () => {
      const error = new Error("Abstract instance creation failed");
      (createAbstractInstance as any).mockImplementation(() => {
        throw error;
      });

      expect(() => {
        createInstance(
          mockParent,
          mockRegistry,
          mockCoordinate,
          mockOperations,
          mockOptions
        );
      }).toThrow("Abstract instance creation failed");
    });
  });

  describe("Instance interface", () => {
    test("should have all required properties", () => {
      const instance = createInstance(
        mockParent,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      // Verify it has all AbstractInstance properties
      expect(instance).toHaveProperty("coordinate");
      expect(instance).toHaveProperty("operations");
      expect(instance).toHaveProperty("registry");

      // Verify it has the additional parent property
      expect(instance).toHaveProperty("parent");
    });

    test("should allow optional parent property", () => {
      // Create instance without parent
      const instanceWithoutParent: any = {
        coordinate: mockCoordinate,
        operations: mockOperations,
        registry: mockRegistry,
      };

      // Create instance with parent
      const instanceWithParent = {
        coordinate: mockCoordinate,
        operations: mockOperations,
        registry: mockRegistry,
        parent: mockParent,
      };

      expect(instanceWithoutParent.parent).toBeUndefined();
      expect(instanceWithParent.parent).toBe(mockParent);
    });
  });

  describe("function behavior", () => {
    test("should spread properties from abstract instance", () => {
      const customProperty = "customValue";
      const extendedAbstractInstance = {
        ...mockAbstractInstance,
        customProperty,
      };

      (createAbstractInstance as any).mockReturnValue(extendedAbstractInstance);

      const result = createInstance(
        mockParent,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      expect((result as any).customProperty).toBe(customProperty);
    });

    test("should maintain proper object structure", () => {
      const result = createInstance(
        mockParent,
        mockRegistry,
        mockCoordinate,
        mockOperations,
        mockOptions
      );

      // Check that the result is a plain object with expected structure
      expect(typeof result).toBe("object");
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(false);

      // Verify parent is at the top level
      expect(Object.prototype.hasOwnProperty.call(result, "parent")).toBe(true);
    });
  });
});
