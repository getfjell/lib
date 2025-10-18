import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { Item, LocKey, LocKeyArray } from '@fjell/core';

// Create mock logger functions that can be accessed by tests
const mockLoggerDebug = vi.hoisted(() => vi.fn());
const mockLoggerDefault = vi.hoisted(() => vi.fn());
const mockLoggerGet = vi.hoisted(() => vi.fn());

// Mock the logger
vi.mock('../../src/logger', () => ({
  default: {
    get: mockLoggerGet.mockReturnValue({
      debug: mockLoggerDebug,
      default: mockLoggerDefault,
    }),
  },
}));

import { wrapAllFacetOperation } from '../../src/ops/allFacet';
import { Options } from '../../src/Options';
import { Operations } from '../../src/Operations';
import { Registry } from '../../src/Registry';
import { createCoordinate } from '@fjell/core';
import { createOptions } from '../../src/Options';

// Type definitions for test data
interface TestItem extends Item<'test', 'level1', 'level2'> {
  id: string;
  name: string;
}

describe('wrapAllFacetOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'level1', 'level2'>;
  let mockOptions: Options<TestItem, 'test', 'level1', 'level2'>;
  let mockCoordinate: any;
  let mockRegistry: Registry;
  let mockFacetMethod: MockedFunction<any>;

  beforeEach(() => {
    // Reset only specific mocks, not the logger get mock since it's called at module load time
    mockLoggerDebug.mockClear();
    mockLoggerDefault.mockClear();

    // Create mock all facet method
    mockFacetMethod = vi.fn();

    // Mock the operations object
    mockOperations = {
      all: vi.fn(),
    } as any;

    // Mock options with allFacets
    mockOptions = createOptions<TestItem, 'test', 'level1', 'level2'>({
      allFacets: {
        testFacet: mockFacetMethod,
        complexFacet: mockFacetMethod,
      }
    });

    mockCoordinate = createCoordinate(['test', 'level1', 'level2'], ['scope1']);
    mockRegistry = {} as Registry;
  });

  describe('wrapAllFacetOperation', () => {
    it('should return a function when called', () => {
      const result = wrapAllFacetOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);

      expect(typeof result).toBe('function');
    });

    it('should call LibLogger.get with correct parameters', () => {
      wrapAllFacetOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);

      expect(mockLoggerGet).toHaveBeenCalledWith('library', 'ops', 'allFacet');
    });
  });

  describe('wrapped allFacet function', () => {
    let wrappedAllFacet: ReturnType<typeof wrapAllFacetOperation<TestItem, 'test', 'level1', 'level2'>>;

    beforeEach(() => {
      wrappedAllFacet = wrapAllFacetOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);
    });

    it('should call facet method with correct parameters and return result', async () => {
      const facetKey = 'testFacet';
      const facetParams = { param1: 'value1', param2: 42, param3: true };
      const locations: LocKeyArray<'level1', 'level2'> = [
        { kt: 'level1', lk: 'level1-id' } as LocKey<'level1'>,
        { kt: 'level2', lk: 'level2-id' } as LocKey<'level2'>
      ];
      const expectedResult = { data: 'facet result' };

      mockFacetMethod.mockResolvedValue(expectedResult);

      const result = await wrappedAllFacet(facetKey, facetParams, locations);

      expect(mockFacetMethod).toHaveBeenCalledWith(facetParams, locations);
      expect(result).toBe(expectedResult);
    });

    it('should work without locations parameter', async () => {
      const facetKey = 'testFacet';
      const facetParams = { param1: 'value1' };
      const expectedResult = { data: 'facet result without locations' };

      mockFacetMethod.mockResolvedValue(expectedResult);

      const result = await wrappedAllFacet(facetKey, facetParams);
       
      expect(mockFacetMethod).toHaveBeenCalledWith(facetParams, []);
      expect(result).toBe(expectedResult);
    });

    it('should work with empty locations array', async () => {
      const facetKey = 'testFacet';
      const facetParams = { param1: 'value1' };
      const locations: LocKeyArray<'level1', 'level2'> | [] = [];
      const expectedResult = { data: 'facet result with empty locations' };

      mockFacetMethod.mockResolvedValue(expectedResult);

      const result = await wrappedAllFacet(facetKey, facetParams, locations);

      expect(mockFacetMethod).toHaveBeenCalledWith(facetParams, locations);
      expect(result).toBe(expectedResult);
    });

    it('should log debug information before calling facet', async () => {
      const facetKey = 'testFacet';
      const facetParams = { param1: 'value1', param2: 42 };
      const locations: LocKeyArray<'level1', 'level2'> = [
        { kt: 'level1', lk: 'level1-id' } as LocKey<'level1'>,
        { kt: 'level2', lk: 'level2-id' } as LocKey<'level2'>
      ];

      mockFacetMethod.mockResolvedValue({});

      await wrappedAllFacet(facetKey, facetParams, locations);

      expect(mockLoggerDebug).toHaveBeenCalledWith('AllFacet operation started', {
        allFacetKey: facetKey,
        allFacetParams: facetParams,
        locations: locations,
      });
    });

    it('should handle complex facet parameters including arrays and dates', async () => {
      const facetKey = 'complexFacet';
      const testDate = new Date('2023-01-01');
      const facetParams = {
        stringParam: 'test',
        numberParam: 123,
        booleanParam: true,
        dateParam: testDate,
        arrayParam: ['item1', 'item2', 123, true],
      };
      const expectedResult = { complex: 'processing completed' };

      mockFacetMethod.mockResolvedValue(expectedResult);

      const result = await wrappedAllFacet(facetKey, facetParams);
       
      expect(mockFacetMethod).toHaveBeenCalledWith(facetParams, []);
      expect(result).toBe(expectedResult);
      expect(mockLoggerDebug).toHaveBeenCalledWith('AllFacet operation started', {
        allFacetKey: facetKey,
        allFacetParams: facetParams,
        locations: [],
      });
    });

    it('should propagate errors from the facet method', async () => {
      const facetKey = 'testFacet';
      const facetParams = {};
      const testError = new Error('Facet operation failed');

      mockFacetMethod.mockRejectedValue(testError);

      await expect(wrappedAllFacet(facetKey, facetParams)).rejects.toThrow('Facet operation failed');
       
      expect(mockFacetMethod).toHaveBeenCalledWith(facetParams, []);
    });

    it('should still log debug information even when facet fails', async () => {
      const facetKey = 'testFacet';
      const facetParams = { param1: 'value1' };
      const testError = new Error('Facet failed');

      mockFacetMethod.mockRejectedValue(testError);

      try {
        await wrappedAllFacet(facetKey, facetParams);
      } catch {
        // Expected to throw
      }

      expect(mockLoggerDebug).toHaveBeenCalledWith('AllFacet operation started', {
        allFacetKey: facetKey,
        allFacetParams: facetParams,
        locations: [],
      });
    });

    it('should throw error when allFacet is not found in definition', async () => {
      const facetKey = 'testFacet';
      const facetParams = {};

      // Mock options without allFacets
      const optionsWithoutFacets = createOptions<TestItem, 'test', 'level1', 'level2'>({});

      const wrappedAllFacetWithoutFacets = wrapAllFacetOperation(
        mockOperations, optionsWithoutFacets, mockCoordinate, mockRegistry
      );

      await expect(wrappedAllFacetWithoutFacets(facetKey, facetParams)).rejects.toThrow(
        'AllFacet "testFacet" not found'
      );

      expect(mockFacetMethod).not.toHaveBeenCalled();
    });

    it('should throw error when options are undefined in definition', async () => {
      const facetKey = 'testFacet';
      const facetParams = {};

      // Mock options without allFacets
      const optionsWithoutAllFacets = createOptions<TestItem, 'test', 'level1', 'level2'>({});

      const wrappedAllFacetWithoutOptions = wrapAllFacetOperation(
        mockOperations, optionsWithoutAllFacets, mockCoordinate, mockRegistry
      );

      await expect(wrappedAllFacetWithoutOptions(facetKey, facetParams)).rejects.toThrow(
        'AllFacet "testFacet" not found'
      );

      expect(mockFacetMethod).not.toHaveBeenCalled();
    });

    it('should handle return value of any type', async () => {
      const facetKey = 'testFacet';
      const facetParams = {};

      // Test different return types
      const testCases = [
        null,
         
        undefined,
        'string result',
        42,
        true,
        { complex: 'object' },
        ['array', 'result'],
      ];

      for (const expectedResult of testCases) {
        mockFacetMethod.mockClear();
        mockFacetMethod.mockResolvedValue(expectedResult);

        const result = await wrappedAllFacet(facetKey, facetParams);
         
        expect(mockFacetMethod).toHaveBeenCalledWith(facetParams, []);
        expect(result).toBe(expectedResult);
      }
    });
  });
});
