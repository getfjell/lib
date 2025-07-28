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
    default: vi.fn(),
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
vi.mock('../../src/logger', () => {
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
vi.mock('../../src/Operations', () => ({
  wrapOperations: vi.fn().mockImplementation((toWrap) => toWrap)
}));

// Mock abstract library
vi.mock('../../src/Library', () => ({
  createLibrary: vi.fn().mockImplementation((registry, coordinate, operations, options) => ({
    coordinate,
    registry,
    operations,
    options
  }))
}));

describe('Primary Index', () => {
  describe('exports from Instance', () => {
    test('should export createLibrary function', async () => {
      const { createLibrary } = await import('../../src/primary/index');

      expect(createLibrary).toBeDefined();
      expect(typeof createLibrary).toBe('function');
    });

    test('should createLibrary function work correctly', async () => {
      const { createLibrary } = await import('../../src/primary/index');
      const { createCoordinate } = await import('@fjell/registry');

      const mockCoordinate = createCoordinate(['test'], ['scope1']);
      const mockOptions = {};
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

      const instance = createLibrary(mockRegistry, mockCoordinate, mockOperations, mockOptions);

      expect(instance).toBeDefined();
      expect(instance.coordinate).toBeDefined();
      expect(instance.operations).toBeDefined();
    });
  });

  describe('exports from Operations', () => {
    test('should export wrapOperations function', async () => {
      const { wrapOperations } = await import('../../src/primary/index');

      expect(wrapOperations).toBeDefined();
      expect(typeof wrapOperations).toBe('function');
    });

    test('should wrapOperations function work correctly', async () => {
      const { wrapOperations } = await import('../../src/primary/index');

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

      const wrapped = wrapOperations(mockOperations, mockDefinition.options, mockDefinition.coordinate, mockRegistry);

      expect(wrapped).toBeDefined();
      expect(wrapped).toStrictEqual(mockOperations); // Our mock just returns the input
    });
  });

  describe('complete export verification', () => {
    test('should have all expected exports', async () => {
      const primaryIndex = await import('../../src/primary/index');

      // Get all export names (functions will be defined, interfaces will be undefined)
      const exportNames = Object.keys(primaryIndex);

      // Should have exports for all the modules
      expect(exportNames).toContain('createLibrary');
      expect(exportNames).toContain('wrapOperations');

      // Verify functions are actually functions
      expect(typeof primaryIndex.createLibrary).toBe('function');
      expect(typeof primaryIndex.wrapOperations).toBe('function');
    });

    test('should not have unexpected exports', async () => {
      const primaryIndex = await import('../../src/primary/index') as any;

      // Get only the defined exports (runtime exports, not interfaces)
      const definedExports = Object.keys(primaryIndex).filter(key =>
        typeof primaryIndex[key] !== 'undefined'
      );

      // Should only have the expected function exports
      expect(definedExports).toEqual(
        expect.arrayContaining(['createLibrary', 'wrapOperations'])
      );

      // Should not have more than expected
      expect(definedExports.length).toBe(2);
    });
  });

  describe('re-export integrity', () => {
    test('should re-export Instance module correctly', async () => {
      const primaryIndex = await import('../../src/primary/index');
      const instanceModule = await import('../../src/primary/Library');

      // Verify the re-exported functions are the same as the originals
      expect(primaryIndex.createLibrary).toBe(instanceModule.createLibrary);
    });

    test('should re-export Operations module correctly', async () => {
      const primaryIndex = await import('../../src/primary/index');
      const operationsModule = await import('../../src/primary/Operations');

      // Verify the re-exported functions are the same as the originals
      expect(primaryIndex.wrapOperations).toBe(operationsModule.wrapOperations);
    });

    test('should maintain module references through re-export', async () => {
      // Import twice to ensure we get the same module instances
      const primaryIndex1 = await import('../../src/primary/index');
      const primaryIndex2 = await import('../../src/primary/index');

      expect(primaryIndex1.createLibrary).toBe(primaryIndex2.createLibrary);
      expect(primaryIndex1.wrapOperations).toBe(primaryIndex2.wrapOperations);
    });
  });

  describe('module import validation', () => {
    test('should import without throwing errors', async () => {
      // This test verifies that the module can be imported without runtime errors
      // TypeScript interface type checking is handled at compile time

      await expect(async () => {
        await import('../../src/primary/index');
      }).not.toThrow();
    });
  });
});
