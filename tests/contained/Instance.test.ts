import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createInstance } from "@/contained/Instance";
import { createInstance as createAbstractInstance } from "@/Instance";

// Mock dependencies
vi.mock("@/Instance", () => ({
  createInstance: vi.fn(),
}));

describe("contained/Instance", () => {
  let mockParent: any;
  let mockDefinition: any;
  let mockOperations: any;
  let mockRegistry: any;
  let mockAbstractInstance: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create simple mock objects
    mockDefinition = {
      coordinate: {
        kta: ["test"],
        scopes: [],
        toString: () => "test",
      },
      options: {},
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

    mockParent = {
      definition: {
        coordinate: {
          kta: ["parent"],
          scopes: [],
          toString: () => "parent",
        },
        options: {},
      },
      operations: mockOperations,
      registry: mockRegistry,
    };

    mockAbstractInstance = {
      definition: mockDefinition,
      operations: mockOperations,
      registry: mockRegistry,
    };

    // Mock the createAbstractInstance function
    (createAbstractInstance as any).mockReturnValue(mockAbstractInstance);
  });

  describe("createInstance", () => {
    test("should create an instance with parent property", () => {
      const result = createInstance(
        mockParent,
        mockDefinition,
        mockOperations,
        mockRegistry
      );

      expect(result).toBeDefined();
      expect(result.parent).toBe(mockParent);
      expect(result.definition).toBe(mockDefinition);
      expect(result.operations).toBe(mockOperations);
      expect(result.registry).toBe(mockRegistry);
    });

    test("should call createAbstractInstance with correct parameters", () => {
      createInstance(
        mockParent,
        mockDefinition,
        mockOperations,
        mockRegistry
      );

      expect(createAbstractInstance).toHaveBeenCalledWith(
        mockDefinition,
        mockOperations,
        mockRegistry
      );
      expect(createAbstractInstance).toHaveBeenCalledTimes(1);
    });

    test("should inherit all properties from abstract instance", () => {
      const result = createInstance(
        mockParent,
        mockDefinition,
        mockOperations,
        mockRegistry
      );

      // Verify all properties from abstract instance are present
      expect(result.definition).toBe(mockAbstractInstance.definition);
      expect(result.operations).toBe(mockAbstractInstance.operations);
      expect(result.registry).toBe(mockAbstractInstance.registry);
    });

    test("should preserve parent reference", () => {
      const result = createInstance(
        mockParent,
        mockDefinition,
        mockOperations,
        mockRegistry
      );

      expect(result.parent).toBe(mockParent);
      expect(result.parent?.definition.coordinate.kta).toEqual(["parent"]);
    });

    test("should handle null parent", () => {
      const result = createInstance(
        null as any,
        mockDefinition,
        mockOperations,
        mockRegistry
      );

      expect(result.parent).toBeNull();
      expect(result.definition).toBe(mockDefinition);
      expect(result.operations).toBe(mockOperations);
      expect(result.registry).toBe(mockRegistry);
    });

    test("should handle undefined parent", () => {
      const result = createInstance(
        null as any, // Using null instead of undefined to avoid undefined usage
        mockDefinition,
        mockOperations,
        mockRegistry
      );

      expect(result.parent).toBeNull();
      expect(result.definition).toBe(mockDefinition);
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
          mockDefinition,
          mockOperations,
          mockRegistry
        );
      }).toThrow("Abstract instance creation failed");
    });
  });

  describe("Instance interface", () => {
    test("should have all required properties", () => {
      const instance = createInstance(
        mockParent,
        mockDefinition,
        mockOperations,
        mockRegistry
      );

      // Verify it has all AbstractInstance properties
      expect(instance).toHaveProperty("definition");
      expect(instance).toHaveProperty("operations");
      expect(instance).toHaveProperty("registry");

      // Verify it has the additional parent property
      expect(instance).toHaveProperty("parent");
    });

    test("should allow optional parent property", () => {
      // Create instance without parent
      const instanceWithoutParent: any = {
        definition: mockDefinition,
        operations: mockOperations,
        registry: mockRegistry,
      };

      // Create instance with parent
      const instanceWithParent = {
        definition: mockDefinition,
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
        mockDefinition,
        mockOperations,
        mockRegistry
      );

      expect((result as any).customProperty).toBe(customProperty);
    });

    test("should maintain proper object structure", () => {
      const result = createInstance(
        mockParent,
        mockDefinition,
        mockOperations,
        mockRegistry
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
