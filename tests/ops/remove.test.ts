import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { Coordinate, createCoordinate } from '@/Coordinate';
import { createDefinition } from '@/Definition';
import { HookError, RemoveError, RemoveValidationError } from '@/errors';
import { Operations } from '@/Operations';
import { wrapRemoveOperation } from '@/ops/remove';
import { createRegistry } from '@/Registry';
import { Item, PriKey } from '@fjell/core';
import { randomUUID } from 'crypto';

vi.mock('@fjell/logging', () => {
  const logger = {
    get: vi.fn().mockReturnThis(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    emergency: vi.fn(),
    default: vi.fn(),
    alert: vi.fn(),
    critical: vi.fn(),
    notice: vi.fn(),
    time: vi.fn().mockReturnThis(),
    end: vi.fn(),
    log: vi.fn(),
  };

  return {
    default: {
      getLogger: () => logger,
    }
  }
});

describe('Remove Operation', () => {
  let operations: Operations<Item<'test'>, 'test'>;
  let removeMethodMock: Mock;
  let coordinate: Coordinate<'test'>;

  beforeEach(() => {
    removeMethodMock = vi.fn();
    operations = {
      remove: removeMethodMock,
    } as unknown as Operations<Item<'test'>, 'test'>;
    coordinate = createCoordinate(['test'], ['scope1']);
  });

  describe('basic remove', () => {
    test('should remove item successfully', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;

      const registry = createRegistry();
      const definition = createDefinition(coordinate);
      removeMethodMock.mockResolvedValueOnce(testItem);

      const remove = wrapRemoveOperation(operations, definition, registry);
      const result = await remove(key);

      expect(result).toBe(testItem);
      expect(removeMethodMock).toHaveBeenCalledWith(key);
    });

    test('should throw RemoveError when remove fails', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;

      const registry = createRegistry();
      const definition = createDefinition(coordinate);
      removeMethodMock.mockResolvedValueOnce(null);

      const remove = wrapRemoveOperation(operations, definition, registry);
      await expect(remove(key)).rejects.toThrow(RemoveError);
    });
  });

  describe('hooks', () => {
    test('should run preRemove hook before removing', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const preRemoveMock = vi.fn();

      const registry = createRegistry();
      const definition = createDefinition(coordinate, {
        hooks: {
          preRemove: preRemoveMock
        }
      });
      removeMethodMock.mockResolvedValueOnce(testItem);

      const remove = wrapRemoveOperation(operations, definition, registry);
      await remove(key);

      expect(preRemoveMock).toHaveBeenCalledWith(key);
      expect(removeMethodMock).toHaveBeenCalledWith(key);
    });

    test('should throw HookError when preRemove hook fails', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;

      const registry = createRegistry();
      const definition = createDefinition(coordinate, {
        hooks: {
          preRemove: async () => { throw new Error('Hook failed'); }
        }
      });

      const remove = wrapRemoveOperation(operations, definition, registry);
      await expect(remove(key)).rejects.toThrow(HookError);
    });

    test('should run postRemove hook after removing', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const postRemoveMock = vi.fn();

      const registry = createRegistry();
      const definition = createDefinition(coordinate, {
        hooks: {
          postRemove: postRemoveMock
        }
      });
      removeMethodMock.mockResolvedValueOnce(testItem);

      const remove = wrapRemoveOperation(operations, definition, registry);
      await remove(key);

      expect(postRemoveMock).toHaveBeenCalledWith(testItem);
    });

    test('should throw HookError when postRemove hook fails', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;

      const registry = createRegistry();
      const definition = createDefinition<Item<'test'>, 'test'>(coordinate, {
        hooks: {
          postRemove: async () => { throw new Error('Hook failed'); }
        }
      });
      removeMethodMock.mockResolvedValueOnce(testItem);

      const remove = wrapRemoveOperation(operations, definition, registry);
      await expect(remove(key)).rejects.toThrow(HookError);
    });
  });

  describe('validation', () => {
    test('should validate before removing', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const validateMock = vi.fn().mockResolvedValueOnce(true);

      const registry = createRegistry();
      const definition = createDefinition(coordinate, {
        validators: {
          onRemove: validateMock
        }
      });
      removeMethodMock.mockResolvedValueOnce(testItem);

      const remove = wrapRemoveOperation(operations, definition, registry);
      await remove(key);

      expect(validateMock).toHaveBeenCalledWith(key);
    });

    test('should throw RemoveValidationError when validation fails', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;

      const registry = createRegistry();
      const definition = createDefinition(coordinate, {
        validators: {
          onRemove: async () => false
        }
      });

      const remove = wrapRemoveOperation(operations, definition, registry);
      await expect(remove(key)).rejects.toThrow(RemoveValidationError);
    });

    test('should throw RemoveValidationError when validator throws', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;

      const registry = createRegistry();
      const definition = createDefinition(coordinate, {
        validators: {
          onRemove: async () => { throw new Error('Validation failed'); }
        }
      });

      const remove = wrapRemoveOperation(operations, definition, registry);
      await expect(remove(key)).rejects.toThrow(RemoveValidationError);
    });
  });
});
