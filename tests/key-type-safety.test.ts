 
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComKey, PriKey } from '@fjell/core';
import { wrapGetOperation } from '../src/ops/get';
import { Operations } from '../src/Operations';
import { Options } from '../src/Options';
import { Coordinate } from '@fjell/core';
import { Registry } from '../src/Registry';

describe('Key Type Safety for get() Operations', () => {
  describe('Primary Item Library', () => {
    let mockOperations: Operations<any, 'documents'>;
    let mockOptions: Options<any, 'documents'>;
    let mockCoordinate: Coordinate<'documents'>;
    let mockRegistry: Registry;
    let wrappedGet: (key: PriKey<'documents'> | ComKey<'documents'>) => Promise<any>;

    beforeEach(() => {
      // Setup a primary library (no location types)
      mockCoordinate = {
        kta: ['documents'],
        system: 'test-system',
        name: 'documents',
        scopes: [],
      } as Coordinate<'documents'>;

      mockRegistry = {
        type: 'lib',
      } as Registry;

      mockOptions = {} as Options<any, 'documents'>;

      mockOperations = {
        get: vi.fn().mockResolvedValue({ kt: 'documents', pk: 'doc-1', name: 'Test Doc', key: { kt: 'documents', pk: 'doc-1' } }),
      } as any;

      wrappedGet = wrapGetOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);
    });

    it('should accept a valid PriKey', async () => {
      const key: PriKey<'documents'> = { kt: 'documents', pk: 'doc-1' };
      const result = await wrappedGet(key);
      expect(result).toEqual({ kt: 'documents', pk: 'doc-1', name: 'Test Doc', key: { kt: 'documents', pk: 'doc-1' } });
      expect(mockOperations.get).toHaveBeenCalledWith(key);
    });

    it('should reject a ComKey with InvalidKeyTypeError', async () => {
      const key: ComKey<'documents', 'sections'> = {
        kt: 'documents',
        pk: 'doc-1',
        loc: [{ kt: 'sections', lk: 'section-1' }],
      };
      
      try {
        await wrappedGet(key);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        // Check if error is direct or wrapped
        const actualError = error.cause || error;
        expect(actualError.message).toContain('Invalid key type for get operation');
        expect(actualError.message).toContain('This is a primary item library');
        expect(actualError.message).toContain('PriKey with format');
        expect(actualError.message).toContain('Received: ComKey');
      }
    });

    it('should reject invalid key structures', async () => {
      const invalidKey = { kt: 'documents' }; // missing pk

      try {
        await wrappedGet(invalidKey as any);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        const actualError = error.cause || error;
        expect(actualError.message).toContain('Invalid key');
      }
    });

    it('should reject string values as keys', async () => {
      const invalidKey = 'doc-1';
      
      try {
        await wrappedGet(invalidKey as any);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        const actualError = error.cause || error;
        expect(actualError.message).toContain('Invalid key');
      }
    });
  });

  describe('Composite Item Library', () => {
    let mockOperations: Operations<any, 'annotations', 'documents'>;
    let mockOptions: Options<any, 'annotations', 'documents'>;
    let mockCoordinate: Coordinate<'annotations', 'documents'>;
    let mockRegistry: Registry;
    let wrappedGet: (key: PriKey<'annotations'> | ComKey<'annotations', 'documents'>) => Promise<any>;

    beforeEach(() => {
      // Setup a composite library (has location types)
      mockCoordinate = {
        kta: ['annotations', 'documents'],
        system: 'test-system',
        name: 'annotations',
        scopes: [],
      } as Coordinate<'annotations', 'documents'>;

      mockRegistry = {
        type: 'lib',
      } as Registry;

      mockOptions = {} as Options<any, 'annotations', 'documents'>;

      mockOperations = {
        get: vi.fn().mockResolvedValue({
          kt: 'annotations',
          pk: 'anno-1',
          loc: [{ kt: 'documents', lk: 'doc-1' }],
          content: 'Test annotation',
          key: { kt: 'annotations', pk: 'anno-1', loc: [{ kt: 'documents', lk: 'doc-1' }] },
        }),
      } as any;

      wrappedGet = wrapGetOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);
    });

    it('should accept a valid ComKey', async () => {
      const key: ComKey<'annotations', 'documents'> = {
        kt: 'annotations',
        pk: 'anno-1',
        loc: [{ kt: 'documents', lk: 'doc-1' }],
      };

      const result = await wrappedGet(key);
      expect(result).toEqual({
        kt: 'annotations',
        pk: 'anno-1',
        loc: [{ kt: 'documents', lk: 'doc-1' }],
        content: 'Test annotation',
        key: { kt: 'annotations', pk: 'anno-1', loc: [{ kt: 'documents', lk: 'doc-1' }] },
      });
      expect(mockOperations.get).toHaveBeenCalledWith(key);
    });

    it('should reject a PriKey with InvalidKeyTypeError', async () => {
      const key: PriKey<'annotations'> = { kt: 'annotations', pk: 'anno-1' };
      
      try {
        await wrappedGet(key);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        const actualError = error.cause || error;
        expect(actualError.message).toContain('Invalid key type for get operation');
        expect(actualError.message).toContain('This is a composite item library');
        expect(actualError.message).toContain('ComKey with format');
        expect(actualError.message).toContain('Received: PriKey');
      }
    });

    it('should show helpful error message with correct key types', async () => {
      const key: PriKey<'annotations'> = { kt: 'annotations', pk: 'anno-1' };

      try {
        await wrappedGet(key);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        const actualError = error.cause || error;
        const message = actualError.message;
        
        // Verify the error message includes all the helpful information
        expect(message).toContain('ComKey with format');
        expect(message).toContain('Received: PriKey');
      }
    });
  });

  describe('Error Message Quality', () => {
    it('should provide clear guidance for composite library misuse', async () => {
      const mockCoordinate: Coordinate<'annotations', 'documents', 'sections'> = {
        kta: ['annotations', 'documents', 'sections'],
        system: 'test-system',
        name: 'annotations',
      } as any;

      const mockRegistry = { type: 'lib' } as Registry;
      const mockOptions = {} as Options<any, 'annotations', 'documents', 'sections'>;
      const mockOperations = {
        get: vi.fn(),
      } as any;

      const wrappedGet = wrapGetOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);
      const key: PriKey<'annotations'> = { kt: 'annotations', pk: 'anno-1' };

      try {
        await wrappedGet(key);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const message = (error as Error).message;
        
        // Should mention all location types
        expect(message).toContain('documents');
        expect(message).toContain('sections');
        expect(message).toContain('ComKey with format');
      }
    });

    it('should handle completely invalid key objects', async () => {
      const mockCoordinate: Coordinate<'documents'> = {
        kta: ['documents'],
        system: 'test-system',
        name: 'documents',
      } as any;

      const mockRegistry = { type: 'lib' } as Registry;
      const mockOptions = {} as Options<any, 'documents'>;
      const mockOperations = {
        get: vi.fn(),
      } as any;

      const wrappedGet = wrapGetOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);
      const invalidKey = { foo: 'bar' };

      try {
        await wrappedGet(invalidKey as any);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        const actualError = error.cause || error;
        const message = actualError.message;
        expect(message).toContain('Invalid key');
      }
    });
  });

  describe('Location Key Order Validation', () => {
    describe('Two-Level Hierarchy', () => {
      let mockOperations: Operations<any, 'annotations', 'documents'>;
      let mockOptions: Options<any, 'annotations', 'documents'>;
      let mockCoordinate: Coordinate<'annotations', 'documents'>;
      let mockRegistry: Registry;
      let wrappedGet: (key: PriKey<'annotations'> | ComKey<'annotations', 'documents'>) => Promise<any>;

      beforeEach(() => {
        // Setup: annotations contained in documents
        mockCoordinate = {
          kta: ['annotations', 'documents'],
          system: 'test-system',
          name: 'annotations',
          scopes: [],
        } as Coordinate<'annotations', 'documents'>;

        mockRegistry = {
          type: 'lib',
        } as Registry;

        mockOptions = {} as Options<any, 'annotations', 'documents'>;

        mockOperations = {
          get: vi.fn().mockResolvedValue({
            kt: 'annotations',
            pk: 'anno-1',
            loc: [{ kt: 'documents', lk: 'doc-1' }],
            key: { kt: 'annotations', pk: 'anno-1', loc: [{ kt: 'documents', lk: 'doc-1' }] },
          }),
        } as any;

        wrappedGet = wrapGetOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);
      });

      it('should accept correct location key order', async () => {
        const key: ComKey<'annotations', 'documents'> = {
          kt: 'annotations',
          pk: 'anno-1',
          loc: [{ kt: 'documents', lk: 'doc-1' }],
        };

        const result = await wrappedGet(key);
        expect(result.kt).toBe('annotations');
        expect(mockOperations.get).toHaveBeenCalledWith(key);
      });

      it('should reject incorrect location key types', async () => {
        // Wrong: using 'sections' instead of 'documents'
        const key: ComKey<'annotations', 'sections'> = {
          kt: 'annotations',
          pk: 'anno-1',
          loc: [{ kt: 'sections', lk: 'section-1' }],
        } as any; // Cast to bypass TypeScript
        
        try {
          await wrappedGet(key as any);
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          const actualError = error.cause || error;
          expect(actualError.message).toContain('Location key array order mismatch');
        }
      });
    });

    describe('Three-Level Hierarchy', () => {
      let mockOperations: Operations<any, 'comments', 'documents', 'annotations'>;
      let mockOptions: Options<any, 'comments', 'documents', 'annotations'>;
      let mockCoordinate: Coordinate<'comments', 'documents', 'annotations'>;
      let mockRegistry: Registry;
      let wrappedGet: (key: ComKey<'comments', 'documents', 'annotations'>) => Promise<any>;

      beforeEach(() => {
        // Setup: comments contained in annotations contained in documents
        mockCoordinate = {
          kta: ['comments', 'documents', 'annotations'],
          system: 'test-system',
          name: 'comments',
          scopes: [],
        } as Coordinate<'comments', 'documents', 'annotations'>;

        mockRegistry = {
          type: 'lib',
        } as Registry;

        mockOptions = {} as Options<any, 'comments', 'documents', 'annotations'>;

        mockOperations = {
          get: vi.fn().mockResolvedValue({
            kt: 'comments',
            pk: 'comment-1',
            loc: [
              { kt: 'documents', lk: 'doc-1' },
              { kt: 'annotations', lk: 'anno-1' },
            ],
            key: { kt: 'comments', pk: 'comment-1', loc: [{ kt: 'documents', lk: 'doc-1' }, { kt: 'annotations', lk: 'anno-1' }] },
          }),
        } as any;

        wrappedGet = wrapGetOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);
      });

      it('should accept correct location key order', async () => {
        const key: ComKey<'comments', 'documents', 'annotations'> = {
          kt: 'comments',
          pk: 'comment-1',
          loc: [
            { kt: 'documents', lk: 'doc-1' },
            { kt: 'annotations', lk: 'anno-1' },
          ],
        };

        const result = await wrappedGet(key);
        expect(result.kt).toBe('comments');
        expect(mockOperations.get).toHaveBeenCalledWith(key);
      });

      it('should reject reversed location key order', async () => {
        // Wrong: reversed order (annotations first, then documents)
        const key: ComKey<'comments', 'annotations', 'documents'> = {
          kt: 'comments',
          pk: 'comment-1',
          loc: [
            { kt: 'annotations', lk: 'anno-1' },
            { kt: 'documents', lk: 'doc-1' },
          ],
        } as any;
        
        try {
          await wrappedGet(key as any);
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          const actualError = error.cause || error;
          expect(actualError.message).toContain('Location key array order mismatch');
        }
      });

      it('should reject missing location keys', async () => {
        // Wrong: only one location key when two are expected
        const key = {
          kt: 'comments',
          pk: 'comment-1',
          loc: [
            { kt: 'documents', lk: 'doc-1' },
          ],
        } as any;
        
        try {
          await wrappedGet(key);
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          const actualError = error.cause || error;
          expect(actualError.message).toContain('Location key array length mismatch');
        }
      });

      it('should reject extra location keys', async () => {
        // Wrong: three location keys when two are expected
        const key = {
          kt: 'comments',
          pk: 'comment-1',
          loc: [
            { kt: 'documents', lk: 'doc-1' },
            { kt: 'annotations', lk: 'anno-1' },
            { kt: 'sections', lk: 'section-1' },
          ],
        } as any;
        
        try {
          await wrappedGet(key);
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          const actualError = error.cause || error;
          expect(actualError.message).toContain('Location key array length mismatch');
        }
      });
    });

    describe('Error Message Quality', () => {
      it('should provide clear hierarchy explanation', async () => {
        const mockCoordinate: Coordinate<'comments', 'documents', 'annotations'> = {
          kta: ['comments', 'documents', 'annotations'],
          system: 'test-system',
          name: 'comments',
        } as any;

        const mockRegistry = { type: 'lib' } as Registry;
        const mockOptions = {} as Options<any, 'comments', 'documents', 'annotations'>;
        const mockOperations = { get: vi.fn() } as any;

        const wrappedGet = wrapGetOperation(mockOperations, mockOptions, mockCoordinate, mockRegistry);
        
        const key = {
          kt: 'comments',
          pk: 'comment-1',
          loc: [
            { kt: 'annotations', lk: 'anno-1' },
            { kt: 'documents', lk: 'doc-1' },
          ],
        } as any;

        try {
          await wrappedGet(key);
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          const actualError = error.cause || error;
          const message = actualError.message;
          
          // Should explain the hierarchy
          expect(message).toContain('Location key array order mismatch');
        }
      });
    });
  });
});

