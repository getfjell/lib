import { describe, expect, test } from 'vitest';
import { CreateValidationError, HookError, NotFoundError, NotUpdatedError, RemoveError, RemoveValidationError, UpdateError, UpdateValidationError, ValidationError } from '../src/errors';
import { createCoordinate } from '@fjell/core';
import { ComKey, PriKey } from '@fjell/core';

describe('Error Classes', () => {
  const coordinate = createCoordinate(['test'], ['scope1']);
  const priKey: PriKey<'test'> = { kt: 'test', pk: 'test-id-123' };
  const comKey: ComKey<'test', 'loc1'> = {
    kt: 'test',
    pk: 'test-id-456',
    lks: [{ kt: 'loc1', lk: 'loc-1' }]
  };

  describe('NotUpdatedError', () => {
    test('should create NotUpdatedError with PriKey', () => {
      const error = new NotUpdatedError('update', coordinate, priKey);
      
      expect(error).toBeInstanceOf(NotUpdatedError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('Item not updated for key');
      expect(error.message).toContain('test:test-id-123');
    });

    test('should create NotUpdatedError with ComKey', () => {
      const error = new NotUpdatedError('update', coordinate, comKey);
      
      expect(error).toBeInstanceOf(NotUpdatedError);
      expect(error.message).toContain('Item not updated for key');
      expect(error.message).toContain('test:test-id-456');
    });

    test('should accept cause option', () => {
      const cause = new Error('Original error');
      const error = new NotUpdatedError('update', coordinate, priKey, { cause });
      
      expect(error).toBeInstanceOf(NotUpdatedError);
      expect(error.cause).toBe(cause);
    });
  });

  describe('NotFoundError', () => {
    test('should create NotFoundError with PriKey', () => {
      const error = new NotFoundError('get', coordinate, priKey);
      
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toContain('Item not found for key');
    });

    test('should create NotFoundError with cause', () => {
      const cause = new Error('Database error');
      const error = new NotFoundError('get', coordinate, priKey, { cause });
      
      expect(error.cause).toBe(cause);
    });
  });

  describe('ValidationError', () => {
    test('should create ValidationError', () => {
      const error = new ValidationError('Validation failed', 'create', coordinate);
      
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain('Validation failed');
    });

    test('should create ValidationError with cause', () => {
      const cause = new Error('Invalid data');
      const error = new ValidationError('Validation failed', 'create', coordinate, { cause });
      
      expect(error.cause).toBe(cause);
    });
  });

  describe('CreateValidationError', () => {
    test('should create CreateValidationError with item and key', () => {
      const item = { name: 'test' };
      const error = new CreateValidationError(
        { item, options: { key: priKey } },
        coordinate
      );
      
      expect(error).toBeInstanceOf(CreateValidationError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain('Create Validation Failed');
    });

    test('should create CreateValidationError with item and locations', () => {
      const item = { name: 'test' };
      const locations = [{ kt: 'loc1', lk: 'loc-1' }];
      const error = new CreateValidationError(
        { item, options: { locations: locations as any } },
        coordinate
      );
      
      expect(error).toBeInstanceOf(CreateValidationError);
      expect(error.message).toContain('Create Validation Failed');
    });

    test('should create CreateValidationError with cause', () => {
      const item = { name: 'test' };
      const cause = new Error('Invalid value');
      const error = new CreateValidationError(
        { item, options: { key: priKey } },
        coordinate,
        { cause }
      );
      
      expect(error.cause).toBe(cause);
    });
  });

  describe('UpdateValidationError', () => {
    test('should create UpdateValidationError', () => {
      const item = { name: 'updated' };
      const error = new UpdateValidationError(
        { item, key: priKey },
        coordinate
      );
      
      expect(error).toBeInstanceOf(UpdateValidationError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain('Update Validation Failed');
    });

    test('should create UpdateValidationError with cause', () => {
      const item = { name: 'updated' };
      const cause = new Error('Invalid update');
      const error = new UpdateValidationError(
        { item, key: priKey },
        coordinate,
        { cause }
      );
      
      expect(error.cause).toBe(cause);
    });
  });

  describe('RemoveValidationError', () => {
    test('should create RemoveValidationError', () => {
      const error = new RemoveValidationError(
        { key: priKey },
        coordinate
      );
      
      expect(error).toBeInstanceOf(RemoveValidationError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain('Remove Validation Failed');
    });

    test('should create RemoveValidationError with cause', () => {
      const cause = new Error('Cannot remove');
      const error = new RemoveValidationError(
        { key: priKey },
        coordinate,
        { cause }
      );
      
      expect(error.cause).toBe(cause);
    });
  });

  describe('UpdateError', () => {
    test('should create UpdateError', () => {
      const item = { name: 'test' };
      const error = new UpdateError(
        { item, key: priKey },
        coordinate
      );
      
      expect(error).toBeInstanceOf(UpdateError);
      expect(error.message).toContain('Update Failed');
    });

    test('should create UpdateError with cause', () => {
      const item = { name: 'test' };
      const cause = new Error('Database error');
      const error = new UpdateError(
        { item, key: priKey },
        coordinate,
        { cause }
      );
      
      expect(error.cause).toBe(cause);
    });
  });

  describe('RemoveError', () => {
    test('should create RemoveError', () => {
      const error = new RemoveError(
        { key: priKey },
        coordinate
      );
      
      expect(error).toBeInstanceOf(RemoveError);
      expect(error.message).toContain('Remove Failed');
    });

    test('should create RemoveError with cause', () => {
      const cause = new Error('Database error');
      const error = new RemoveError(
        { key: priKey },
        coordinate,
        { cause }
      );
      
      expect(error.cause).toBe(cause);
    });
  });

  describe('HookError', () => {
    test('should create HookError', () => {
      const error = new HookError(
        'Hook failed',
        'preCreate',
        coordinate
      );
      
      expect(error).toBeInstanceOf(HookError);
      expect(error.message).toContain('Hook failed');
    });

    test('should create HookError with cause', () => {
      const cause = new Error('Hook execution failed');
      const error = new HookError(
        'Hook failed',
        'preCreate',
        coordinate,
        { cause }
      );
      
      expect(error.cause).toBe(cause);
    });
  });
});

