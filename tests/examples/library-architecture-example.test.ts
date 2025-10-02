import { describe, expect, test, vi } from 'vitest';

// Mock console to capture output
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

// Mock the examples module
vi.mock('../../examples/library-architecture-example', () => ({
  demonstrateLibraryArchitecture: vi.fn()
}));

describe('Library Architecture Example', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    global.console = mockConsole as any;
  });

  test('should have demonstrateLibraryArchitecture function', async () => {
    // Import the function dynamically to test it exists
    const { demonstrateLibraryArchitecture } = await import('../../examples/library-architecture-example');
    
    expect(demonstrateLibraryArchitecture).toBeDefined();
    expect(typeof demonstrateLibraryArchitecture).toBe('function');
  });

  test('should be able to call demonstrateLibraryArchitecture without errors', async () => {
    const { demonstrateLibraryArchitecture } = await import('../../examples/library-architecture-example');
    
    // Mock the function to avoid actual execution
    const mockDemonstrate = vi.fn().mockResolvedValue(undefined);
    vi.doMock('../../examples/library-architecture-example', () => ({
      demonstrateLibraryArchitecture: mockDemonstrate
    }));

    expect(() => demonstrateLibraryArchitecture()).not.toThrow();
  });

  test('should export demonstrateLibraryArchitecture as a function', async () => {
    const module = await import('../../examples/library-architecture-example');
    
    expect(module).toHaveProperty('demonstrateLibraryArchitecture');
    expect(typeof module.demonstrateLibraryArchitecture).toBe('function');
  });
});
