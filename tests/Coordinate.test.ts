import { createCoordinate } from '@/Coordinate';
import { ItemTypeArray } from '@fjell/core';

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
