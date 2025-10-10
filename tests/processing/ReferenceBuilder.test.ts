import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PriKey } from '@fjell/core';
import { buildReference, ReferenceDefinition } from '../../src/processing/ReferenceBuilder';
import { createOperationContext, OperationContext } from '../../src/processing/OperationContext';
import { Registry } from '../../src/Registry';

describe('ReferenceBuilder', () => {
  let mockRegistry: Registry;
  let mockLibraryInstance: any;
  let context: OperationContext;

  beforeEach(() => {
    // Create mock library instance with operations
    mockLibraryInstance = {
      operations: {
        get: vi.fn()
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

  describe('buildReference', () => {
    it('should build a simple reference', async () => {
      const item = {
        key: { kt: 'task', pk: 'task1' },
        title: 'Test Task',
        userId: 'user1'
      };

      const referenceDef: ReferenceDefinition = {
        column: 'userId',
        kta: ['user'],
        property: 'user'
      };

      const expectedUser = {
        key: { kt: 'user', pk: 'user1' },
        name: 'John Doe'
      };
      mockLibraryInstance.operations.get.mockResolvedValue(expectedUser);

      const result = await buildReference(item, referenceDef, mockRegistry, context);

      expect(result.user).toEqual(expectedUser);
      expect(mockLibraryInstance.operations.get).toHaveBeenCalledWith({
        kt: 'user',
        pk: 'user1'
      });
      expect(mockRegistry.get).toHaveBeenCalledWith(['user']);
    });

    it('should handle null foreign key values', async () => {
      const item = {
        key: { kt: 'task', pk: 'task1' },
        title: 'Test Task',
        userId: null
      };

      const referenceDef: ReferenceDefinition = {
        column: 'userId',
        kta: ['user'],
        property: 'user'
      };

      const result = await buildReference(item, referenceDef, mockRegistry, context);

      expect(result.user).toBeNull();
      expect(mockLibraryInstance.operations.get).not.toHaveBeenCalled();
    });

    it('should handle undefined foreign key values', async () => {
      const item = {
        key: { kt: 'task', pk: 'task1' },
        title: 'Test Task'
      };

      const referenceDef: ReferenceDefinition = {
        column: 'userId',
        kta: ['user'],
        property: 'user'
      };

      const result = await buildReference(item, referenceDef, mockRegistry, context);

      expect(result.user).toBeNull();
      expect(mockLibraryInstance.operations.get).not.toHaveBeenCalled();
    });

    it('should throw an error if registry is not provided', async () => {
      const item = {
        key: { kt: 'task', pk: 'task1' },
        userId: 'user1'
      };

      const referenceDef: ReferenceDefinition = {
        column: 'userId',
        kta: ['user'],
        property: 'user'
      };

      await expect(
        buildReference(item, referenceDef, null as any, context)
      ).rejects.toThrow('registry is not present');
    });

    it('should throw an error if library instance is not found', async () => {
      mockRegistry.get = vi.fn().mockReturnValue(null);

      const item = {
        key: { kt: 'task', pk: 'task1' },
        unknownId: 'unknown1'
      };

      const referenceDef: ReferenceDefinition = {
        column: 'unknownId',
        kta: ['unknown'],
        property: 'unknown'
      };

      await expect(
        buildReference(item, referenceDef, mockRegistry, context)
      ).rejects.toThrow('dependency is not present in registry');
    });

    it('should use cached reference when available', async () => {
      const item = {
        key: { kt: 'task', pk: 'task1' },
        userId: 'user1'
      };

      const referenceDef: ReferenceDefinition = {
        column: 'userId',
        kta: ['user'],
        property: 'user'
      };

      const cachedUser = {
        key: { kt: 'user', pk: 'user1' },
        name: 'Cached User'
      };

      const priKey: PriKey<'user'> = { kt: 'user', pk: 'user1' };
      context.setCached(priKey, cachedUser);

      const result = await buildReference(item, referenceDef, mockRegistry, context);

      expect(result.user).toEqual(cachedUser);
      expect(mockLibraryInstance.operations.get).not.toHaveBeenCalled();
    });

    it('should detect circular dependencies', async () => {
      const item = {
        key: { kt: 'task', pk: 'task1' },
        userId: 'user1'
      };

      const referenceDef: ReferenceDefinition = {
        column: 'userId',
        kta: ['user'],
        property: 'user'
      };

      const priKey: PriKey<'user'> = { kt: 'user', pk: 'user1' };
      context.markInProgress(priKey);

      const result = await buildReference(item, referenceDef, mockRegistry, context);

      // Should create a placeholder with just the key
      expect(result.user).toEqual({ key: priKey });
      expect(mockLibraryInstance.operations.get).not.toHaveBeenCalled();
    });

    it('should cache the result after fetching', async () => {
      const item = {
        key: { kt: 'task', pk: 'task1' },
        userId: 'user1'
      };

      const referenceDef: ReferenceDefinition = {
        column: 'userId',
        kta: ['user'],
        property: 'user'
      };

      const expectedUser = {
        key: { kt: 'user', pk: 'user1' },
        name: 'John Doe'
      };
      mockLibraryInstance.operations.get.mockResolvedValue(expectedUser);

      await buildReference(item, referenceDef, mockRegistry, context);

      const priKey: PriKey<'user'> = { kt: 'user', pk: 'user1' };
      expect(context.isCached(priKey)).toBe(true);
      expect(context.getCached(priKey)).toEqual(expectedUser);
    });

    it('should mark reference as complete even if an error occurs', async () => {
      const item = {
        key: { kt: 'task', pk: 'task1' },
        userId: 'user1'
      };

      const referenceDef: ReferenceDefinition = {
        column: 'userId',
        kta: ['user'],
        property: 'user'
      };

      mockLibraryInstance.operations.get.mockRejectedValue(new Error('Database error'));

      await expect(
        buildReference(item, referenceDef, mockRegistry, context)
      ).rejects.toThrow('Database error');

      const priKey: PriKey<'user'> = { kt: 'user', pk: 'user1' };
      expect(context.isInProgress(priKey)).toBe(false);
    });

    it('should work without a context', async () => {
      const item = {
        key: { kt: 'task', pk: 'task1' },
        userId: 'user1'
      };

      const referenceDef: ReferenceDefinition = {
        column: 'userId',
        kta: ['user'],
        property: 'user'
      };

      const expectedUser = {
        key: { kt: 'user', pk: 'user1' },
        name: 'John Doe'
      };
      mockLibraryInstance.operations.get.mockResolvedValue(expectedUser);

      const result = await buildReference(item, referenceDef, mockRegistry);

      expect(result.user).toEqual(expectedUser);
    });

    it('should handle multikey references', async () => {
      const item = {
        key: { kt: 'task', pk: 'task1' },
        projectId: 'project1'
      };

      const referenceDef: ReferenceDefinition = {
        column: 'projectId',
        kta: ['project', 'org'],
        property: 'project'
      };

      const expectedProject = {
        key: {
          kt: 'project',
          pk: 'project1',
          loc: [{ kt: 'org', lk: 'org1' }]
        },
        name: 'Test Project'
      };
      mockLibraryInstance.operations.get.mockResolvedValue(expectedProject);

      const result = await buildReference(item, referenceDef, mockRegistry, context);

      expect(result.project).toEqual(expectedProject);
      // Should use the first key type (primary key type)
      expect(mockLibraryInstance.operations.get).toHaveBeenCalledWith({
        kt: 'project',
        pk: 'project1'
      });
    });
  });
});

