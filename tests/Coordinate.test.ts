import { describe, expect, test, vi } from 'vitest';
import { createCoordinate } from '@/Coordinate';
import { ItemTypeArray } from '@fjell/core';

vi.mock('@fjell/logging', () => {
  const logger = {
    get: vi.fn().mockReturnThis(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    emergency: vi.fn(),
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

describe('Coordinate', () => {
  describe('createCoordinate', () => {
    test('should create coordinate with single type array and empty scopes', () => {
      const kta = ['test'] as ItemTypeArray<'test'>;
      const scopes: string[] = [];

      const coordinate = createCoordinate(kta, scopes);

      expect(coordinate).toBeDefined();
      expect(coordinate.kta).toEqual(kta);
      expect(coordinate.scopes).toEqual(scopes);
    });

    test('should create coordinate with multiple type arrays and scopes', () => {
      const kta = ['test', 'other'] as ItemTypeArray<'test', 'other'>;
      const scopes = ['scope1', 'scope2'];

      const coordinate = createCoordinate(kta, scopes);

      expect(coordinate).toBeDefined();
      expect(coordinate.kta).toEqual(kta);
      expect(coordinate.scopes).toEqual(scopes);
    });

    test('toString should return formatted string representation', () => {
      const kta = ['test', 'other'] as ItemTypeArray<'test', 'other'>;
      const scopes = ['scope1', 'scope2'];

      const coordinate = createCoordinate(kta, scopes);
      const expected = 'test, other - scope1, scope2';

      expect(coordinate.toString()).toBe(expected);
    });

    test('toString should handle empty scopes correctly', () => {
      const kta = ['test'] as ItemTypeArray<'test'>;
      const scopes: string[] = [];

      const coordinate = createCoordinate(kta, scopes);
      const expected = 'test - ';

      expect(coordinate.toString()).toBe(expected);
    });
  });
});
