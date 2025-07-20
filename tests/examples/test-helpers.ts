import { afterEach, beforeEach, expect, vi } from 'vitest';

export interface TestConsole {
  consoleLogs: string[];
  consoleErrors: string[];
  originalConsoleLog: typeof console.log;
  originalConsoleError: typeof console.error;
}

export function setupConsoleCapture(): TestConsole {
  const testConsole: TestConsole = {
    consoleLogs: [],
    consoleErrors: [],
    originalConsoleLog: console.log,
    originalConsoleError: console.error,
  };

  beforeEach(() => {
    // Capture console output for testing
    testConsole.consoleLogs = [];
    testConsole.consoleErrors = [];

    console.log = vi.fn((...args) => {
      testConsole.consoleLogs.push(args.join(' '));
      testConsole.originalConsoleLog(...args);
    });

    console.error = vi.fn((...args) => {
      testConsole.consoleErrors.push(args.join(' '));
      testConsole.originalConsoleError(...args);
    });
  });

  afterEach(() => {
    // Restore original console methods
    console.log = testConsole.originalConsoleLog;
    console.error = testConsole.originalConsoleError;
  });

  return testConsole;
}

export function getLogOutput(testConsole: TestConsole): string {
  return testConsole.consoleLogs.join('\n');
}

export function expectNoErrors(testConsole: TestConsole, allowedErrors: string[] = []): void {
  const filteredErrors = testConsole.consoleErrors.filter(error =>
    !allowedErrors.some(allowed => error.includes(allowed))
  );
  expect(filteredErrors).toHaveLength(0);
}

// Common assertions for integration validation
export function expectConceptualUsage(logOutput: string): void {
  // Should show conceptual patterns (this is a conceptual example)
  expect(logOutput).toContain('Conceptual');
  expect(logOutput).toContain('fjell-lib');

  // Should show step-by-step execution
  expect(logOutput).toContain('Step');
}

export function expectCRUDOperations(logOutput: string): void {
  // Should demonstrate CRUD operations
  expect(logOutput).toContain('Create');
  expect(logOutput).toContain('Read');
  expect(logOutput).toContain('Update');
  expect(logOutput).toContain('Delete');

  // Should show operation symbols
  expect(logOutput).toContain('➕'); // Create
  expect(logOutput).toContain('📊'); // Read/All
  expect(logOutput).toContain('✏️'); // Update
  expect(logOutput).toContain('🗑️'); // Delete
}
