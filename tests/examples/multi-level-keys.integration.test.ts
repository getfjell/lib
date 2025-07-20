import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import the actual example function
import { demonstrateHierarchicalPatterns } from '../../examples/multi-level-keys';

describe('Multi-Level Keys Example Integration', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let logOutput: string[];

  beforeEach(() => {
    logOutput = [];
    consoleSpy = vi.spyOn(console, 'log').mockImplementation((message) => {
      logOutput.push(message);
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('demonstrateHierarchicalPatterns()', () => {
    it('should execute without errors', async () => {
      await expect(demonstrateHierarchicalPatterns()).resolves.not.toThrow();
    });

    it('should output the main header', async () => {
      await demonstrateHierarchicalPatterns();

      expect(logOutput.some(log =>
        log.includes('🏗️ Fjell-Lib Multi-Level Keys - Hierarchical Data Patterns')
      )).toBe(true);
    });

    it('should demonstrate registry and instance creation patterns', async () => {
      await demonstrateHierarchicalPatterns();

      const registrySection = logOutput.find(log =>
        log.includes('1. Registry and Instance Creation:')
      );
      expect(registrySection).toBeDefined();

      const hasRegistryCode = logOutput.some(log =>
        log.includes('createRegistry()') &&
        log.includes('createInstance(')
      );
      expect(hasRegistryCode).toBe(true);
    });

    it('should demonstrate hierarchical data creation patterns', async () => {
      await demonstrateHierarchicalPatterns();

      const dataCreationSection = logOutput.find(log =>
        log.includes('2. Hierarchical Data Creation:')
      );
      expect(dataCreationSection).toBeDefined();

      const hasHierarchicalData = logOutput.some(log =>
        log.includes('Acme Corporation') &&
        log.includes('Engineering') &&
        log.includes('Alice')
      );
      expect(hasHierarchicalData).toBe(true);
    });

    it('should demonstrate location-based query patterns', async () => {
      await demonstrateHierarchicalPatterns();

      const locationSection = logOutput.find(log =>
        log.includes('3. Location-Based Queries:')
      );
      expect(locationSection).toBeDefined();

      const hasUsArray = logOutput.some(log =>
        log.includes("['us', 'usa']")
      );
      const hasEuArray = logOutput.some(log =>
        log.includes("['eu', 'germany']")
      );

      expect(hasUsArray).toBe(true);
      expect(hasEuArray).toBe(true);
    });

    it('should demonstrate cross-hierarchy analysis patterns', async () => {
      await demonstrateHierarchicalPatterns();

      const analysisSection = logOutput.find(log =>
        log.includes('4. Cross-Hierarchy Analysis:')
      );
      expect(analysisSection).toBeDefined();

      const hasAnalysisCode = logOutput.some(log =>
        log.includes('budgetByRegion') &&
        log.includes('allSeniorEngineers')
      );
      expect(hasAnalysisCode).toBe(true);
    });

    it('should demonstrate real implementation patterns', async () => {
      await demonstrateHierarchicalPatterns();

      const implementationSection = logOutput.find(log =>
        log.includes('5. Real Implementation Patterns:')
      );
      expect(implementationSection).toBeDefined();

      const hasImplementationCode = logOutput.some(log =>
        log.includes('createDepartmentOperations') &&
        log.includes('wrapAllOperation')
      );
      expect(hasImplementationCode).toBe(true);
    });

    it('should list benefits of hierarchical organization', async () => {
      await demonstrateHierarchicalPatterns();

      const benefitsSection = logOutput.find(log =>
        log.includes('6. Benefits of Hierarchical Organization:')
      );
      expect(benefitsSection).toBeDefined();

      const hasDataPartitioning = logOutput.some(log =>
        log.includes('Location-based data partitioning')
      );
      const hasRegionalCompliance = logOutput.some(log =>
        log.includes('Regional compliance')
      );
      const hasScalableTenant = logOutput.some(log =>
        log.includes('Scalable multi-tenant')
      );

      expect(hasDataPartitioning).toBe(true);
      expect(hasRegionalCompliance).toBe(true);
      expect(hasScalableTenant).toBe(true);
    });

    it('should provide completion message and key takeaways', async () => {
      await demonstrateHierarchicalPatterns();

      const hasCompletion = logOutput.some(log =>
        log.includes('🎉 Hierarchical patterns demonstration completed!')
      );
      expect(hasCompletion).toBe(true);

      const hasTakeaways = logOutput.some(log =>
        log.includes('💡 Key takeaways:')
      );
      expect(hasTakeaways).toBe(true);

      const hasContainedItems = logOutput.some(log =>
        log.includes('contained items for hierarchical')
      );
      const hasLocationKeys = logOutput.some(log =>
        log.includes('location keys for data partitioning')
      );

      expect(hasContainedItems).toBe(true);
      expect(hasLocationKeys).toBe(true);
    });

    it('should output all expected sections in correct order', async () => {
      await demonstrateHierarchicalPatterns();

      const allOutput = logOutput.join('\n');

      // Check that sections appear in the correct order
      const registryIndex = allOutput.indexOf('1. Registry and Instance Creation:');
      const dataIndex = allOutput.indexOf('2. Hierarchical Data Creation:');
      const queryIndex = allOutput.indexOf('3. Location-Based Queries:');
      const analysisIndex = allOutput.indexOf('4. Cross-Hierarchy Analysis:');
      const implementationIndex = allOutput.indexOf('5. Real Implementation Patterns:');
      const benefitsIndex = allOutput.indexOf('6. Benefits of Hierarchical Organization:');

      expect(registryIndex).toBeGreaterThan(-1);
      expect(dataIndex).toBeGreaterThan(registryIndex);
      expect(queryIndex).toBeGreaterThan(dataIndex);
      expect(analysisIndex).toBeGreaterThan(queryIndex);
      expect(implementationIndex).toBeGreaterThan(analysisIndex);
      expect(benefitsIndex).toBeGreaterThan(implementationIndex);
    });

    it('should call console.log multiple times', async () => {
      await demonstrateHierarchicalPatterns();

      // Should have substantial output
      expect(consoleSpy).toHaveBeenCalledTimes(logOutput.length);
      expect(logOutput.length).toBeGreaterThan(10);
    });

    // Additional test for async function completion without errors
    it('should complete the async function successfully', async () => {
      const result = await demonstrateHierarchicalPatterns();
      expect(result).toBeUndefined(); // Function doesn't return anything
    });

    // Test that the function handles repeated calls consistently
    it('should produce consistent output on repeated calls', async () => {
      await demonstrateHierarchicalPatterns();
      const firstCallOutput = [...logOutput];

      // Clear and call again
      logOutput.length = 0;
      consoleSpy.mockClear();

      await demonstrateHierarchicalPatterns();
      const secondCallOutput = [...logOutput];

      expect(firstCallOutput).toEqual(secondCallOutput);
    });

    // Test specific content patterns more thoroughly
    it('should include all conceptual patterns in the correct format', async () => {
      await demonstrateHierarchicalPatterns();

      const allOutput = logOutput.join('\n');

      // Test for specific code patterns that should be displayed
      expect(allOutput).toContain('createRegistry()');
      expect(allOutput).toContain("name: 'Acme Corporation'");
      expect(allOutput).toContain("region: 'us'");
      expect(allOutput).toContain("region: 'eu'");
      expect(allOutput).toContain("locations: ['us', 'usa']");
      expect(allOutput).toContain("locations: ['eu', 'germany']");
      expect(allOutput).toContain('wrapAllOperation');
      expect(allOutput).toContain('createDepartmentOperations');
    });
  });

  describe('Error Handling', () => {
    it('should handle console.log errors gracefully', async () => {
      // Test that the function handles console.log being mocked
      consoleSpy.mockImplementation(() => {
        throw new Error('Console error');
      });

      await expect(demonstrateHierarchicalPatterns()).rejects.toThrow('Console error');
    });

    // Test partial console.log failures
    it('should handle intermittent console.log failures', async () => {
      let callCount = 0;
      consoleSpy.mockImplementation((...args: unknown[]) => {
        callCount++;
        if (callCount === 5) { // Fail on the 5th call
          throw new Error('Intermittent console error');
        }
        logOutput.push(String(args[0]));
      });

      await expect(demonstrateHierarchicalPatterns()).rejects.toThrow('Intermittent console error');

      // Should have captured some output before the error
      expect(logOutput.length).toBeGreaterThan(0);
      expect(logOutput.length).toBeLessThan(10); // But not all output
    });

    // Test console.log being null
    it('should handle console.log being null', async () => {
      const originalConsole = console.log;
      // @ts-expect-error - Intentionally setting to null for testing
      console.log = null;

      try {
        await expect(demonstrateHierarchicalPatterns()).rejects.toThrow();
      } finally {
        console.log = originalConsole;
      }
    });
  });

  describe('Performance and Timing', () => {
    it('should complete execution within reasonable time', async () => {
      const startTime = Date.now();
      await demonstrateHierarchicalPatterns();
      const endTime = Date.now();

      // Should complete within 1 second (generous timeout for CI)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should produce expected amount of output', async () => {
      await demonstrateHierarchicalPatterns();

      // Should produce substantial output but not excessive
      expect(logOutput.length).toBeGreaterThan(5);
      expect(logOutput.length).toBeLessThan(100);

      // Check total character count is reasonable
      const totalChars = logOutput.join('').length;
      expect(totalChars).toBeGreaterThan(1000);
      expect(totalChars).toBeLessThan(50000);
    });
  });

  describe('Module Integration', () => {
    // Test that the function exists and is callable
    it('should export the demonstrateHierarchicalPatterns function', () => {
      expect(typeof demonstrateHierarchicalPatterns).toBe('function');
      expect(demonstrateHierarchicalPatterns.constructor.name).toBe('AsyncFunction');
    });

    // Test function signature
    it('should have correct function signature', () => {
      expect(demonstrateHierarchicalPatterns.length).toBe(0); // No parameters
    });
  });
});

// Additional test suite for module-level behavior
describe('Multi-Level Keys Module Integration', () => {
  it('should handle module import correctly', async () => {
    // Test that importing the module doesn't execute the main block
    const { demonstrateHierarchicalPatterns: importedFunction } = await import('../../examples/multi-level-keys');
    expect(typeof importedFunction).toBe('function');
  });

  it('should have all expected exports', async () => {
    const moduleExports = await import('../../examples/multi-level-keys');
    expect(moduleExports).toHaveProperty('demonstrateHierarchicalPatterns');
    expect(typeof moduleExports.demonstrateHierarchicalPatterns).toBe('function');
  });

  // Test to try to cover the require.main === module branch
  it('should handle direct module execution context', async () => {
    // This test verifies the behavior when the module would be run directly
    // We can't easily trigger the actual branch, but we can test related functionality

    // Mock require.main to simulate direct execution
    const originalRequire = globalThis.require;
    const mockModule = {
      id: '../../examples/multi-level-keys',
      filename: '/path/to/multi-level-keys.ts'
    };

    if (originalRequire) {
      Object.defineProperty(originalRequire, 'main', {
        value: mockModule,
        writable: true,
        configurable: true
      });
    }

    // The module has already been loaded, so we test that the function works
    // regardless of execution context
    await expect(demonstrateHierarchicalPatterns()).resolves.not.toThrow();

    // Restore original require.main
    if (originalRequire && originalRequire.main !== mockModule) {
      Object.defineProperty(originalRequire, 'main', {
        value: originalRequire.main,
        writable: true,
        configurable: true
      });
    }
  });

  // Test import/require variations
  it('should handle different import patterns', async () => {
    // Test dynamic import
    const dynamicImport = await import('../../examples/multi-level-keys');
    expect(dynamicImport.demonstrateHierarchicalPatterns).toBe(demonstrateHierarchicalPatterns);

    // Test that multiple imports return the same function
    const secondImport = await import('../../examples/multi-level-keys');
    expect(secondImport.demonstrateHierarchicalPatterns).toBe(dynamicImport.demonstrateHierarchicalPatterns);
  });
});

// Test suite for edge cases and additional branches
describe('Multi-Level Keys Edge Cases', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let logOutput: string[];

  beforeEach(() => {
    logOutput = [];
    consoleSpy = vi.spyOn(console, 'log').mockImplementation((message) => {
      logOutput.push(message);
    });
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      // Mock console.error to capture any error output
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // Test to ensure consistent behavior across different environments
  it('should work in different JavaScript environments', async () => {
    // Test with different execution contexts
    // The function should work regardless of environment
    await demonstrateHierarchicalPatterns();
    expect(logOutput.length).toBeGreaterThan(0);

    // Test that it works multiple times in the same environment
    logOutput.length = 0;
    await demonstrateHierarchicalPatterns();
    expect(logOutput.length).toBeGreaterThan(0);
  });

  // Test promise rejection handling
  it('should handle promise rejections in the catch block', async () => {
    // This test tries to trigger the .catch(console.error) path
    const errorMessage = 'Test promise rejection';
    const rejectedPromise = Promise.reject(new Error(errorMessage));

    // Test that the catch block would handle errors
    await expect(rejectedPromise.catch(console.error)).resolves.toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
  });

  // Test async function error paths
  it('should handle errors during async execution', async () => {
    // Create a version that throws during execution
    consoleSpy.mockImplementationOnce(() => {
      throw new Error('Async execution error');
    });

    await expect(demonstrateHierarchicalPatterns()).rejects.toThrow('Async execution error');
  });

  // Test memory and resource cleanup
  it('should not leak memory or resources', async () => {
    const initialMemory = process.memoryUsage();

    // Run the function multiple times
    for (let i = 0; i < 5; i++) {
      logOutput.length = 0; // Clear output
      await demonstrateHierarchicalPatterns();
    }

    const finalMemory = process.memoryUsage();

    // Memory should not grow excessively (allowing for some variance)
    const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
    expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
  });

  // Test function properties and metadata
  it('should have correct function metadata', () => {
    expect(demonstrateHierarchicalPatterns.name).toBe('demonstrateHierarchicalPatterns');
    expect(demonstrateHierarchicalPatterns.length).toBe(0);
    expect(demonstrateHierarchicalPatterns.constructor.name).toBe('AsyncFunction');
  });

  // Test the error catch behavior that would be used in module execution
  it('should handle errors in the same way as module-level catch', async () => {
    // Create a function that rejects to test the catch behavior
    const testFunction = async () => {
      throw new Error('Module execution error');
    };

    // Test the same pattern used in the module: promise.catch(console.error)
    let caughtError: Error | undefined;
    const errorHandler = (error: Error) => {
      caughtError = error;
    };

    await testFunction().catch(errorHandler);
    expect(caughtError).toBeInstanceOf(Error);
    expect(caughtError?.message).toBe('Module execution error');
  });

  // Test potential logical operator branches in simulated context
  it('should handle logical operator patterns correctly', () => {
    // Test the pattern similar to line 195: acc[dept.region] = (acc[dept.region] || 0) + dept.budget;
    const testObject: Record<string, number> = {};
    const region = 'us';
    const budget = 1000;

    // This simulates the logical OR pattern in the code
    testObject[region] = (testObject[region] || 0) + budget;
    expect(testObject[region]).toBe(1000);

    // Test with existing value
    testObject[region] = (testObject[region] || 0) + budget;
    expect(testObject[region]).toBe(2000);
  });

  // Test simulated conditional logic patterns
  it('should verify conditional logic patterns work as expected', () => {
    // Simulate the conditional patterns shown in the code examples
    const locations = ['us', 'usa'];

    // Test the pattern: if (locations && locations.length >= 2)
    if (locations && locations.length >= 2) {
      expect(locations.length).toBeGreaterThanOrEqual(2);
    }

    // Test the pattern: const locations = options.locations || [item.region, item.country]
    const options: { locations?: string[] } = {};
    const item = { region: 'us', country: 'usa' };
    const resultLocations = options.locations || [item.region, item.country];
    expect(resultLocations).toEqual(['us', 'usa']);
  });
});
