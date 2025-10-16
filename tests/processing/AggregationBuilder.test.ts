import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Item } from '@fjell/core';
import { AggregationDefinition, buildAggregation } from '../../src/processing/AggregationBuilder';
import { createOperationContext, OperationContext } from '../../src/processing/OperationContext';
import { Registry } from '../../src/Registry';

describe('AggregationBuilder', () => {
  let mockRegistry: Registry;
  let mockLibraryInstance: any;
  let context: OperationContext;

  beforeEach(() => {
    // Create mock library instance with operations
    mockLibraryInstance = {
      operations: {
        one: vi.fn(),
        all: vi.fn()
      }
    };

    // Create mock registry
    mockRegistry = {
      get: vi.fn().mockReturnValue(mockLibraryInstance),
      register: vi.fn(),
      type: 'lib'
    } as any;

    context = createOperationContext();
  });

  describe('buildAggregation', () => {
    it('should build a one-to-one aggregation', async () => {
      const item: Item<'user', 'org'> = {
        key: {
          kt: 'user',
          pk: 'user1',
          loc: [{ kt: 'org', lk: 'org1' }]
        },
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };

      const aggregationDef: AggregationDefinition = {
        kta: ['profile'],
        property: 'profile',
        cardinality: 'one'
      };

      const expectedProfile = { key: { kt: 'profile', pk: 'profile1' }, bio: 'Test bio' };
      mockLibraryInstance.operations.one.mockResolvedValue(expectedProfile);

      const result = await buildAggregation(item, aggregationDef, mockRegistry, context);

      expect(result.profile).toEqual(expectedProfile);
      expect(mockLibraryInstance.operations.one).toHaveBeenCalledWith(
        {},
        [{ kt: 'org', lk: 'org1' }]
      );
      expect(mockRegistry.get).toHaveBeenCalledWith(['profile']);
    });

    it('should build a one-to-many aggregation', async () => {
      const item: Item<'user', 'org'> = {
        key: {
          kt: 'user',
          pk: 'user1',
          loc: [{ kt: 'org', lk: 'org1' }]
        },
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };

      const aggregationDef: AggregationDefinition = {
        kta: ['task'],
        property: 'tasks',
        cardinality: 'many'
      };

      const expectedTasks = [
        { key: { kt: 'task', pk: 'task1' }, title: 'Task 1' },
        { key: { kt: 'task', pk: 'task2' }, title: 'Task 2' }
      ];
      mockLibraryInstance.operations.all.mockResolvedValue(expectedTasks);

      const result = await buildAggregation(item, aggregationDef, mockRegistry, context);

      expect(result.tasks).toEqual(expectedTasks);
      expect(mockLibraryInstance.operations.all).toHaveBeenCalledWith(
        {},
        [{ kt: 'org', lk: 'org1' }]
      );
    });

    it('should throw an error if library instance is not found', async () => {
      mockRegistry.get = vi.fn().mockReturnValue(null);

      const item: Item<'user'> = {
        key: { kt: 'user', pk: 'user1' },
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };

      const aggregationDef: AggregationDefinition = {
        kta: ['unknown'],
        property: 'unknown',
        cardinality: 'one'
      };

      await expect(
        buildAggregation(item, aggregationDef, mockRegistry, context)
      ).rejects.toThrow('Library instance not found for key type array: unknown');
    });

    it('should use cached result when available', async () => {
      const item: Item<'user', 'org'> = {
        key: {
          kt: 'user',
          pk: 'user1',
          loc: [{ kt: 'org', lk: 'org1' }]
        },
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };

      const aggregationDef: AggregationDefinition = {
        kta: ['profile'],
        property: 'profile',
        cardinality: 'one'
      };

      const cachedProfile = { key: { kt: 'profile', pk: 'profile1' }, bio: 'Cached bio' };
      
      // Pre-populate cache
      const cacheKey = `profile_one_user:user1|org:org1`;
      context.cache.set(cacheKey, cachedProfile);

      const result = await buildAggregation(item, aggregationDef, mockRegistry, context);

      expect(result.profile).toEqual(cachedProfile);
      // Should not call the operation since it's cached
      expect(mockLibraryInstance.operations.one).not.toHaveBeenCalled();
    });

    it('should cache the result after fetching', async () => {
      const item: Item<'user', 'org'> = {
        key: {
          kt: 'user',
          pk: 'user1',
          loc: [{ kt: 'org', lk: 'org1' }]
        },
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };

      const aggregationDef: AggregationDefinition = {
        kta: ['profile'],
        property: 'profile',
        cardinality: 'one'
      };

      const expectedProfile = { key: { kt: 'profile', pk: 'profile1' }, bio: 'Test bio' };
      mockLibraryInstance.operations.one.mockResolvedValue(expectedProfile);

      await buildAggregation(item, aggregationDef, mockRegistry, context);

      const cacheKey = `profile_one_user:user1|org:org1`;
      expect(context.cache.has(cacheKey)).toBe(true);
      expect(context.cache.get(cacheKey)).toEqual(expectedProfile);
    });

    it('should work without a context', async () => {
      const item: Item<'user'> = {
        key: { kt: 'user', pk: 'user1' },
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };

      const aggregationDef: AggregationDefinition = {
        kta: ['profile'],
        property: 'profile',
        cardinality: 'one'
      };

      const expectedProfile = { key: { kt: 'profile', pk: 'profile1' }, bio: 'Test bio' };
      mockLibraryInstance.operations.one.mockResolvedValue(expectedProfile);

      const result = await buildAggregation(item, aggregationDef, mockRegistry);

      expect(result.profile).toEqual(expectedProfile);
    });

    it('should handle primary key items (no location)', async () => {
      const item: Item<'user'> = {
        key: { kt: 'user', pk: 'user1' },
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };

      const aggregationDef: AggregationDefinition = {
        kta: ['notification'],
        property: 'notifications',
        cardinality: 'many'
      };

      const expectedNotifications = [
        { key: { kt: 'notification', pk: 'notif1' }, message: 'Hello' }
      ];
      mockLibraryInstance.operations.all.mockResolvedValue(expectedNotifications);

      const result = await buildAggregation(item, aggregationDef, mockRegistry, context);

      expect(result.notifications).toEqual(expectedNotifications);
      // For PriKey, ikToLKA converts it to a location array with the item itself
      expect(mockLibraryInstance.operations.all).toHaveBeenCalledWith({}, [{ kt: 'user', lk: 'user1' }]);
    });
  });
});

