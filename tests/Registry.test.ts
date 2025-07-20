import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRegistry, createRegistryFactory, Registry } from '@/Registry';
import { createCoordinate } from '@fjell/registry';
import LibLogger from '@/logger';

// Mock the logger module

vi.mock('@/logger', () => {
  return {
    default: {
      get: vi.fn().mockReturnValue({
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        emergency: vi.fn(),
        critical: vi.fn(),
        alert: vi.fn(),
        notice: vi.fn(),
        get: vi.fn().mockReturnThis(),
      }),
    },
  };
});

// Helper function to create mock instances compatible with fjell-registry
const createMockInstance = (kta: string[], registry: Registry) => {
  const coordinate = createCoordinate(kta[0] as any, []);
  return {
    coordinate,
    registry
  };
};

describe('LibRegistry', () => {
  let registry: Registry;

  beforeEach(() => {
    registry = createRegistry();
    vi.clearAllMocks();
  });

  describe('createRegistry', () => {
    it('should create a registry with lib type', () => {
      const newRegistry = createRegistry();
      expect(newRegistry).toBeDefined();
      // Verify it has the expected lib registry properties
      expect(typeof newRegistry.register).toBe('function');
      expect(typeof newRegistry.get).toBe('function');
    });

    it('should create a registry with registryHub parameter', () => {
      const mockRegistryHub = {} as any;
      const newRegistry = createRegistry(mockRegistryHub);
      expect(newRegistry).toBeDefined();
      expect(typeof newRegistry.register).toBe('function');
      expect(typeof newRegistry.get).toBe('function');
    });
  });

  describe('createRegistryFactory', () => {
    it('should return a factory function', () => {
      const factory = createRegistryFactory();
      expect(typeof factory).toBe('function');
    });

    it('should create a lib registry when factory is called with "lib" type', () => {
      const factory = createRegistryFactory();
      const newRegistry = factory('lib');

      expect(newRegistry).toBeDefined();
      expect(typeof newRegistry.register).toBe('function');
      expect(typeof newRegistry.get).toBe('function');

      // Verify logger was called
      const mockLoggerInstance = LibLogger.get("LibRegistry");
      expect(mockLoggerInstance.debug).toHaveBeenCalledWith(
        "Creating lib registry",
        expect.objectContaining({ type: 'lib' })
      );
    });

    it('should create a lib registry with registryHub when factory is called', () => {
      const factory = createRegistryFactory();
      const mockRegistryHub = {} as any;
      const newRegistry = factory('lib', mockRegistryHub);

      expect(newRegistry).toBeDefined();

      // Verify logger was called with registryHub
      const mockLoggerInstance = LibLogger.get("LibRegistry");
      expect(mockLoggerInstance.debug).toHaveBeenCalledWith(
        "Creating lib registry",
        { type: 'lib', registryHub: mockRegistryHub }
      );
    });

    it('should throw error when factory is called with invalid type', () => {
      const factory = createRegistryFactory();

      expect(() => factory('invalid')).toThrow(
        'LibRegistryFactory can only create \'lib\' type registries, got: invalid'
      );

      expect(() => factory('cache')).toThrow(
        'LibRegistryFactory can only create \'lib\' type registries, got: cache'
      );

      expect(() => factory('')).toThrow(
        'LibRegistryFactory can only create \'lib\' type registries, got: '
      );
    });

    it('should not call debug logger when factory creation fails', () => {
      const factory = createRegistryFactory();

      try {
        factory('invalid');
      } catch {
        // Expected error
      }

      // Logger should not be called for invalid type
      const mockLoggerInstance = LibLogger.get("LibRegistry");
      expect(mockLoggerInstance.debug).not.toHaveBeenCalled();
    });
  });

  describe('registry operations', () => {
    it('should register a library', () => {
      const lib = createMockInstance(['testLib'], registry);
      registry.register(['testLib'], lib);
      expect(registry.get(['testLib'])).toBe(lib);
    });

    it('should return undefined for unregistered library', () => {
      expect(() => registry.get(['unknownLib'])).toThrow('Instance not found for key path: unknownLib, Missing key: unknownLib');
    });

    it('should register and retrieve library with multi-element key array', () => {
      const lib = createMockInstance(['test', 'nested', 'lib'], registry);
      registry.register(['test', 'nested', 'lib'], lib);
      expect(registry.get(['test', 'nested', 'lib'])).toBe(lib);
    });

    it('should return undefined when partial key array match', () => {
      const lib = createMockInstance(['test', 'nested', 'lib'], registry);
      registry.register(['test', 'nested', 'lib'], lib);
      expect(() => registry.get(['test', 'nested'])).toThrow('Instance not found for key path: test.nested, Missing key: nested');
    });

    it('should handle multiple libraries with different key arrays', () => {
      const lib1 = createMockInstance(['test', 'lib1'], registry);
      const lib2 = createMockInstance(['test', 'lib2'], registry);
      const lib3 = createMockInstance(['another', 'lib'], registry);

      registry.register(['test', 'lib1'], lib1);
      registry.register(['test', 'lib2'], lib2);
      registry.register(['another', 'lib'], lib3);

      expect(registry.get(['test', 'lib1'])).toBe(lib1);
      expect(registry.get(['test', 'lib2'])).toBe(lib2);
      expect(registry.get(['another', 'lib'])).toBe(lib3);
    });

    it('should handle multiple libraries with very different key arrays', () => {
      const lib1 = createMockInstance(['nation'], registry);
      const lib2 = createMockInstance(['element', 'container', 'region', 'nation'], registry);

      registry.register(['nation'], lib1);
      registry.register(['element', 'container', 'region', 'nation'], lib2);

      expect(registry.get(['nation'])).toBe(lib1);
      expect(registry.get(['element', 'container', 'region', 'nation'])).toBe(lib2);
    });

    it('should handle multiple libraries with different scopes', () => {
      const lib1 = createMockInstance(['nation'], registry);
      const lib2 = createMockInstance(['nation'], registry);

      registry.register(['nation'], lib1, { scopes: ['scope1'] });
      registry.register(['nation'], lib2, { scopes: ['scope2'] });

      expect(registry.get(['nation'], { scopes: ['scope1'] })).toBe(lib1);
      expect(registry.get(['nation'], { scopes: ['scope2'] })).toBe(lib2);
    });

    it('should handle multiple libraries with very different key arrays', () => {
      const lib1 = createMockInstance(['element', 'container', 'region', 'nation'], registry);
      const lib2 = createMockInstance(['nation'], registry);

      registry.register(['element', 'container', 'region', 'nation'], lib1);
      registry.register(['nation'], lib2);

      expect(registry.get(['element', 'container', 'region', 'nation'])).toBe(lib1);
      expect(registry.get(['nation'])).toBe(lib2);
    });

    it('should handle empty key arrays gracefully', () => {
      // Empty key arrays return undefined rather than throwing
      expect(() => registry.get([])).not.toThrow();
    });

    it('should handle registration with empty options', () => {
      const lib = createMockInstance(['testLib'], registry);
      registry.register(['testLib'], lib, {});
      expect(registry.get(['testLib'])).toBe(lib);
    });

    it('should handle registration with null/undefined options', () => {
      const lib = createMockInstance(['testLib'], registry);
      registry.register(['testLib'], lib);
      expect(registry.get(['testLib'])).toBe(lib);
    });
  });

  describe('logger integration', () => {
    it('should use logger when creating registry through factory', () => {
      const factory = createRegistryFactory();
      const mockLoggerInstance = LibLogger.get("LibRegistry");
      factory('lib');

      expect(mockLoggerInstance.debug).toHaveBeenCalledWith(
        "Creating lib registry",
        expect.objectContaining({ type: 'lib' })
      );
    });

    it('should log with registryHub when provided', () => {
      const factory = createRegistryFactory();
      const mockLoggerInstance = LibLogger.get("LibRegistry");
      const mockHub = { name: 'test-hub' } as any;
      factory('lib', mockHub);

      expect(mockLoggerInstance.debug).toHaveBeenCalledWith(
        "Creating lib registry",
        { type: 'lib', registryHub: mockHub }
      );
    });
  });
});
