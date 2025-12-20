import { beforeEach, describe, expect, it } from 'vitest';
import { ComKey, Item, PriKey } from '@fjell/types';
import { wrapImplementationOperations } from '../src/wrapImplementationOperations';
import { ImplementationOperations } from '../src/ImplementationOperations';
import { Options } from '../src/Options';

describe('wrapImplementationOperations', () => {
  interface TestItem extends Item<'test', 'level1'> {
    id: string;
    name: string;
  }

  let mockImplOps: ImplementationOperations<TestItem, 'test', 'level1'>;

  beforeEach(() => {
    mockImplOps = {
      async create(item: Partial<TestItem>) {
        return { ...item, id: 'test-1', kt: 'test', pk: 'test-1', events: [], key: { kt: 'test', pk: 'test-1' } } as unknown as TestItem;
      },
      async get(key: PriKey<'test'> | ComKey<'test', 'level1'>) {
        return { id: key.pk as string, kt: 'test', pk: key.pk, name: 'Test', events: [], key } as unknown as TestItem;
      },
      async update(key: PriKey<'test'> | ComKey<'test', 'level1'>, item: Partial<TestItem>) {
        return { ...item, id: key.pk as string, kt: 'test', pk: key.pk, events: [], key } as unknown as TestItem;
      },
      async remove(key: PriKey<'test'> | ComKey<'test', 'level1'>) {
        return { id: key.pk as string, kt: 'test', pk: key.pk, name: 'Removed', events: [], key } as unknown as TestItem;
      },
      async upsert(key: PriKey<'test'> | ComKey<'test', 'level1'>, item: Partial<TestItem>) {
        return { ...item, id: key.pk as string, kt: 'test', pk: key.pk, events: [], key } as unknown as TestItem;
      },
      async all() {
        return [{ id: 'test-1', kt: 'test', pk: 'test-1', name: 'Test 1', events: [], key: { kt: 'test', pk: 'test-1' } } as unknown as TestItem];
      },
      async one() {
        return { id: 'test-1', kt: 'test', pk: 'test-1', name: 'Test 1', events: [], key: { kt: 'test', pk: 'test-1' } } as unknown as TestItem;
      },
      async find() {
        return [{ id: 'test-1', kt: 'test', pk: 'test-1', name: 'Test 1', events: [], key: { kt: 'test', pk: 'test-1' } } as unknown as TestItem];
      },
      async findOne() {
        return { id: 'test-1', kt: 'test', pk: 'test-1', name: 'Test 1', events: [], key: { kt: 'test', pk: 'test-1' } } as unknown as TestItem;
      }
    };
  });

  describe('Core Operation Wrapping', () => {
    it('should wrap implementation operations with all core methods', async () => {
      const options: Options<TestItem, 'test', 'level1'> = {};
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.create).toBeDefined();
      expect(wrappedOps.get).toBeDefined();
      expect(wrappedOps.update).toBeDefined();
      expect(wrappedOps.remove).toBeDefined();
      expect(wrappedOps.upsert).toBeDefined();
      expect(wrappedOps.all).toBeDefined();
      expect(wrappedOps.one).toBeDefined();
      expect(wrappedOps.find).toBeDefined();
      expect(wrappedOps.findOne).toBeDefined();
    });

    it('should preserve core operation functionality', async () => {
      const options: Options<TestItem, 'test', 'level1'> = {};
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      const created = await wrappedOps.create({ name: 'New Test' });
      expect(created.name).toBe('New Test');

      const retrieved = await wrappedOps.get({ kt: 'test', pk: 'test-1' });
      expect(retrieved?.id).toBe('test-1');

      const all = await wrappedOps.all();
      expect(all).toHaveLength(1);
    });
  });

  describe('Extended Operation Stubs', () => {
    it('should add facet stub that returns null', async () => {
      const options: Options<TestItem, 'test', 'level1'> = {};
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.facet).toBeDefined();
      const result = await wrappedOps.facet({ kt: 'test', pk: 'test-1' }, 'test-facet', {});
      expect(result).toBeNull();
    });

    it('should add allFacet stub that returns null', async () => {
      const options: Options<TestItem, 'test', 'level1'> = {};
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.allFacet).toBeDefined();
      const result = await wrappedOps.allFacet({}, 'test-facet');
      expect(result).toBeNull();
    });

    it('should add action stub that returns empty result', async () => {
      const options: Options<TestItem, 'test', 'level1'> = {};
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.action).toBeDefined();
      const result = await wrappedOps.action({ kt: 'test', pk: 'test-1' }, 'test-action', {});
      expect(result[1]).toEqual([]);
    });

    it('should add allAction stub that returns empty arrays', async () => {
      const options: Options<TestItem, 'test', 'level1'> = {};
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.allAction).toBeDefined();
      const [items, affectedKeys] = await wrappedOps.allAction({}, 'test-action');
      expect(items).toEqual([]);
      expect(affectedKeys).toEqual([]);
    });
  });

  describe('Metadata Dictionaries', () => {
    it('should add empty finders dictionary when not provided', () => {
      const options: Options<TestItem, 'test', 'level1'> = {};
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.finders).toBeDefined();
      expect(wrappedOps.finders).toEqual({});
    });

    it('should add empty actions dictionary when not provided', () => {
      const options: Options<TestItem, 'test', 'level1'> = {};
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.actions).toBeDefined();
      expect(wrappedOps.actions).toEqual({});
    });

    it('should add empty facets dictionary when not provided', () => {
      const options: Options<TestItem, 'test', 'level1'> = {};
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.facets).toBeDefined();
      expect(wrappedOps.facets).toEqual({});
    });

    it('should add empty allActions dictionary when not provided', () => {
      const options: Options<TestItem, 'test', 'level1'> = {};
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.allActions).toBeDefined();
      expect(wrappedOps.allActions).toEqual({});
    });

    it('should add empty allFacets dictionary when not provided', () => {
      const options: Options<TestItem, 'test', 'level1'> = {};
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.allFacets).toBeDefined();
      expect(wrappedOps.allFacets).toEqual({});
    });
  });

  describe('Options Integration', () => {
    it('should include finders from options', () => {
      const mockFinder = async () => [];
      const options: Options<TestItem, 'test', 'level1'> = {
        finders: {
          findByName: mockFinder
        }
      };
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.finders.findByName).toBe(mockFinder);
    });

    it('should include actions from options', () => {
      const mockAction = async (): Promise<[TestItem, never[]]> => [{} as TestItem, []];
      const options: Options<TestItem, 'test', 'level1'> = {
        actions: {
          activate: mockAction
        }
      };
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.actions.activate).toBe(mockAction);
    });

    it('should include facets from options', () => {
      const mockFacet = async () => ({ count: 5 });
      const options: Options<TestItem, 'test', 'level1'> = {
        facets: {
          stats: mockFacet
        }
      };
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.facets.stats).toBe(mockFacet);
    });

    it('should include allActions from options', () => {
      const mockAllAction = async (): Promise<[TestItem[], never[]]> => [[], []];
      const options: Options<TestItem, 'test', 'level1'> = {
        allActions: {
          bulkActivate: mockAllAction
        }
      };
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.allActions.bulkActivate).toBe(mockAllAction);
    });

    it('should include allFacets from options', () => {
      const mockAllFacet = async () => ({ total: 10 });
      const options: Options<TestItem, 'test', 'level1'> = {
        allFacets: {
          aggregates: mockAllFacet
        }
      };
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(wrappedOps.allFacets.aggregates).toBe(mockAllFacet);
    });

    it('should handle multiple finders, actions, and facets', () => {
      const options: Options<TestItem, 'test', 'level1'> = {
        finders: {
          findByName: async () => [],
          findByStatus: async () => []
        },
        actions: {
          activate: async (): Promise<[TestItem, never[]]> => [{} as TestItem, []],
          deactivate: async (): Promise<[TestItem, never[]]> => [{} as TestItem, []]
        },
        facets: {
          stats: async () => ({}),
          metrics: async () => ({})
        }
      };
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      expect(Object.keys(wrappedOps.finders)).toHaveLength(2);
      expect(Object.keys(wrappedOps.actions)).toHaveLength(2);
      expect(Object.keys(wrappedOps.facets)).toHaveLength(2);
    });
  });

  describe('Complete Operations Interface', () => {
    it('should return an object that satisfies the Operations interface', () => {
      const options: Options<TestItem, 'test', 'level1'> = {
        finders: { test: async () => [] },
        actions: { test: async (): Promise<[TestItem, never[]]> => [{} as TestItem, []] },
        facets: { test: async () => ({}) },
        allActions: { test: async (): Promise<[TestItem[], never[]]> => [[], []] },
        allFacets: { test: async () => ({}) }
      };
      const wrappedOps = wrapImplementationOperations(mockImplOps, options);

      // Check all required properties exist
      expect(wrappedOps).toHaveProperty('create');
      expect(wrappedOps).toHaveProperty('get');
      expect(wrappedOps).toHaveProperty('update');
      expect(wrappedOps).toHaveProperty('remove');
      expect(wrappedOps).toHaveProperty('upsert');
      expect(wrappedOps).toHaveProperty('all');
      expect(wrappedOps).toHaveProperty('one');
      expect(wrappedOps).toHaveProperty('find');
      expect(wrappedOps).toHaveProperty('findOne');
      expect(wrappedOps).toHaveProperty('facet');
      expect(wrappedOps).toHaveProperty('allFacet');
      expect(wrappedOps).toHaveProperty('action');
      expect(wrappedOps).toHaveProperty('allAction');
      expect(wrappedOps).toHaveProperty('finders');
      expect(wrappedOps).toHaveProperty('actions');
      expect(wrappedOps).toHaveProperty('facets');
      expect(wrappedOps).toHaveProperty('allActions');
      expect(wrappedOps).toHaveProperty('allFacets');
    });
  });
});

