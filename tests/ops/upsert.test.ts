import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { createCoordinate } from '@fjell/core';
import { createRegistry, NotFoundError, Operations } from '../../src/index';
import { wrapUpsertOperation } from '../../src/ops/upsert';
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
vi.mock('../src/ops/create');
vi.mock('../src/ops/update');

describe('upsert', () => {
  vi.resetAllMocks();
  let operations: Operations<Item<'test'>, 'test'>;
  let getMethodMock: Mock;
  let updateMethodMock: Mock;
  let createMethodMock: Mock;
  let oneMethodMock: Mock;
  let globalOneMethodMock: Mock;

  beforeEach(() => {
    getMethodMock = vi.fn();
    updateMethodMock = vi.fn();
    createMethodMock = vi.fn();
    oneMethodMock = vi.fn();
    globalOneMethodMock = vi.fn();
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
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const testItem = { name: 'newItem', key } as unknown as Item<'test'>;
      const itemProperties = { name: 'newItem' } as Partial<Item<'test'>>;
      const coordinate = createCoordinate<'test'>(['test'], []);

      getMethodMock.mockImplementation(() => {
        throw new NotFoundError('get', coordinate, key, {});
      });
      createMethodMock.mockResolvedValueOnce({ ...testItem, action: 'created', key } as Item<'test'>);
      updateMethodMock.mockResolvedValueOnce({ ...testItem, action: 'updated', key } as Item<'test'>);

      const registry = createRegistry();
      const result = await wrapUpsertOperation(operations, coordinate, registry)(key, itemProperties);
      expect(result).toBeDefined();
      expect(result.action).toBe('updated');
      expect(getMethodMock).toHaveBeenCalled();
      expect(createMethodMock).toHaveBeenCalled();
      expect(updateMethodMock).toHaveBeenCalled();
    });

    test('should update new item if exists', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const testItem = { name: 'newItem', key } as unknown as Item<'test'>;
      const itemProperties = { name: 'newItem' } as Partial<Item<'test'>>;
      const coordinate = createCoordinate<'test'>(['test'], []);

      getMethodMock.mockResolvedValueOnce(testItem);
      updateMethodMock.mockResolvedValueOnce({ ...testItem, action: 'updated', key } as Item<'test'>);

      const registry = createRegistry();
      const result = await wrapUpsertOperation(operations, coordinate, registry)(key, itemProperties);
      expect(result).toBeDefined();
      expect(result.action).toBe('updated');
      expect(getMethodMock).toHaveBeenCalled();
      expect(createMethodMock).not.toHaveBeenCalled();
      expect(updateMethodMock).toHaveBeenCalled();
    });

    test('should rethrow non-NotFoundError errors from get', async () => {
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'newItem' } as Partial<Item<'test'>>;
      const coordinate = createCoordinate<'test'>(['test'], []);
      const customError = new Error('Database connection failed');

      getMethodMock.mockImplementation(() => {
        throw customError;
      });

      const registry = createRegistry();
      await expect(wrapUpsertOperation(operations, coordinate, registry)(key, itemProperties)).rejects.toThrow('Database connection failed');
      expect(getMethodMock).toHaveBeenCalled();
      expect(createMethodMock).not.toHaveBeenCalled();
      expect(updateMethodMock).not.toHaveBeenCalled();
    });
  });
});
