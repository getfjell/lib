import { describe, expect, it } from 'vitest';
import { createCoordinate } from '@fjell/core';
import {
  InvalidKeyTypeError,
  LibError,
  LocationKeyOrderError,
  NotUpdatedError
} from '../src/errors';

describe('Error Classes - Extended Coverage', () => {
  describe('InvalidKeyTypeError', () => {
    describe('Primary Library Errors', () => {
      it('should handle string key type', () => {
        const coordinate = createCoordinate(['document']);
        const error = new InvalidKeyTypeError(
          'get',
          coordinate,
          'doc-123',  // string key
          false  // primary library
        );

        expect(error.message).toContain('Invalid key type for get operation');
        expect(error.message).toContain('Expected: PriKey with format');
        expect(error.message).toContain('Received: a string value');
        expect(error.message).toContain('This is a primary item library');
      });

      it('should handle number key type', () => {
        const coordinate = createCoordinate(['document']);
        const error = new InvalidKeyTypeError(
          'update',
          coordinate,
          12345,  // number key
          false
        );

        expect(error.message).toContain('Invalid key type for update operation');
        expect(error.message).toContain('Received: a number value');
        expect(error.message).toContain('12345');
      });

      it('should handle invalid object type', () => {
        const coordinate = createCoordinate(['document']);
        const error = new InvalidKeyTypeError(
          'remove',
          coordinate,
          { foo: 'bar' },  // invalid object
          false
        );

        expect(error.message).toContain('Invalid key type for remove operation');
        expect(error.message).toContain('Received: an object');
        expect(error.message).toContain('foo');
      });

      it('should handle ComKey received when PriKey expected', () => {
        const coordinate = createCoordinate(['document']);
        const error = new InvalidKeyTypeError(
          'get',
          coordinate,
          { kt: 'document', pk: 'doc-1', loc: [{ kt: 'section', lk: 'sec-1' }] },  // ComKey
          false  // but expecting PriKey
        );

        expect(error.message).toContain('Invalid key type for get operation');
        expect(error.message).toContain('Expected: PriKey with format');
        expect(error.message).toContain('Received: ComKey');
        expect(error.message).toContain('This is a primary item library');
        expect(error.message).toContain('library.operations.get({ kt: \'document\', pk: \'item-id\' })');
      });

      it('should handle undefined key type', () => {
        const coordinate = createCoordinate(['document']);
        const error = new InvalidKeyTypeError(
          'get',
          coordinate,
          undefined,
          false
        );

        expect(error.message).toContain('Invalid key type for get operation');
        expect(error.message).toContain('Received: undefined');
      });

      it('should handle null key type', () => {
        const coordinate = createCoordinate(['document']);
        const error = new InvalidKeyTypeError(
          'get',
          coordinate,
          null,
          false
        );

        expect(error.message).toContain('Invalid key type for get operation');
        expect(error.message).toContain('Received: object');
      });
    });

    describe('Composite Library Errors', () => {
      it('should handle PriKey received when ComKey expected - single level', () => {
        const coordinate = createCoordinate(['annotation', 'document']);
        const error = new InvalidKeyTypeError(
          'get',
          coordinate,
          { kt: 'annotation', pk: 'anno-1' },  // PriKey
          true  // but expecting ComKey
        );

        expect(error.message).toContain('Invalid key type for get operation');
        expect(error.message).toContain('Expected: ComKey with format');
        expect(error.message).toContain('{ kt: \'document\', lk: string|number }');
        expect(error.message).toContain('Received: PriKey');
        expect(error.message).toContain('This is a composite item library');
        expect(error.message).toContain('library.operations.get');
        expect(error.message).toContain('annotation');
        expect(error.message).toContain('document');
      });

      it('should handle string key for composite library', () => {
        const coordinate = createCoordinate(['comment', 'document', 'annotation']);
        const error = new InvalidKeyTypeError(
          'action',
          coordinate,
          'comment-123',  // string key
          true  // composite library
        );

        expect(error.message).toContain('Invalid key type for action operation');
        expect(error.message).toContain('Expected: ComKey with format');
        expect(error.message).toContain('{ kt: \'document\', lk: string|number }');
        expect(error.message).toContain('{ kt: \'annotation\', lk: string|number }');
        expect(error.message).toContain('Received: a string value');
        expect(error.message).toContain('This is a composite item library');
      });

      it('should format multi-level hierarchy correctly', () => {
        const coordinate = createCoordinate(['item', 'level1', 'level2', 'level3']);
        const error = new InvalidKeyTypeError(
          'update',
          coordinate,
          12345,
          true
        );

        expect(error.message).toContain('{ kt: \'level1\', lk: string|number }');
        expect(error.message).toContain('{ kt: \'level2\', lk: string|number }');
        expect(error.message).toContain('{ kt: \'level3\', lk: string|number }');
      });

      it('should handle invalid object for composite library', () => {
        const coordinate = createCoordinate(['annotation', 'document']);
        const error = new InvalidKeyTypeError(
          'remove',
          coordinate,
          { invalid: 'structure' },
          true
        );

        expect(error.message).toContain('Invalid key type for remove operation');
        expect(error.message).toContain('Expected: ComKey with format');
        expect(error.message).toContain('Received: an object');
        expect(error.message).toContain('invalid');
      });
    });

    describe('Error Metadata', () => {
      it('should preserve cause error', () => {
        const coordinate = createCoordinate(['document']);
        const cause = new Error('Original validation error');
        const error = new InvalidKeyTypeError(
          'get',
          coordinate,
          'invalid-key',
          false,
          { cause }
        );

        expect(error.cause).toBe(cause);
      });

      it('should be instance of LibError', () => {
        const coordinate = createCoordinate(['document']);
        const error = new InvalidKeyTypeError(
          'get',
          coordinate,
          'invalid-key',
          false
        );

        expect(error).toBeInstanceOf(LibError);
        expect(error).toBeInstanceOf(InvalidKeyTypeError);
      });
    });
  });

  describe('LocationKeyOrderError', () => {
    describe('Two-Level Hierarchy Errors', () => {
      it('should detect wrong order in two-level hierarchy', () => {
        const coordinate = createCoordinate(['annotation', 'document']);
        const error = new LocationKeyOrderError(
          'get',
          coordinate,
          {
            kt: 'annotation',
            pk: 'anno-1',
            loc: [
              { kt: 'section', lk: 'sec-1' }  // Wrong: should be 'document'
            ]
          }
        );

        expect(error.message).toContain('Location key array order mismatch');
        expect(error.message).toContain('Expected location key order for \'annotation\'');
        expect(error.message).toContain('[0] { kt: \'document\', lk: <value> }');
        expect(error.message).toContain('[0] { kt: \'section\', lk: "sec-1" }');
        expect(error.message).toContain('Position 0: Expected \'document\' but got \'section\'');
      });

      it('should detect missing location keys', () => {
        const coordinate = createCoordinate(['comment', 'document', 'annotation']);
        const error = new LocationKeyOrderError(
          'update',
          coordinate,
          {
            kt: 'comment',
            pk: 'comment-1',
            loc: [
              { kt: 'document', lk: 'doc-1' }
              // Missing annotation
            ]
          }
        );

        expect(error.message).toContain('Location key array order mismatch');
        expect(error.message).toContain('Position 1: Missing location key with type \'annotation\'');
      });

      it('should detect extra location keys', () => {
        const coordinate = createCoordinate(['annotation', 'document']);
        const error = new LocationKeyOrderError(
          'remove',
          coordinate,
          {
            kt: 'annotation',
            pk: 'anno-1',
            loc: [
              { kt: 'document', lk: 'doc-1' },
              { kt: 'section', lk: 'sec-1' }  // Extra
            ]
          }
        );

        expect(error.message).toContain('Location key array order mismatch');
        expect(error.message).toContain('Position 1: Unexpected location key with type \'section\'');
      });
    });

    describe('Three-Level Hierarchy Errors', () => {
      it('should handle reversed order in three-level hierarchy', () => {
        const coordinate = createCoordinate(['comment', 'document', 'annotation']);
        const error = new LocationKeyOrderError(
          'get',
          coordinate,
          {
            kt: 'comment',
            pk: 'comment-1',
            loc: [
              { kt: 'annotation', lk: 'anno-1' },  // Should be document
              { kt: 'document', lk: 'doc-1' }      // Should be annotation
            ]
          }
        );

        expect(error.message).toContain('Location key array order mismatch');
        expect(error.message).toContain('Position 0: Expected \'document\' but got \'annotation\'');
        expect(error.message).toContain('Position 1: Expected \'annotation\' but got \'document\'');
      });

      it('should show complete hierarchy understanding', () => {
        const coordinate = createCoordinate(['item', 'level1', 'level2']);
        const error = new LocationKeyOrderError(
          'facet',
          coordinate,
          {
            kt: 'item',
            pk: 'item-1',
            loc: [
              { kt: 'wrong1', lk: 'w1' },
              { kt: 'wrong2', lk: 'w2' }
            ]
          }
        );

        expect(error.message).toContain('Understanding the hierarchy');
        expect(error.message).toContain('\'item\' is the primary item type');
        expect(error.message).toContain('\'item\' items are contained in \'level1\'');
        expect(error.message).toContain('\'level1\' items are contained in \'level2\'');
      });
    });

    describe('Error Message Quality', () => {
      it('should provide correct usage example', () => {
        const coordinate = createCoordinate(['annotation', 'document', 'section']);
        const error = new LocationKeyOrderError(
          'action',
          coordinate,
          {
            kt: 'annotation',
            pk: 'anno-1',
            loc: []
          }
        );

        expect(error.message).toContain('Correct example:');
        expect(error.message).toContain('library.operations.action({');
        expect(error.message).toContain('kt: \'annotation\'');
        expect(error.message).toContain('pk: \'item-id\'');
        expect(error.message).toContain('{ kt: \'document\', lk: \'parent-id\' }');
        expect(error.message).toContain('{ kt: \'section\', lk: \'parent-id\' }');
      });

      it('should preserve cause error', () => {
        const coordinate = createCoordinate(['annotation', 'document']);
        const cause = new Error('Original validation error');
        const error = new LocationKeyOrderError(
          'get',
          coordinate,
          {
            kt: 'annotation',
            pk: 'anno-1',
            loc: [{ kt: 'wrong', lk: 'w1' }]
          },
          { cause }
        );

        expect(error.cause).toBe(cause);
      });

      it('should be instance of LibError', () => {
        const coordinate = createCoordinate(['annotation', 'document']);
        const error = new LocationKeyOrderError(
          'get',
          coordinate,
          {
            kt: 'annotation',
            pk: 'anno-1',
            loc: [{ kt: 'wrong', lk: 'w1' }]
          }
        );

        expect(error).toBeInstanceOf(LibError);
        expect(error).toBeInstanceOf(LocationKeyOrderError);
      });
    });

    describe('Four and Five Level Hierarchies', () => {
      it('should handle four-level hierarchy errors', () => {
        const coordinate = createCoordinate(['item', 'l1', 'l2', 'l3']);
        const error = new LocationKeyOrderError(
          'update',
          coordinate,
          {
            kt: 'item',
            pk: 'item-1',
            loc: [
              { kt: 'l1', lk: '1' },
              { kt: 'wrong', lk: '2' },
              { kt: 'l3', lk: '3' }
            ]
          }
        );

        expect(error.message).toContain('Position 1: Expected \'l2\' but got \'wrong\'');
        expect(error.message).toContain('[0] { kt: \'l1\', lk: <value> }');
        expect(error.message).toContain('[1] { kt: \'l2\', lk: <value> }');
        expect(error.message).toContain('[2] { kt: \'l3\', lk: <value> }');
      });

      it('should handle five-level hierarchy errors', () => {
        const coordinate = createCoordinate(['item', 'l1', 'l2', 'l3', 'l4']);
        const error = new LocationKeyOrderError(
          'get',
          coordinate,
          {
            kt: 'item',
            pk: 'item-1',
            loc: [
              { kt: 'l4', lk: '4' },
              { kt: 'l3', lk: '3' },
              { kt: 'l2', lk: '2' },
              { kt: 'l1', lk: '1' }
            ]
          }
        );

        expect(error.message).toContain('Position 0: Expected \'l1\' but got \'l4\'');
        expect(error.message).toContain('Position 1: Expected \'l2\' but got \'l3\'');
        expect(error.message).toContain('Position 2: Expected \'l3\' but got \'l2\'');
        expect(error.message).toContain('Position 3: Expected \'l4\' but got \'l1\'');
      });
    });
  });

  describe('NotUpdatedError', () => {
    it('should format PriKey correctly', () => {
      const coordinate = createCoordinate(['document']);
      const error = new NotUpdatedError(
        'update',
        coordinate,
        { kt: 'document', pk: 'doc-123' }
      );

      expect(error.message).toContain('Item not updated for key');
      expect(error.message).toContain('document');
      expect(error.message).toContain('doc-123');
    });

    it('should format ComKey correctly', () => {
      const coordinate = createCoordinate(['annotation', 'document']);
      const error = new NotUpdatedError(
        'update',
        coordinate,
        {
          kt: 'annotation',
          pk: 'anno-1',
          loc: [{ kt: 'document', lk: 'doc-1' }]
        }
      );

      expect(error.message).toContain('Item not updated for key');
      expect(error.message).toContain('annotation');
      expect(error.message).toContain('anno-1');
    });

    it('should preserve cause error', () => {
      const coordinate = createCoordinate(['document']);
      const cause = new Error('Database connection failed');
      const error = new NotUpdatedError(
        'update',
        coordinate,
        { kt: 'document', pk: 'doc-123' },
        { cause }
      );

      expect(error.cause).toBe(cause);
    });

    it('should be instance of LibError', () => {
      const coordinate = createCoordinate(['document']);
      const error = new NotUpdatedError(
        'update',
        coordinate,
        { kt: 'document', pk: 'doc-123' }
      );

      expect(error).toBeInstanceOf(LibError);
      expect(error).toBeInstanceOf(NotUpdatedError);
    });
  });
});

