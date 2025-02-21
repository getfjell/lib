import { createCoordinate } from '@/Coordinate';
import { createDefinition } from '@/Definition';
import { HookError, UpdateError, UpdateValidationError } from '@/errors';
import { Operations } from '@/Operations';
import { wrapUpdateOperation } from '@/ops/update';
import { Item, PriKey, TypesProperties } from '@fjell/core';
import { randomUUID } from 'crypto';

jest.mock('@fjell/logging', () => {
  return {
    get: jest.fn().mockReturnThis(),
    getLogger: jest.fn().mockReturnThis(),
    default: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    emergency: jest.fn(),
    alert: jest.fn(),
    critical: jest.fn(),
    notice: jest.fn(),
    time: jest.fn().mockReturnThis(),
    end: jest.fn(),
    log: jest.fn(),
  }
});

describe('Update Operation', () => {
  let operations: Operations<Item<'test'>, 'test'>;
  let updateMethodMock: jest.Mock;
  let coordinate: ReturnType<typeof createCoordinate>;
  
  beforeEach(() => {
    updateMethodMock = jest.fn();
    operations = {
      update: updateMethodMock,
    } as unknown as Operations<Item<'test'>, 'test'>;
    coordinate = createCoordinate<'test'>(['test'], ['scope1']);
  });

  describe('basic update', () => {
    test('should update item successfully', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'test' } as TypesProperties<Item<'test'>, 'test'>;
      
      const definition = createDefinition(coordinate);
      updateMethodMock.mockResolvedValueOnce(testItem);

      const update = wrapUpdateOperation(operations, definition);
      const result = await update(key, itemProperties);

      expect(result).toBe(testItem);
      expect(updateMethodMock).toHaveBeenCalledWith(key, itemProperties);
    });

    test('should throw UpdateError when update fails', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'test' } as TypesProperties<Item<'test'>, 'test'>;
      
      const definition = createDefinition(coordinate);
      updateMethodMock.mockRejectedValueOnce(new Error('Update failed'));

      const update = wrapUpdateOperation(operations, definition);
      await expect(update(key, itemProperties)).rejects.toThrow(UpdateError);
    });
  });

  describe('hooks', () => {
    test('should run preUpdate hook before updating', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'test' } as TypesProperties<Item<'test'>, 'test'>;
      const modifiedItem = { name: 'modified' } as TypesProperties<Item<'test'>, 'test'>;
      
      const preUpdateMock = jest.fn().mockResolvedValueOnce(modifiedItem);
      const definition = createDefinition(coordinate, {
        hooks: {
          preUpdate: preUpdateMock
        }
      });

      updateMethodMock.mockResolvedValueOnce(modifiedItem);

      const update = wrapUpdateOperation(operations, definition);
      await update(key, itemProperties);

      expect(preUpdateMock).toHaveBeenCalledWith(key, itemProperties);
      expect(updateMethodMock).toHaveBeenCalledWith(key, modifiedItem);
    });

    test('should run postUpdate hook after updating', async () => {
      const testItem = { name: 'test' } as unknown as Item<'test'>;
      const modifiedItem = { name: 'modified' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      
      const postUpdateMock = jest.fn().mockResolvedValueOnce(modifiedItem);
      const definition = createDefinition(coordinate, {
        hooks: {
          postUpdate: postUpdateMock
        }
      });

      updateMethodMock.mockResolvedValueOnce(testItem);

      const update = wrapUpdateOperation(operations, definition);
      const result = await update(key, testItem);

      expect(postUpdateMock).toHaveBeenCalledWith(testItem);
      expect(result).toBe(modifiedItem);
    });

    test('should throw HookError when preUpdate hook fails', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'test' } as TypesProperties<Item<'test'>, 'test'>;
      
      const definition = createDefinition(coordinate, {
        hooks: {
          preUpdate: async () => { throw new Error('Hook failed'); }
        }
      });

      const update = wrapUpdateOperation(operations, definition);
      await expect(update(key, itemProperties)).rejects.toThrow(HookError);
    });
  });

  describe('validation', () => {
    test('should validate item before updating', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'test' } as TypesProperties<Item<'test'>, 'test'>;
      
      const validateMock = jest.fn().mockResolvedValueOnce(true);
      const definition = createDefinition(coordinate, {
        validators: {
          onUpdate: validateMock
        }
      });

      updateMethodMock.mockResolvedValueOnce(itemProperties);

      const update = wrapUpdateOperation(operations, definition);
      await update(key, itemProperties);

      expect(validateMock).toHaveBeenCalledWith(key, itemProperties);
    });

    test('should throw UpdateValidationError when validation fails', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'test' } as TypesProperties<Item<'test'>, 'test'>;
      
      const definition = createDefinition(coordinate, {
        validators: {
          onUpdate: async () => false
        }
      });

      const update = wrapUpdateOperation(operations, definition);
      await expect(update(key, itemProperties)).rejects.toThrow(UpdateValidationError);
    });
  });
});
