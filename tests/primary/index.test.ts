import { describe, expect, test, vi } from 'vitest';

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

// Mock abstract operations
vi.mock('@/Operations', () => ({
  wrapOperations: vi.fn().mockImplementation((toWrap) => toWrap)
}));

// Mock abstract instance
vi.mock('@/Instance', () => ({
  createInstance: vi.fn().mockImplementation(() => ({
    definition: {},
    operations: {},
    registry: {}
  }))
}));

describe('Primary Index', () => {
  describe('exports from Instance', () => {
    test('should export createInstance function', async () => {
      const { createInstance } = await import('@/primary/index');

      expect(createInstance).toBeDefined();
      expect(typeof createInstance).toBe('function');
    });

    test('should createInstance function work correctly', async () => {
      const { createInstance } = await import('@/primary/index');

      const mockDefinition = {
        coordinate: { kta: ['test'], scopes: ['scope1'] },
        options: {}
      } as any;
      const mockOperations = {
        all: vi.fn(),
        one: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        upsert: vi.fn(),
        get: vi.fn(),
        remove: vi.fn(),
        find: vi.fn()
      } as any;
      const mockRegistry = {
        register: vi.fn(),
        get: vi.fn(),
        libTree: {}
      } as any;

      const instance = createInstance(mockDefinition, mockOperations, mockRegistry);

      expect(instance).toBeDefined();
      expect(instance.definition).toBeDefined();
      expect(instance.operations).toBeDefined();
    });
  });

  describe('exports from Operations', () => {
    test('should export wrapOperations function', async () => {
      const { wrapOperations } = await import('@/primary/index');

      expect(wrapOperations).toBeDefined();
      expect(typeof wrapOperations).toBe('function');
    });

    test('should wrapOperations function work correctly', async () => {
      const { wrapOperations } = await import('@/primary/index');

      const mockOperations = {
        all: vi.fn(),
        one: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        upsert: vi.fn(),
        get: vi.fn(),
        remove: vi.fn(),
        find: vi.fn()
      } as any;
      const mockDefinition = {
        coordinate: { kta: ['test'], scopes: [] },
        options: {}
      } as any;
      const mockRegistry = {
        register: vi.fn(),
        get: vi.fn(),
        libTree: {}
      } as any;

      const wrapped = wrapOperations(mockOperations, mockDefinition, mockRegistry);

      expect(wrapped).toBeDefined();
      expect(wrapped).toStrictEqual(mockOperations); // Our mock just returns the input
    });
  });

  describe('complete export verification', () => {
    test('should have all expected exports', async () => {
      const primaryIndex = await import('@/primary/index');

      // Get all export names (functions will be defined, interfaces will be undefined)
      const exportNames = Object.keys(primaryIndex);

      // Should have exports for all the modules
      expect(exportNames).toContain('createInstance');
      expect(exportNames).toContain('wrapOperations');

      // Verify functions are actually functions
      expect(typeof primaryIndex.createInstance).toBe('function');
      expect(typeof primaryIndex.wrapOperations).toBe('function');
    });

    test('should not have unexpected exports', async () => {
      const primaryIndex = await import('@/primary/index') as any;

      // Get only the defined exports (runtime exports, not interfaces)
      const definedExports = Object.keys(primaryIndex).filter(key =>
        typeof primaryIndex[key] !== 'undefined'
      );

      // Should only have the expected function exports
      expect(definedExports).toEqual(
        expect.arrayContaining(['createInstance', 'wrapOperations'])
      );

      // Should not have more than expected
      expect(definedExports.length).toBe(2);
    });
  });

  describe('re-export integrity', () => {
    test('should re-export Instance module correctly', async () => {
      const primaryIndex = await import('@/primary/index');
      const instanceModule = await import('@/primary/Instance');

      // Verify the re-exported functions are the same as the originals
      expect(primaryIndex.createInstance).toBe(instanceModule.createInstance);
    });

    test('should re-export Operations module correctly', async () => {
      const primaryIndex = await import('@/primary/index');
      const operationsModule = await import('@/primary/Operations');

      // Verify the re-exported functions are the same as the originals
      expect(primaryIndex.wrapOperations).toBe(operationsModule.wrapOperations);
    });

    test('should maintain module references through re-export', async () => {
      // Import twice to ensure we get the same module instances
      const primaryIndex1 = await import('@/primary/index');
      const primaryIndex2 = await import('@/primary/index');

      expect(primaryIndex1.createInstance).toBe(primaryIndex2.createInstance);
      expect(primaryIndex1.wrapOperations).toBe(primaryIndex2.wrapOperations);
    });
  });

  describe('module import validation', () => {
    test('should import without throwing errors', async () => {
      // This test verifies that the module can be imported without runtime errors
      // TypeScript interface type checking is handled at compile time

      await expect(async () => {
        await import('@/primary/index');
      }).not.toThrow();
    });
  });
});
