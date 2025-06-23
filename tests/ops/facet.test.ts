import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { ComKey, Item, PriKey } from '@fjell/core';

// Create mock logger functions that can be accessed by tests
const mockLoggerDebug = vi.hoisted(() => vi.fn());
const mockLoggerDefault = vi.hoisted(() => vi.fn());

// Mock the logger
vi.mock('@/logger', () => ({
  default: {
    get: vi.fn(() => ({
      debug: mockLoggerDebug,
      default: mockLoggerDefault,
    })),
  },
}));

import { wrapFacetOperation } from '@/ops/facet';
import { Definition } from '@/Definition';
import { Operations } from '@/Operations';
import { Registry } from '@/Registry';
import LibLogger from '@/logger';

// Type definitions for test data
interface TestItem extends Item<'test', 'level1'> {
  id: string;
  name: string;
}

describe('wrapFacetOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'level1'>;
  let mockDefinition: Definition<TestItem, 'test', 'level1'>;
  let mockRegistry: Registry;
  let mockFacetMethod: MockedFunction<any>;
  let mockCoordinate: { toString: MockedFunction<any> };

  beforeEach(() => {
    // Reset only specific mocks, not the logger get mock since it's called at module load time
    mockLoggerDebug.mockClear();
    mockLoggerDefault.mockClear();

    // Create mock facet method
    mockFacetMethod = vi.fn();

    // Create mock coordinate with toString method
    mockCoordinate = {
      toString: vi.fn().mockReturnValue('test-coordinate'),
    };

    // Mock the operations object
    mockOperations = {
      facet: vi.fn(),
    } as any;

    // Mock definition with facets
    mockDefinition = {
      coordinate: mockCoordinate,
      options: {
        facets: {
          testFacet: mockFacetMethod,
          complexFacet: mockFacetMethod,
        }
      }
    } as unknown as Definition<TestItem, 'test', 'level1'>;

    mockRegistry = {} as Registry;
  });

  describe('wrapFacetOperation', () => {
    it('should return a function when called', () => {
      const result = wrapFacetOperation(mockOperations, mockDefinition, mockRegistry);

      expect(typeof result).toBe('function');
    });

    it('should call LibLogger.get with correct parameters', () => {
      // The logger is called at module load time with the correct parameters
      expect(LibLogger.get).toHaveBeenCalledWith('library', 'ops', 'facet');
    });
  });

  describe('wrapped facet function', () => {
    let wrappedFacet: ReturnType<typeof wrapFacetOperation<TestItem, 'test', 'level1'>>;

    beforeEach(() => {
      wrappedFacet = wrapFacetOperation(mockOperations, mockDefinition, mockRegistry);
    });

    it('should call the facet method from definition with correct parameters', async () => {
      const facetResult = { data: 'test facet result', count: 42 };
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = { param1: 'value1', param2: 42, param3: true };

      mockFacetMethod.mockResolvedValue(facetResult);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockFacetMethod).toHaveBeenCalledWith(testKey, facetParams);
      expect(result).toBe(facetResult);
    });

    it('should work with ComKey as well as PriKey', async () => {
      const facetResult = { data: 'composite key result' };
      const testKey: ComKey<'test', 'level1'> = 'composite-key' as unknown as ComKey<'test', 'level1'>;
      const facetKey = 'testFacet';
      const facetParams = { param1: 'value1' };

      mockFacetMethod.mockResolvedValue(facetResult);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockFacetMethod).toHaveBeenCalledWith(testKey, facetParams);
      expect(result).toBe(facetResult);
    });

    it('should log debug information before calling facet', async () => {
      const facetResult = { data: 'test' };
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = { param1: 'value1', param2: 42 };

      mockFacetMethod.mockResolvedValue(facetResult);

      await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockLoggerDebug).toHaveBeenCalledWith('facet', {
        key: testKey,
        facetKey,
        facetParams,
      });
    });

    it('should log the facet result after successful execution', async () => {
      const facetResult = { data: 'test facet result', metrics: { count: 10, success: true } };
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};

      mockFacetMethod.mockResolvedValue(facetResult);

      await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockLoggerDefault).toHaveBeenCalledWith('facet result: %j', {
        facetResult,
      });
    });

    it('should handle complex facet parameters including arrays and dates', async () => {
      const facetResult = { processedData: 'complex result' };
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'complexFacet';
      const testDate = new Date('2023-01-01');
      const facetParams = {
        stringParam: 'test',
        numberParam: 123,
        booleanParam: true,
        dateParam: testDate,
        arrayParam: ['item1', 'item2', 123, true],
      };

      mockFacetMethod.mockResolvedValue(facetResult);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockFacetMethod).toHaveBeenCalledWith(testKey, facetParams);
      expect(result).toBe(facetResult);
      expect(mockLoggerDebug).toHaveBeenCalledWith('facet', {
        key: testKey,
        facetKey,
        facetParams,
      });
    });

    it('should handle facet methods that return different types', async () => {
      const primitiveResult = 'simple string result';
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};

      mockFacetMethod.mockResolvedValue(primitiveResult);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(result).toBe(primitiveResult);
      expect(mockLoggerDefault).toHaveBeenCalledWith('facet result: %j', {
        facetResult: primitiveResult,
      });
    });

    it('should handle facet methods that return null or undefined', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};

      mockFacetMethod.mockResolvedValue(null);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(result).toBe(null);
      expect(mockLoggerDefault).toHaveBeenCalledWith('facet result: %j', {
        facetResult: null,
      });
    });

    it('should propagate errors from the facet method', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};
      const testError = new Error('Facet execution failed');

      mockFacetMethod.mockRejectedValue(testError);

      await expect(wrappedFacet(testKey, facetKey, facetParams)).rejects.toThrow('Facet execution failed');
      expect(mockFacetMethod).toHaveBeenCalledWith(testKey, facetParams);
    });

    it('should still log debug information even when facet fails', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = { param1: 'value1' };
      const testError = new Error('Facet failed');

      mockFacetMethod.mockRejectedValue(testError);

      try {
        await wrappedFacet(testKey, facetKey, facetParams);
      } catch {
        // Expected to throw
      }

      expect(mockLoggerDebug).toHaveBeenCalledWith('facet', {
        key: testKey,
        facetKey,
        facetParams,
      });
    });

    it('should not log result when facet fails', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};
      const testError = new Error('Facet failed');

      // Clear the mock first to ensure clean state
      mockLoggerDefault.mockClear();
      mockFacetMethod.mockRejectedValue(testError);

      try {
        await wrappedFacet(testKey, facetKey, facetParams);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Expected to throw
        expect(error).toBe(testError);
      }

      expect(mockLoggerDefault).not.toHaveBeenCalled();
    });

    it('should throw error when facet is not found in definition', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'nonExistentFacet';
      const facetParams = {};

      await expect(wrappedFacet(testKey, facetKey, facetParams)).rejects.toThrow(
        'Facet nonExistentFacet not found in definition for test-coordinate'
      );

      expect(mockFacetMethod).not.toHaveBeenCalled();
      expect(mockCoordinate.toString).toHaveBeenCalled();
    });

    it('should throw error when no facets are defined in definition', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};

      // Mock definition without facets
      const definitionWithoutFacets = {
        coordinate: mockCoordinate,
        options: {}
      } as unknown as Definition<TestItem, 'test', 'level1'>;

      const wrappedFacetWithoutFacets = wrapFacetOperation(mockOperations, definitionWithoutFacets, mockRegistry);

      await expect(wrappedFacetWithoutFacets(testKey, facetKey, facetParams)).rejects.toThrow(
        'Facet testFacet not found in definition for test-coordinate'
      );

      expect(mockCoordinate.toString).toHaveBeenCalled();
    });

    it('should throw error when definition has null options', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};

      // Mock definition with null options
      const definitionWithNullOptions = {
        coordinate: mockCoordinate,
        options: null
      } as any as Definition<TestItem, 'test', 'level1'>;

      const wrappedFacetWithNullOptions = wrapFacetOperation(mockOperations, definitionWithNullOptions, mockRegistry);

      await expect(wrappedFacetWithNullOptions(testKey, facetKey, facetParams)).rejects.toThrow(
        'Facet testFacet not found in definition for test-coordinate'
      );

      expect(mockCoordinate.toString).toHaveBeenCalled();
    });

    it('should throw error when definition has undefined options', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};

      // Mock definition with undefined options
      const definitionWithUndefinedOptions = {
        coordinate: mockCoordinate,
        options: void 0
      } as any as Definition<TestItem, 'test', 'level1'>;

      const wrappedFacetWithUndefinedOptions = wrapFacetOperation(
        mockOperations,
        definitionWithUndefinedOptions,
        mockRegistry
      );

      await expect(wrappedFacetWithUndefinedOptions(testKey, facetKey, facetParams)).rejects.toThrow(
        'Facet testFacet not found in definition for test-coordinate'
      );

      expect(mockCoordinate.toString).toHaveBeenCalled();
    });

    it('should handle empty facetParams object', async () => {
      const facetResult = { defaultResult: true };
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};

      mockFacetMethod.mockResolvedValue(facetResult);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockFacetMethod).toHaveBeenCalledWith(testKey, facetParams);
      expect(result).toBe(facetResult);
      expect(mockLoggerDebug).toHaveBeenCalledWith('facet', {
        key: testKey,
        facetKey,
        facetParams: {},
      });
    });

    it('should handle facet methods that return arrays', async () => {
      const facetResult = [
        { id: 1, name: 'item1' },
        { id: 2, name: 'item2' },
        { id: 3, name: 'item3' }
      ];
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = { filter: 'active' };

      mockFacetMethod.mockResolvedValue(facetResult);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(result).toBe(facetResult);
      expect(mockLoggerDefault).toHaveBeenCalledWith('facet result: %j', {
        facetResult,
      });
    });
  });
});
