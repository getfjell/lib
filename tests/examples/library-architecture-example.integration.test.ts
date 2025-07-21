import { describe, expect, it } from 'vitest';
import { demonstrateLibraryArchitecture } from '../../examples/library-architecture-example';
import {
  expectNoErrors,
  getLogOutput,
  setupConsoleCapture
} from './test-helpers';

describe('Library Architecture Example Integration Tests', () => {
  const testConsole = setupConsoleCapture();

  describe('Library Architecture Demonstration', () => {
    it('should run library architecture example without errors', async () => {
      await expect(demonstrateLibraryArchitecture()).resolves.not.toThrow();

      // Verify expected output
      const logOutput = getLogOutput(testConsole);
      expect(logOutput).toContain('Library Architecture Demonstration Complete!');

      // Should have no errors
      expectNoErrors(testConsole);
    });

    it('should demonstrate all library types in inheritance hierarchy', async () => {
      await demonstrateLibraryArchitecture();

      const logOutput = getLogOutput(testConsole);

      // Check that all library types are demonstrated
      expect(logOutput).toContain('Creating base registry instance');
      expect(logOutput).toContain('Creating fjell-lib Library');
      expect(logOutput).toContain('Creating Sequelize Library');
      expect(logOutput).toContain('Creating Firestore Library');
    });
  });
});
