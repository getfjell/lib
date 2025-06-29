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

    // Mock the operations object - this is what will be called, not the facet methods directly
    mockOperations = {
      facet: vi.fn(),
      get: vi.fn(),
    } as any;

    // Mock definition with facets
    mockDefinition = {
      coordinate: mockCoordinate,
      options: {
        facets: {
          testFacet: mockFacetMethod,
          complexFacet: mockFacetMethod,
        },
      },
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

    it('should forward calls to wrapped operations facet method with correct parameters', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const facetResult = { data: 'test facet result', count: 42 };
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = { param1: 'value1', param2: 42, param3: true };

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockResolvedValue(facetResult);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
      expect(mockFacetMethod).toHaveBeenCalledWith(testItem, facetParams);
      expect(result).toBe(facetResult);
    });

    it('should work with ComKey as well as PriKey', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const facetResult = { data: 'composite key result' };
      const testKey: ComKey<'test', 'level1'> = 'composite-key' as unknown as ComKey<'test', 'level1'>;
      const facetKey = 'testFacet';
      const facetParams = { param1: 'value1' };

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockResolvedValue(facetResult);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
      expect(mockFacetMethod).toHaveBeenCalledWith(testItem, facetParams);
      expect(result).toBe(facetResult);
    });

    it('should log debug information before calling facet', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const facetResult = { data: 'test' };
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = { param1: 'value1', param2: 42 };

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockResolvedValue(facetResult);

      await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockLoggerDebug).toHaveBeenCalledWith(
        'facet for item key: %j, facet key: %s, params: %j',
        testKey,
        facetKey,
        facetParams
      );
    });

    it('should return the facet result after successful execution', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const facetResult = { data: 'test facet result', metrics: { count: 10, success: true } };
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockResolvedValue(facetResult);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
      expect(mockFacetMethod).toHaveBeenCalledWith(testItem, facetParams);
      expect(result).toBe(facetResult);
    });

    it('should handle complex facet parameters including arrays and dates', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
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

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockResolvedValue(facetResult);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
      expect(mockFacetMethod).toHaveBeenCalledWith(testItem, facetParams);
      expect(result).toBe(facetResult);
      expect(mockLoggerDebug).toHaveBeenCalledWith(
        'facet for item key: %j, facet key: %s, params: %j',
        testKey,
        facetKey,
        facetParams
      );
    });

    it('should handle facet methods that return different types', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const primitiveResult = 'simple string result';
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockResolvedValue(primitiveResult);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
      expect(mockFacetMethod).toHaveBeenCalledWith(testItem, facetParams);
      expect(result).toBe(primitiveResult);
    });

    it('should handle facet methods that return null or undefined', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockResolvedValue(null);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
      expect(mockFacetMethod).toHaveBeenCalledWith(testItem, facetParams);
      expect(result).toBe(null);
    });

    it('should propagate errors from the wrapped facet operation', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};
      const testError = new Error('Facet execution failed');

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockRejectedValue(testError);

      await expect(wrappedFacet(testKey, facetKey, facetParams)).rejects.toThrow('Facet execution failed');
      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
    });

    it('should still log debug information even when facet fails', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = { param1: 'value1' };
      const testError = new Error('Facet failed');

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockRejectedValue(testError);

      try {
        await wrappedFacet(testKey, facetKey, facetParams);
      } catch {
        // Expected to throw
      }

      expect(mockLoggerDebug).toHaveBeenCalledWith(
        'facet for item key: %j, facet key: %s, params: %j',
        testKey,
        facetKey,
        facetParams
      );
    });

    it('should propagate errors when facet method fails', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};
      const testError = new Error('Facet failed');

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockRejectedValue(testError);

      await expect(wrappedFacet(testKey, facetKey, facetParams)).rejects.toThrow('Facet failed');
      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
    });

    it('should throw error when facet is not found in definition', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'nonExistentFacet';
      const facetParams = {};

      await expect(wrappedFacet(testKey, facetKey, facetParams)).rejects.toThrow(
        'Facet nonExistentFacet not found in definition for test-coordinate'
      );

      expect(mockOperations.facet).not.toHaveBeenCalled();
      expect(mockCoordinate.toString).toHaveBeenCalled();
    });

    it('should throw error when no facets are defined in definition', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};

      // Mock definition without facets
      const definitionWithoutFacets = {
        coordinate: mockCoordinate,
        options: {},
      } as unknown as Definition<TestItem, 'test', 'level1'>;

      const wrappedFacetWithoutFacets = wrapFacetOperation(mockOperations, definitionWithoutFacets, mockRegistry);

      await expect(wrappedFacetWithoutFacets(testKey, facetKey, facetParams)).rejects.toThrow(
        'Facet testFacet not found in definition for test-coordinate'
      );

      expect(mockCoordinate.toString).toHaveBeenCalled();
      expect(mockOperations.facet).not.toHaveBeenCalled();
    });

    it('should throw error when definition has null options', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};

      // Mock definition with null options
      const definitionWithNullOptions = {
        coordinate: mockCoordinate,
        options: null,
      } as any as Definition<TestItem, 'test', 'level1'>;

      const wrappedFacetWithNullOptions = wrapFacetOperation(mockOperations, definitionWithNullOptions, mockRegistry);

      await expect(wrappedFacetWithNullOptions(testKey, facetKey, facetParams)).rejects.toThrow(
        'Facet testFacet not found in definition for test-coordinate'
      );

      expect(mockCoordinate.toString).toHaveBeenCalled();
      expect(mockOperations.facet).not.toHaveBeenCalled();
    });

    it('should throw error when definition has undefined options', async () => {
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};

      // Mock definition with undefined options
      const definitionWithUndefinedOptions = {
        coordinate: mockCoordinate,
        options: void 0,
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
      expect(mockOperations.facet).not.toHaveBeenCalled();
    });

    it('should handle empty facetParams object', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const facetResult = { defaultResult: true };
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = {};

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockResolvedValue(facetResult);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
      expect(mockFacetMethod).toHaveBeenCalledWith(testItem, facetParams);
      expect(result).toBe(facetResult);
      expect(mockLoggerDebug).toHaveBeenCalledWith(
        'facet for item key: %j, facet key: %s, params: %j',
        testKey,
        facetKey,
        facetParams
      );
    });

    it('should handle facet methods that return arrays', async () => {
      const testItem: TestItem = { id: '1', name: 'test item' } as TestItem;
      const facetResult = [
        { id: 1, name: 'item1' },
        { id: 2, name: 'item2' },
        { id: 3, name: 'item3' },
      ];
      const testKey: PriKey<'test'> = 'primary-key' as unknown as PriKey<'test'>;
      const facetKey = 'testFacet';
      const facetParams = { filter: 'active' };

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockResolvedValue(facetResult);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
      expect(mockFacetMethod).toHaveBeenCalledWith(testItem, facetParams);
      expect(result).toBe(facetResult);
    });
  });
});
