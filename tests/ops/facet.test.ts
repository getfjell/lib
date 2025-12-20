import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { ComKey, Item } from '@fjell/types';

// Create mock logger functions that can be accessed by tests
const mockLoggerDebug = vi.hoisted(() => vi.fn());
const mockLoggerDefault = vi.hoisted(() => vi.fn());
const mockLoggerError = vi.hoisted(() => vi.fn());
const mockLoggerGet = vi.hoisted(() => vi.fn());

// Mock the logger
vi.mock('../../src/logger', () => ({
  default: {
    get: mockLoggerGet.mockReturnValue({
      debug: mockLoggerDebug,
      default: mockLoggerDefault,
      error: mockLoggerError,
    }),
  },
}));

import { wrapFacetOperation } from '../../src/ops/facet';
import { Options } from '../../src/Options';
import { Operations } from '../../src/Operations';
import { Registry } from '../../src/Registry';
import { createCoordinate } from '@fjell/core';
import { createOptions } from '../../src/Options';

// Type definitions for test data
interface TestItem extends Item<'test', 'level1'> {
  id: string;
  name: string;
}

describe('wrapFacetOperation', () => {
  let mockOperations: Operations<TestItem, 'test', 'level1'>;
  let mockOptions: Options<TestItem, 'test', 'level1'>;
  let mockCoordinate: any;
  let mockRegistry: Registry;
  let mockFacetMethod: MockedFunction<any>;

  beforeEach(() => {
    // Reset only specific mocks, not the logger get mock since it's called at module load time
    mockLoggerDebug.mockClear();
    mockLoggerDefault.mockClear();
    mockLoggerError.mockClear();

    // Create mock facet method
    mockFacetMethod = vi.fn();

    // Mock the operations object
    mockOperations = {
      facet: vi.fn(),
      get: vi.fn(),
    } as any;

    // Mock options with facets
    mockOptions = createOptions<TestItem, 'test', 'level1'>({
      facets: {
        testFacet: mockFacetMethod,
        complexFacet: mockFacetMethod,
      }
    });

    mockCoordinate = createCoordinate(['test', 'level1']);
    // Mock the toString method to make it a spy for testing
    mockCoordinate.toString = vi.fn().mockReturnValue('test, level1 - ');
    mockRegistry = {} as Registry;
  });

  describe('wrapFacetOperation', () => {
    it('should return a function when called', () => {
      const result = wrapFacetOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);

      expect(typeof result).toBe('function');
    });

    it('should call LibLogger.get with correct parameters', () => {
      wrapFacetOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);

      expect(mockLoggerGet).toHaveBeenCalledWith('library', 'ops', 'facet');
    });
  });

  describe('wrapped facet function', () => {
    let wrappedFacet: ReturnType<typeof wrapFacetOperation<TestItem, 'test', 'level1'>>;

    beforeEach(() => {
      wrappedFacet = wrapFacetOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);
    });

    it('should forward calls to wrapped operations facet method with correct parameters', async () => {
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const testItem: TestItem = { id: '1', name: 'test item', key: testKey } as TestItem;
      const facetResult = { data: 'test facet result', count: 42 };
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
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id-2',
        loc: [{ kt: 'level1', lk: 'location2' }]
      };
      const testItem: TestItem = { id: '1', name: 'test item', key: testKey } as TestItem;
      const facetResult = { data: 'composite key result' };
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
      const testItem: TestItem = { id: '1', name: 'test item', key: { kt: 'test', pk: 'test-id', loc: [{ kt: 'level1', lk: 'location1' }] } } as TestItem;
      const facetResult = { data: 'test' };
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const facetKey = 'testFacet';
      const facetParams = { param1: 'value1', param2: 42 };

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockResolvedValue(facetResult);

      await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockLoggerDebug).toHaveBeenCalledWith(
        'Facet operation started',
        expect.objectContaining({
          key: testKey,
          facetKey,
          facetParams
        })
      );
    });

    it('should return the facet result after successful execution', async () => {
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const testItem: TestItem = { id: '1', name: 'test item', key: testKey } as TestItem;
      const facetResult = { data: 'test facet result', metrics: { count: 10, success: true } };
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
      const testItem: TestItem = { id: '1', name: 'test item', key: { kt: 'test', pk: 'test-id', loc: [{ kt: 'level1', lk: 'location1' }] } } as TestItem;
      const facetResult = { processedData: 'complex result' };
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
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
        'Facet operation started',
        expect.objectContaining({
          key: testKey,
          facetKey,
          facetParams
        })
      );
    });

    it('should handle facet methods that return different types', async () => {
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const testItem: TestItem = { id: '1', name: 'test item', key: testKey } as TestItem;
      const primitiveResult = 'simple string result';
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
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const testItem: TestItem = { id: '1', name: 'test item', key: testKey } as TestItem;
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
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const testItem: TestItem = { id: '1', name: 'test item', key: testKey } as TestItem;
      const facetKey = 'testFacet';
      const facetParams = {};
      const testError = new Error('Facet execution failed');

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockRejectedValue(testError);

      await expect(wrappedFacet(testKey, facetKey, facetParams)).rejects.toThrow('Facet execution failed');
      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
    });

    it('should still log debug information even when facet fails', async () => {
      const testItem: TestItem = { id: '1', name: 'test item', key: { kt: 'test', pk: 'test-id', loc: [{ kt: 'level1', lk: 'location1' }] } } as TestItem;
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
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
        'Facet operation started',
        expect.objectContaining({
          key: testKey,
          facetKey,
          facetParams
        })
      );
    });

    it('should propagate errors when facet method fails', async () => {
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const testItem: TestItem = { id: '1', name: 'test item', key: testKey } as TestItem;
      const facetKey = 'testFacet';
      const facetParams = {};
      const testError = new Error('Facet failed');

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockRejectedValue(testError);

      await expect(wrappedFacet(testKey, facetKey, facetParams)).rejects.toThrow('Facet failed');
      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
    });

    it('should throw error when facet is not found in definition', async () => {
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const facetKey = 'nonExistentFacet';
      const facetParams = {};

      await expect(wrappedFacet(testKey, facetKey, facetParams)).rejects.toThrow(
        'Facet "nonExistentFacet" not found'
      );

      expect(mockOperations.facet).not.toHaveBeenCalled();
    });

    it('should throw error when no facets are defined in definition', async () => {
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const facetKey = 'testFacet';
      const facetParams = {};

      // Mock options without facets
      const optionsWithoutFacets = createOptions<TestItem, 'test', 'level1'>({});

      const wrappedFacetWithoutFacets = wrapFacetOperation(mockOperations, optionsWithoutFacets, mockCoordinate, mockRegistry);

      await expect(wrappedFacetWithoutFacets(testKey, facetKey, facetParams)).rejects.toThrow(
        'Facet "testFacet" not found'
      );

      expect(mockOperations.facet).not.toHaveBeenCalled();
    });

    it('should throw error when definition has null options', async () => {
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const facetKey = 'testFacet';
      const facetParams = {};

      // Mock options with null (empty) facets
      const optionsWithNullFacets = createOptions<TestItem, 'test', 'level1'>({});

      const wrappedFacetWithNullOptions = wrapFacetOperation(mockOperations, optionsWithNullFacets, mockCoordinate, mockRegistry);

      await expect(wrappedFacetWithNullOptions(testKey, facetKey, facetParams)).rejects.toThrow(
        'Facet "testFacet" not found'
      );

      expect(mockOperations.facet).not.toHaveBeenCalled();
    });

    it('should throw error when definition has undefined options', async () => {
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const facetKey = 'testFacet';
      const facetParams = {};

      // Mock options without facets
      const optionsWithoutFacets = createOptions<TestItem, 'test', 'level1'>({});

      const wrappedFacetWithUndefinedOptions = wrapFacetOperation(
        mockOperations,
        optionsWithoutFacets,
        mockCoordinate,
        mockRegistry
      );

      await expect(wrappedFacetWithUndefinedOptions(testKey, facetKey, facetParams)).rejects.toThrow(
        'Facet "testFacet" not found'
      );

      expect(mockOperations.facet).not.toHaveBeenCalled();
    });

    it('should handle empty facetParams object', async () => {
      const testItem: TestItem = { id: '1', name: 'test item', key: { kt: 'test', pk: 'test-id', loc: [{ kt: 'level1', lk: 'location1' }] } } as TestItem;
      const facetResult = { defaultResult: true };
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const facetKey = 'testFacet';
      const facetParams = {};

      (mockOperations.get as MockedFunction<any>).mockResolvedValue(testItem);
      mockFacetMethod.mockResolvedValue(facetResult);

      const result = await wrappedFacet(testKey, facetKey, facetParams);

      expect(mockOperations.get).toHaveBeenCalledWith(testKey);
      expect(mockFacetMethod).toHaveBeenCalledWith(testItem, facetParams);
      expect(result).toBe(facetResult);
      expect(mockLoggerDebug).toHaveBeenCalledWith(
        'Facet operation started',
        expect.objectContaining({
          key: testKey,
          facetKey,
          facetParams
        })
      );
    });

    it('should handle facet methods that return arrays', async () => {
      const testKey: ComKey<'test', 'level1'> = {
        kt: 'test',
        pk: 'test-id',
        loc: [{ kt: 'level1', lk: 'location1' }]
      };
      const testItem: TestItem = { id: '1', name: 'test item', key: testKey } as TestItem;
      const facetResult = [
        { id: 1, name: 'item1' },
        { id: 2, name: 'item2' },
        { id: 3, name: 'item3' },
      ];
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
