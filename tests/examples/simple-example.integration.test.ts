import { describe, expect, it } from 'vitest';
import { runSimpleExample } from '../../examples/simple-example';
import {
  expectConceptualUsage,
  expectCRUDOperations,
  expectNoErrors,
  getLogOutput,
  setupConsoleCapture
} from './test-helpers';

describe('Simple Example Integration Tests', () => {
  const testConsole = setupConsoleCapture();

  describe('Basic CRUD Operations Example', () => {
    it('should run simple example without errors', async () => {
      await expect(runSimpleExample()).resolves.not.toThrow();

      // Verify expected output
      const logOutput = getLogOutput(testConsole);
      expect(logOutput).toContain('Fjell-Lib Simple Example');
      expect(logOutput).toContain('Basic CRUD Operations');
      expect(logOutput).toContain('🚀');

      // Should have no errors
      expectNoErrors(testConsole);
    });

    it('should demonstrate conceptual fjell-lib patterns', async () => {
      await runSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Verify conceptual usage patterns
      expectConceptualUsage(logOutput);

      // Should show registry and instance concepts
      expect(logOutput).toContain('registry');
      expect(logOutput).toContain('instance');
      expect(logOutput).toContain('operations');
    });

    it('should demonstrate complete CRUD operations workflow', async () => {
      await runSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Verify CRUD operations are demonstrated
      expectCRUDOperations(logOutput);

      // Should show both User and Task operations
      expect(logOutput).toContain('User');
      expect(logOutput).toContain('Task');
    });

    it('should show step-by-step operation flow', async () => {
      await runSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Verify the example walks through key steps
      expect(logOutput).toContain('Step 1: Create Data Model Instances');
      expect(logOutput).toContain('Step 2: Create Users');
      expect(logOutput).toContain('Step 3: Create Tasks');
      expect(logOutput).toContain('Step 4: Read Operations');
      expect(logOutput).toContain('Step 5: Update Operations');
      expect(logOutput).toContain('Step 6: Get Specific Items');
      expect(logOutput).toContain('Step 7: Additional Operations');
      expect(logOutput).toContain('Step 8: Delete Operations');
      expect(logOutput).toContain('Step 9: Final Summary');
    });

    it('should demonstrate data creation operations', async () => {
      await runSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Verify user creation
      expect(logOutput).toContain('Alice Johnson');
      expect(logOutput).toContain('Bob Smith');
      expect(logOutput).toContain('bob@example.com');

      // Verify task creation
      expect(logOutput).toContain('Complete project documentation');
      expect(logOutput).toContain('Review code changes');
      expect(logOutput).toContain('Update dependencies');
    });

    it('should demonstrate query and find operations', async () => {
      await runSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Verify finding operations
      expect(logOutput).toContain('🔍 Finding');
      expect(logOutput).toContain('Found user: Bob Smith');
      expect(logOutput).toContain('tasks for Alice');
      expect(logOutput).toContain('Found 3 tasks total');
      expect(logOutput).toContain('Found 2 users total');
    });

    it('should demonstrate update operations', async () => {
      await runSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Verify update operations
      expect(logOutput).toContain('✏️ Updating');
      expect(logOutput).toContain('marked as completed');
      expect(logOutput).toContain('alice.johnson@newcompany.com');
    });

    it('should demonstrate delete operations', async () => {
      await runSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Verify delete operations
      expect(logOutput).toContain('🗑️ Removing');
      expect(logOutput).toContain('Task removal successful');
      expect(logOutput).toContain('2 tasks remaining');
    });

    it('should demonstrate additional operations (count, exists)', async () => {
      await runSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Verify additional operations
      expect(logOutput).toContain('Total users: 2');
      expect(logOutput).toContain('Active tasks: 2');
      expect(logOutput).toContain('Alice exists: true');
    });

    it('should provide educational content and next steps', async () => {
      await runSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Verify educational content
      expect(logOutput).toContain('Key concepts demonstrated');
      expect(logOutput).toContain('Data model interfaces extending Item<keyType>');
      expect(logOutput).toContain('Operations interface for CRUD functionality');
      expect(logOutput).toContain('Registry and Instance creation patterns');

      // Verify next steps guidance
      expect(logOutput).toContain('Next steps');
      expect(logOutput).toContain('multi-level-keys.ts');
      expect(logOutput).toContain('enterprise-example.ts');
      expect(logOutput).toContain('README.md');
    });

    it('should show final state summary', async () => {
      await runSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Verify final summary
      expect(logOutput).toContain('📊 Final State:');
      expect(logOutput).toContain('Users: 2');
      expect(logOutput).toContain('Tasks: 2');
      expect(logOutput).toContain('Alice Johnson (alice.johnson@newcompany.com)');
      expect(logOutput).toContain('Bob Smith (bob@example.com)');
      expect(logOutput).toContain('✅'); // completed task indicator
      expect(logOutput).toContain('⏳'); // pending task indicator
    });
  });

  describe('Integration Validation', () => {
    it('should complete example execution in reasonable time', async () => {
      const startTime = Date.now();
      await runSimpleExample();
      const executionTime = Date.now() - startTime;

      // Should complete within reasonable time (5 seconds)
      expect(executionTime).toBeLessThan(5000);
    });

    it('should demonstrate practical fjell-lib usage patterns', async () => {
      await runSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Should cover key educational concepts
      expect(logOutput).toContain('Simple example completed');
      expect(logOutput).toContain('understand the basics of fjell-lib patterns');
      expect(logOutput).toContain('createRegistry');
      expect(logOutput).toContain('createInstance');

      // Should demonstrate both conceptual and practical usage
      expect(logOutput).toContain('In real fjell-lib usage:');
      expect(logOutput).toContain('Conceptual instances created');
    });

    it('should handle async operations correctly', async () => {
      await runSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Verify async operations completed successfully
      expect(logOutput).toContain('📖 Getting');
      expect(logOutput).toContain('📊 Getting all');
      expect(logOutput).toContain('✅'); // Success indicators

      // Should have completed all steps
      expect(logOutput).toContain('🎉 Simple example completed');

      expectNoErrors(testConsole);
    });
  });
});
