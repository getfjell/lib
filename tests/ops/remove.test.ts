import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { Coordinate, Item, PriKey } from '@fjell/types';
import { createCoordinate } from '@fjell/core';
import { createOptions } from '../../src/Options';
import { HookError, RemoveError, RemoveValidationError } from '../../src/errors';
import { Operations } from '../../src/Operations';
import { wrapRemoveOperation } from '../../src/ops/remove';
import { createRegistry } from '../../src/Registry';
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
    } as any;
    coordinate = createCoordinate(['test'], ['scope1']);
  });

  describe('basic remove', () => {
    test('should remove item successfully', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const testItem = { name: 'test', key } as unknown as Item<'test'>;

      const registry = createRegistry();
      const options = createOptions<Item<'test'>, 'test'>();
      removeMethodMock.mockResolvedValueOnce(testItem);

      const remove = wrapRemoveOperation(operations, options, coordinate, registry);
      const result = await remove(key);

      expect(result).toBe(testItem);
      expect(removeMethodMock).toHaveBeenCalledWith(key);
    });

    test('should throw RemoveError when remove fails', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;

      const registry = createRegistry();
      const options = createOptions<Item<'test'>, 'test'>();
      removeMethodMock.mockResolvedValueOnce(null);

      const remove = wrapRemoveOperation(operations, options, coordinate, registry);
      try {
        await remove(key);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.cause).toBeInstanceOf(RemoveError);
      }
    });
  });

  describe('hooks', () => {
    test('should run preRemove hook before removing', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const testItem = { name: 'test', key } as unknown as Item<'test'>;
      const preRemoveMock = vi.fn();

      const registry = createRegistry();
      const options = createOptions<Item<'test'>, 'test'>({
        hooks: {
          preRemove: preRemoveMock
        }
      });
      removeMethodMock.mockResolvedValueOnce(testItem);

      const remove = wrapRemoveOperation(operations, options, coordinate, registry);
      await remove(key);

      expect(preRemoveMock).toHaveBeenCalledWith(key);
      expect(removeMethodMock).toHaveBeenCalledWith(key);
    });

    test('should throw HookError when preRemove hook fails', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;

      const registry = createRegistry();
      const options = createOptions<Item<'test'>, 'test'>({
        hooks: {
          preRemove: async () => { throw new Error('Hook failed'); }
        }
      });

      const remove = wrapRemoveOperation(operations, options, coordinate, registry);
      try {
        await remove(key);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.cause).toBeInstanceOf(HookError);
      }
    });

    test('should run postRemove hook after removing', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const testItem = { name: 'test', key } as unknown as Item<'test'>;
      const postRemoveMock = vi.fn();

      const registry = createRegistry();
      const options = createOptions<Item<'test'>, 'test'>({
        hooks: {
          postRemove: postRemoveMock
        }
      });
      removeMethodMock.mockResolvedValueOnce(testItem);

      const remove = wrapRemoveOperation(operations, options, coordinate, registry);
      await remove(key);

      expect(postRemoveMock).toHaveBeenCalledWith(testItem);
    });

    test('should throw HookError when postRemove hook fails', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const testItem = { name: 'test', key } as unknown as Item<'test'>;

      const registry = createRegistry();
      const options = createOptions<Item<'test'>, 'test'>({
        hooks: {
          postRemove: async () => { throw new Error('Hook failed'); }
        }
      });
      removeMethodMock.mockResolvedValueOnce(testItem);

      const remove = wrapRemoveOperation(operations, options, coordinate, registry);
      try {
        await remove(key);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.cause).toBeInstanceOf(HookError);
      }
    });
  });

  describe('validation', () => {
    test('should validate before removing', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const testItem = { name: 'test', key } as unknown as Item<'test'>;
      const validateMock = vi.fn().mockResolvedValueOnce(true);

      const registry = createRegistry();
      const options = createOptions<Item<'test'>, 'test'>({
        validators: {
          onRemove: validateMock
        }
      });
      removeMethodMock.mockResolvedValueOnce(testItem);

      const remove = wrapRemoveOperation(operations, options, coordinate, registry);
      await remove(key);

      expect(validateMock).toHaveBeenCalledWith(key);
    });

    test('should throw RemoveValidationError when validation fails', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;

      const registry = createRegistry();
      const options = createOptions<Item<'test'>, 'test'>({
        validators: {
          onRemove: async () => false
        }
      });

      const remove = wrapRemoveOperation(operations, options, coordinate, registry);
      try {
        await remove(key);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.cause).toBeInstanceOf(RemoveValidationError);
      }
    });

    test('should throw RemoveValidationError when validator throws', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;

      const registry = createRegistry();
      const options = createOptions<Item<'test'>, 'test'>({
        validators: {
          onRemove: async () => { throw new Error('Validation failed'); }
        }
      });

      const remove = wrapRemoveOperation(operations, options, coordinate, registry);
      try {
        await remove(key);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.cause).toBeInstanceOf(RemoveValidationError);
      }
    });
  });
});
