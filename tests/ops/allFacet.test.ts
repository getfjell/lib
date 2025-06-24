import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { Item, LocKey, LocKeyArray } from '@fjell/core';

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

import { wrapAllFacetOperation } from '@/ops/allFacet';
import { Definition } from '@/Definition';
import { Operations } from '@/Operations';
import { Registry } from '@/Registry';
import LibLogger from '@/logger';

// Type definitions for test data
interface TestItem extends Item<'test', 'level1', 'level2'> {
  id: string;
  name: string;
}

describe('wrapAllFacetOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'level1', 'level2'>;
  let mockDefinition: Definition<TestItem, 'test', 'level1', 'level2'>;
  let mockRegistry: Registry;
  let mockFacetMethod: MockedFunction<any>;

  beforeEach(() => {
    // Reset mocks
    mockLoggerDebug.mockClear();
    mockLoggerDefault.mockClear();

    // Create mock facet method
    mockFacetMethod = vi.fn();

    // Mock the operations object
    mockOperations = {
      all: vi.fn(),
    } as any;

    // Mock definition with allFacets
    mockDefinition = {
      coordinate: {} as any,
      options: {
        allFacets: {
          testFacet: mockFacetMethod,
          complexFacet: mockFacetMethod,
        }
      }
    } as Definition<TestItem, 'test', 'level1', 'level2'>;

    mockRegistry = {} as Registry;
  });

  describe('wrapAllFacetOperation', () => {
    it('should return a function when called', () => {
      const result = wrapAllFacetOperation(mockOperations, mockDefinition, mockRegistry);

      expect(typeof result).toBe('function');
    });

    it('should call LibLogger.get with correct parameters', () => {
      wrapAllFacetOperation(mockOperations, mockDefinition, mockRegistry);

      expect(LibLogger.get).toHaveBeenCalledWith('library', 'ops', 'allFacet');
    });
  });

  describe('wrapped allFacet function', () => {
    let wrappedAllFacet: ReturnType<typeof wrapAllFacetOperation<TestItem, 'test', 'level1', 'level2'>>;

    beforeEach(() => {
      wrappedAllFacet = wrapAllFacetOperation(mockOperations, mockDefinition, mockRegistry);
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

      // eslint-disable-next-line no-undefined
      expect(mockFacetMethod).toHaveBeenCalledWith(facetParams, undefined);
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

      expect(mockLoggerDebug).toHaveBeenCalledWith('allFacet', {
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

      // eslint-disable-next-line no-undefined
      expect(mockFacetMethod).toHaveBeenCalledWith(facetParams, undefined);
      expect(result).toBe(expectedResult);
      expect(mockLoggerDebug).toHaveBeenCalledWith('allFacet', {
        allFacetKey: facetKey,
        allFacetParams: facetParams,
        // eslint-disable-next-line no-undefined
        locations: undefined,
      });
    });

    it('should propagate errors from the facet method', async () => {
      const facetKey = 'testFacet';
      const facetParams = {};
      const testError = new Error('Facet operation failed');

      mockFacetMethod.mockRejectedValue(testError);

      await expect(wrappedAllFacet(facetKey, facetParams)).rejects.toThrow('Facet operation failed');
      // eslint-disable-next-line no-undefined
      expect(mockFacetMethod).toHaveBeenCalledWith(facetParams, undefined);
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

      expect(mockLoggerDebug).toHaveBeenCalledWith('allFacet', {
        allFacetKey: facetKey,
        allFacetParams: facetParams,
        // eslint-disable-next-line no-undefined
        locations: undefined,
      });
    });

    it('should throw error when facet is not found in definition', async () => {
      const facetKey = 'nonExistentFacet';
      const facetParams = {};

      await expect(wrappedAllFacet(facetKey, facetParams)).rejects.toThrow(
        'AllFacet nonExistentFacet not found in definition'
      );

      expect(mockFacetMethod).not.toHaveBeenCalled();
    });

    it('should throw error when no allFacets are defined in definition', async () => {
      const facetKey = 'testFacet';
      const facetParams = {};

      // Mock definition without allFacets
      const definitionWithoutFacets = {
        coordinate: {} as any,
        options: {}
      } as Definition<TestItem, 'test', 'level1', 'level2'>;

      const wrappedAllFacetWithoutFacets = wrapAllFacetOperation(
        mockOperations, definitionWithoutFacets, mockRegistry
      );

      await expect(wrappedAllFacetWithoutFacets(facetKey, facetParams)).rejects.toThrow(
        'AllFacet testFacet not found in definition'
      );

      expect(mockFacetMethod).not.toHaveBeenCalled();
    });

    it('should throw error when options are undefined in definition', async () => {
      const facetKey = 'testFacet';
      const facetParams = {};

      // Mock definition without options
      const definitionWithoutOptions = {
        coordinate: {} as any,
      } as Definition<TestItem, 'test', 'level1', 'level2'>;

      const wrappedAllFacetWithoutOptions = wrapAllFacetOperation(
        mockOperations, definitionWithoutOptions, mockRegistry
      );

      await expect(wrappedAllFacetWithoutOptions(facetKey, facetParams)).rejects.toThrow(
        'AllFacet testFacet not found in definition'
      );

      expect(mockFacetMethod).not.toHaveBeenCalled();
    });

    it('should handle return value of any type', async () => {
      const facetKey = 'testFacet';
      const facetParams = {};

      // Test different return types
      const testCases = [
        null,
        // eslint-disable-next-line no-undefined
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

        // eslint-disable-next-line no-undefined
        expect(mockFacetMethod).toHaveBeenCalledWith(facetParams, undefined);
        expect(result).toBe(expectedResult);
      }
    });
  });
});
