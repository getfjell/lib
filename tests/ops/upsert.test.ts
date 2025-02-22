import { createCoordinate } from '@/Coordinate';
import { NotFoundError, Operations } from '@/index';
import { wrapUpsertOperation } from '@/ops/upsert';
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
jest.mock('@/ops/create');
jest.mock('@/ops/update');

describe('upsert', () => {
  jest.resetAllMocks();
  let operations: Operations<Item<'test'>, 'test'>;
  let getMethodMock: jest.Mock;
  let updateMethodMock: jest.Mock;
  let createMethodMock: jest.Mock;
  let oneMethodMock: jest.Mock;
  let globalOneMethodMock: jest.Mock;

  beforeEach(() => {
    getMethodMock = jest.fn();
    updateMethodMock = jest.fn();
    createMethodMock = jest.fn();
    oneMethodMock = jest.fn();
    globalOneMethodMock = jest.fn();
    operations = {
      get: getMethodMock,
      update: updateMethodMock,
      create: createMethodMock,
      one: oneMethodMock,
      globalOne: globalOneMethodMock,
    } as unknown as Operations<Item<'test'>, 'test'>;
  });

  describe('upsert with key', () => {
    test('should create new item if it does not exist', async () => {
      const testItem = { name: 'newItem' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'newItem' } as TypesProperties<Item<'test'>, 'test'>;
      const coordinate = createCoordinate<'test'>(['test'], []);

      getMethodMock.mockImplementation(() => {
        throw new NotFoundError('get', coordinate, key, {});
      });
      createMethodMock.mockResolvedValueOnce({ ...testItem, action: 'created' } as Item<'test'>);
      updateMethodMock.mockResolvedValueOnce({ ...testItem, action: 'updated' } as Item<'test'>);

      const result = await wrapUpsertOperation(operations)(key, itemProperties);
      expect(result).toBeDefined();
      expect(result.action).toBe('updated');
      expect(getMethodMock).toHaveBeenCalled();
      expect(createMethodMock).toHaveBeenCalled();
      expect(updateMethodMock).toHaveBeenCalled();
    });

    test('should update new item if exists', async () => {
      const testItem = { name: 'newItem' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'newItem' } as TypesProperties<Item<'test'>, 'test'>;

      getMethodMock.mockResolvedValueOnce(testItem);
      updateMethodMock.mockResolvedValueOnce({ ...testItem, action: 'updated' } as Item<'test'>);

      const result = await wrapUpsertOperation(operations)(key, itemProperties);
      expect(result).toBeDefined();
      expect(result.action).toBe('updated');
      expect(getMethodMock).toHaveBeenCalled();
      expect(createMethodMock).not.toHaveBeenCalled();
      expect(updateMethodMock).toHaveBeenCalled();
    });
  });
});
