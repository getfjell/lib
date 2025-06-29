import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { createCoordinate } from '@/Coordinate';
import { createDefinition } from '@/Definition';
import { HookError, UpdateError, UpdateValidationError } from '@/errors';
import { Operations } from '@/Operations';
import { wrapUpdateOperation } from '@/ops/update';
import { createRegistry } from '@/Registry';
import { Item, PriKey } from '@fjell/core';
import { randomUUID } from 'crypto';
import type { Coordinate } from '@/Coordinate';

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
    },
  };
});

vi.mock('@/logger', () => {
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
    default: logger,
  };
});

describe('Update Operation', () => {
  let operations: Operations<Item<'test'>, 'test'>;
  let updateMethodMock: Mock;
  let coordinate: Coordinate<'test'>;

  beforeEach(() => {
    updateMethodMock = vi.fn();
    operations = {
      update: updateMethodMock,
    } as unknown as Operations<Item<'test'>, 'test'>;
    coordinate = createCoordinate<'test'>(['test'] as const, ['scope1']) as Coordinate<'test'>;
  });

  describe('basic update', () => {
    test('should update item successfully', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'test' } as Partial<Item<'test'>>;
      const registry = createRegistry();

      const definition = createDefinition<Item<'test'>, 'test'>(coordinate);
      updateMethodMock.mockResolvedValueOnce(testItem);

      const update = wrapUpdateOperation(operations, definition, registry);
      const result = await update(key, itemProperties);

      expect(result).toBe(testItem);
      expect(updateMethodMock).toHaveBeenCalledWith(key, itemProperties);
    });

    test('should throw UpdateError when update fails', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'test' } as Partial<Item<'test'>>;
      const registry = createRegistry();
      const definition = createDefinition<Item<'test'>, 'test'>(coordinate);
      updateMethodMock.mockRejectedValueOnce(new Error('Update failed'));

      const update = wrapUpdateOperation(operations, definition, registry);
      await expect(update(key, itemProperties)).rejects.toThrow(UpdateError);
    });
  });

  describe('hooks', () => {
    test('should run preUpdate hook before updating', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'test' } as Partial<Item<'test'>>;
      const modifiedItem = { name: 'modified' } as Partial<Item<'test'>>;
      const registry = createRegistry();
      const preUpdateMock = vi.fn().mockResolvedValueOnce(modifiedItem);
      const definition = createDefinition<Item<'test'>, 'test'>(coordinate, {
        hooks: {
          preUpdate: preUpdateMock
        }
      });

      updateMethodMock.mockResolvedValueOnce(modifiedItem);

      const update = wrapUpdateOperation(operations, definition, registry);
      await update(key, itemProperties);

      expect(preUpdateMock).toHaveBeenCalledWith(key, itemProperties);
      expect(updateMethodMock).toHaveBeenCalledWith(key, modifiedItem);
    });

    test('should run postUpdate hook after updating', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test'>;
      const modifiedItem = { name: 'modified' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const registry = createRegistry();
      const postUpdateMock = vi.fn().mockResolvedValueOnce(modifiedItem);
      const definition = createDefinition<Item<'test'>, 'test'>(coordinate, {
        hooks: {
          postUpdate: postUpdateMock
        }
      });

      updateMethodMock.mockResolvedValueOnce(testItem);

      const update = wrapUpdateOperation(operations, definition, registry);
      const result = await update(key, testItem);

      expect(postUpdateMock).toHaveBeenCalledWith(testItem);
      expect(result).toBe(modifiedItem);
    });

    test('should throw HookError when preUpdate hook fails', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'test' } as Partial<Item<'test'>>;

      const registry = createRegistry();
      const definition = createDefinition<Item<'test'>, 'test'>(coordinate, {
        hooks: {
          preUpdate: async () => { throw new Error('Hook failed'); }
        }
      });

      const update = wrapUpdateOperation(operations, definition, registry);
      await expect(update(key, itemProperties)).rejects.toThrow(HookError);
    });
  });

  describe('validation', () => {
    test('should validate item before updating', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'test' } as Partial<Item<'test'>>;

      const registry = createRegistry();
      const validateMock = vi.fn().mockResolvedValueOnce(true);
      const definition = createDefinition<Item<'test'>, 'test'>(coordinate, {
        validators: {
          onUpdate: validateMock
        }
      });

      updateMethodMock.mockResolvedValueOnce(itemProperties);

      const update = wrapUpdateOperation(operations, definition, registry);
      await update(key, itemProperties);

      expect(validateMock).toHaveBeenCalledWith(key, itemProperties);
    });

    test('should throw UpdateValidationError when validation fails', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'test' } as Partial<Item<'test'>>;

      const registry = createRegistry();
      const definition = createDefinition<Item<'test'>, 'test'>(coordinate, {
        validators: {
          onUpdate: async () => false
        }
      });

      const update = wrapUpdateOperation(operations, definition, registry);
      await expect(update(key, itemProperties)).rejects.toThrow(UpdateValidationError);
    });
  });
});
