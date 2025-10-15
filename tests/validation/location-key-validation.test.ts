/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expect, it } from 'vitest';
import { createCoordinate } from '@fjell/registry';
import { createOptions, wrapOperations } from '../../src';
import { Item, LocKey, LocKeyArray } from '@fjell/core';

interface TestItem extends Item<'test', 'level1', 'level2'> {
  name: string;
}

describe('Location Key Validation', () => {
  describe('validateLocations', () => {
    it('should accept location keys in correct order', async () => {
      const coordinate = createCoordinate(['test', 'level1', 'level2'], ['scope1']);
      const options = createOptions<TestItem, 'test', 'level1', 'level2'>();
      
      const mockOperations = {
        all: async () => [],
        one: async () => null,
        find: async () => [],
        findOne: async () => null,
        create: async (item: any) => item,
        update: async (key: any, item: any) => item,
        upsert: async (key: any, item: any) => item,
        get: async (key: any) => ({} as any),
        remove: async (key: any) => ({} as any),
        action: async (key: any, action: string, params: any) => [{} as any, []],
        facet: async (key: any, facet: string, params: any) => ({}),
        allAction: async (action: string, params: any, locations?: any) => [[], []],
        allFacet: async (facet: string, params: any, locations?: any) => ({}),
        finders: {},
        actions: {},
        facets: {},
        allActions: {},
        allFacets: {},
      } as any;
      
      const registry = { type: 'lib' as const } as any;
      const operations = wrapOperations(mockOperations, options, coordinate, registry);
      
      // Correct order: level1, level2
      const locations: LocKeyArray<'level1', 'level2'> = [
        { kt: 'level1', lk: 'id1' } as LocKey<'level1'>,
        { kt: 'level2', lk: 'id2' } as LocKey<'level2'>
      ];
      
      // Should not throw
      await expect(operations.all({}, locations)).resolves.toBeDefined();
    });
    
    it('should reject location keys in wrong order', async () => {
      const coordinate = createCoordinate(['test', 'level1', 'level2'], ['scope1']);
      const options = createOptions<TestItem, 'test', 'level1', 'level2'>();
      
      const mockOperations = {
        all: async () => [],
        one: async () => null,
        find: async () => [],
        findOne: async () => null,
        create: async (item: any) => item,
        update: async (key: any, item: any) => item,
        upsert: async (key: any, item: any) => item,
        get: async (key: any) => ({} as any),
        remove: async (key: any) => ({} as any),
        action: async (key: any, action: string, params: any) => [{} as any, []],
        facet: async (key: any, facet: string, params: any) => ({}),
        allAction: async (action: string, params: any, locations?: any) => [[], []],
        allFacet: async (facet: string, params: any, locations?: any) => ({}),
        finders: {},
        actions: {},
        facets: {},
        allActions: {},
        allFacets: {},
      } as any;
      
      const registry = { type: 'lib' as const } as any;
      const operations = wrapOperations(mockOperations, options, coordinate, registry);
      
      // Wrong order: level2 before level1
      const wrongLocations: any = [
        { kt: 'level2', lk: 'id2' },
        { kt: 'level1', lk: 'id1' }
      ];
      
      // Should throw an error
      await expect(operations.all({}, wrongLocations)).rejects.toThrow(
        /Invalid location key array order for all/
      );
      await expect(operations.all({}, wrongLocations)).rejects.toThrow(
        /expected key type "level1"/
      );
    });
    
    it('should reject too many location keys', async () => {
      const coordinate = createCoordinate(['test', 'level1'], ['scope1']);
      const options = createOptions<TestItem, 'test', 'level1'>();
      
      const mockOperations = {
        all: async () => [],
        one: async () => null,
        find: async () => [],
        findOne: async () => null,
        create: async (item: any) => item,
        update: async (key: any, item: any) => item,
        upsert: async (key: any, item: any) => item,
        get: async (key: any) => ({} as any),
        remove: async (key: any) => ({} as any),
        action: async (key: any, action: string, params: any) => [{} as any, []],
        facet: async (key: any, facet: string, params: any) => ({}),
        allAction: async (action: string, params: any, locations?: any) => [[], []],
        allFacet: async (facet: string, params: any, locations?: any) => ({}),
        finders: {},
        actions: {},
        facets: {},
        allActions: {},
        allFacets: {},
      } as any;
      
      const registry = { type: 'lib' as const } as any;
      const operations = wrapOperations(mockOperations, options, coordinate, registry);
      
      // Too many location keys
      const tooManyLocations: any = [
        { kt: 'level1', lk: 'id1' },
        { kt: 'level2', lk: 'id2' }
      ];
      
      // Should throw an error
      await expect(operations.all({}, tooManyLocations)).rejects.toThrow(
        /Expected at most 1 location keys/
      );
    });
    
    it('should allow empty location array', async () => {
      const coordinate = createCoordinate(['test', 'level1', 'level2'], ['scope1']);
      const options = createOptions<TestItem, 'test', 'level1', 'level2'>();
      
      const mockOperations = {
        all: async () => [],
        one: async () => null,
        find: async () => [],
        findOne: async () => null,
        create: async (item: any) => item,
        update: async (key: any, item: any) => item,
        upsert: async (key: any, item: any) => item,
        get: async (key: any) => ({} as any),
        remove: async (key: any) => ({} as any),
        action: async (key: any, action: string, params: any) => [{} as any, []],
        facet: async (key: any, facet: string, params: any) => ({}),
        allAction: async (action: string, params: any, locations?: any) => [[], []],
        allFacet: async (facet: string, params: any, locations?: any) => ({}),
        finders: {},
        actions: {},
        facets: {},
        allActions: {},
        allFacets: {},
      } as any;
      
      const registry = { type: 'lib' as const } as any;
      const operations = wrapOperations(mockOperations, options, coordinate, registry);
      
      // Empty array should be fine
      await expect(operations.all({}, [])).resolves.toBeDefined();
    });
    
    it('should validate locations in create operation', async () => {
      const coordinate = createCoordinate(['test', 'level1', 'level2'], ['scope1']);
      const options = createOptions<TestItem, 'test', 'level1', 'level2'>();
      
      const mockOperations = {
        all: async () => [],
        one: async () => null,
        find: async () => [],
        findOne: async () => null,
        create: async (item: any, opts: any) => item,
        update: async (key: any, item: any) => item,
        upsert: async (key: any, item: any) => item,
        get: async (key: any) => ({} as any),
        remove: async (key: any) => ({} as any),
        action: async (key: any, action: string, params: any) => [{} as any, []],
        facet: async (key: any, facet: string, params: any) => ({}),
        allAction: async (action: string, params: any, locations?: any) => [[], []],
        allFacet: async (facet: string, params: any, locations?: any) => ({}),
        finders: {},
        actions: {},
        facets: {},
        allActions: {},
        allFacets: {},
      } as any;
      
      const registry = { type: 'lib' as const } as any;
      const operations = wrapOperations(mockOperations, options, coordinate, registry);
      
      // Wrong order in locations option
      const wrongLocations: any = [
        { kt: 'level2', lk: 'id2' },
        { kt: 'level1', lk: 'id1' }
      ];
      
      // Should throw an error
      await expect(
        operations.create({ name: 'test' }, { locations: wrongLocations })
      ).rejects.toThrow(/Invalid location key array order for create/);
    });
  });
});

