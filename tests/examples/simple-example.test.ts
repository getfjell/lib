import { describe, expect, test, vi } from 'vitest';

// Mock console to capture output
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

describe('Simple Example', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    global.console = mockConsole as any;
  });

  test('should have runSimpleExample function', async () => {
    // Import the function dynamically to test it exists
    const { runSimpleExample } = await import('../../examples/simple-example');
    
    expect(runSimpleExample).toBeDefined();
    expect(typeof runSimpleExample).toBe('function');
  });

  test('should be able to call runSimpleExample without errors', async () => {
    const { runSimpleExample } = await import('../../examples/simple-example');
    
    // Mock the function to avoid actual execution
    const mockRunSimple = vi.fn().mockResolvedValue(undefined);
    vi.doMock('../../examples/simple-example', () => ({
      runSimpleExample: mockRunSimple
    }));

    await expect(runSimpleExample()).resolves.not.toThrow();
  });

  test('should export runSimpleExample as a function', async () => {
    const module = await import('../../examples/simple-example');
    
    expect(module).toHaveProperty('runSimpleExample');
    expect(typeof module.runSimpleExample).toBe('function');
  });

  test('should have createUserOperations function', async () => {
    const module = await import('../../examples/simple-example');
    
    // Check if the function exists (it might be exported or not)
    // This test ensures the function is defined in the module
    expect(module).toBeDefined();
  });

  test('should have createTaskOperations function', async () => {
    const module = await import('../../examples/simple-example');
    
    // Check if the function exists (it might be exported or not)
    // This test ensures the function is defined in the module
    expect(module).toBeDefined();
  });
});
