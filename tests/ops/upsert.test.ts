import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { createCoordinate } from '@/Coordinate';
import { createRegistry, NotFoundError, Operations } from '@/index';
import { wrapUpsertOperation } from '@/ops/upsert';
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
vi.mock('@/ops/create');
vi.mock('@/ops/update');

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
      const testItem = { name: 'newItem' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'newItem' } as Partial<Item<'test'>>;
      const coordinate = createCoordinate<'test'>(['test'], []);

      getMethodMock.mockImplementation(() => {
        throw new NotFoundError('get', coordinate, key, {});
      });
      createMethodMock.mockResolvedValueOnce({ ...testItem, action: 'created' } as Item<'test'>);
      updateMethodMock.mockResolvedValueOnce({ ...testItem, action: 'updated' } as Item<'test'>);

      const registry = createRegistry();
      const result = await wrapUpsertOperation(operations, registry)(key, itemProperties);
      expect(result).toBeDefined();
      expect(result.action).toBe('updated');
      expect(getMethodMock).toHaveBeenCalled();
      expect(createMethodMock).toHaveBeenCalled();
      expect(updateMethodMock).toHaveBeenCalled();
    });

    test('should update new item if exists', async () => {
      const testItem = { name: 'newItem' } as unknown as Item<'test'>;
      const key = { kt: 'test', pk: randomUUID() } as PriKey<'test'>;
      const itemProperties = { name: 'newItem' } as Partial<Item<'test'>>;

      getMethodMock.mockResolvedValueOnce(testItem);
      updateMethodMock.mockResolvedValueOnce({ ...testItem, action: 'updated' } as Item<'test'>);

      const registry = createRegistry();
      const result = await wrapUpsertOperation(operations, registry)(key, itemProperties);
      expect(result).toBeDefined();
      expect(result.action).toBe('updated');
      expect(getMethodMock).toHaveBeenCalled();
      expect(createMethodMock).not.toHaveBeenCalled();
      expect(updateMethodMock).toHaveBeenCalled();
    });
  });
});
