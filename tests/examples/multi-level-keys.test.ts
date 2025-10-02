import { describe, expect, test, vi } from 'vitest';

// Mock console to capture output
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

describe('Multi-Level Keys Example', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    global.console = mockConsole as any;
  });

  test('should have demonstrateHierarchicalPatterns function', async () => {
    // Import the function dynamically to test it exists
    const { demonstrateHierarchicalPatterns } = await import('../../examples/multi-level-keys');
    
    expect(demonstrateHierarchicalPatterns).toBeDefined();
    expect(typeof demonstrateHierarchicalPatterns).toBe('function');
  });

  test('should be able to call demonstrateHierarchicalPatterns without errors', async () => {
    const { demonstrateHierarchicalPatterns } = await import('../../examples/multi-level-keys');
    
    // Mock the function to avoid actual execution
    const mockDemonstrate = vi.fn().mockResolvedValue(undefined);
    vi.doMock('../../examples/multi-level-keys', () => ({
      demonstrateHierarchicalPatterns: mockDemonstrate
    }));

    await expect(demonstrateHierarchicalPatterns()).resolves.not.toThrow();
  });

  test('should export demonstrateHierarchicalPatterns as a function', async () => {
    const module = await import('../../examples/multi-level-keys');
    
    expect(module).toHaveProperty('demonstrateHierarchicalPatterns');
    expect(typeof module.demonstrateHierarchicalPatterns).toBe('function');
  });
});
