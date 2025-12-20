import { beforeEach, describe, expect, it } from 'vitest';
import { ComKey, PriKey } from "@fjell/types";
import {
  contextManager,
  createOperationContext,
  OperationContext,
  serializeKey
} from '../../src/processing/OperationContext';

describe('OperationContext', () => {
  describe('serializeKey', () => {
    it('should serialize a PriKey', () => {
      const priKey: PriKey<'user'> = { kt: 'user', pk: '123' };
      expect(serializeKey(priKey)).toBe('user:123');
    });

    it('should serialize a ComKey', () => {
      const comKey: ComKey<'user', 'org', 'dept'> = {
        kt: 'user',
        pk: '123',
        loc: [
          { kt: 'org', lk: 'org1' },
          { kt: 'dept', lk: 'dept1' }
        ]
      };
      expect(serializeKey(comKey)).toBe('user:123|org:org1,dept:dept1');
    });

    it('should throw an error for unsupported key types', () => {
      const invalidKey = { invalid: 'key' } as any;
      expect(() => serializeKey(invalidKey)).toThrow('Unsupported key type');
    });
  });

  describe('createOperationContext', () => {
    let context: OperationContext;
    let priKey: PriKey<'user'>;
    let comKey: ComKey<'task', 'user'>;

    beforeEach(() => {
      context = createOperationContext();
      priKey = { kt: 'user', pk: '123' };
      comKey = {
        kt: 'task',
        pk: '456',
        loc: [{ kt: 'user', lk: '123' }]
      };
    });

    describe('markInProgress / isInProgress / markComplete', () => {
      it('should track keys in progress', () => {
        expect(context.isInProgress(priKey)).toBe(false);
        
        context.markInProgress(priKey);
        expect(context.isInProgress(priKey)).toBe(true);
        
        context.markComplete(priKey);
        expect(context.isInProgress(priKey)).toBe(false);
      });

      it('should work with composite keys', () => {
        expect(context.isInProgress(comKey)).toBe(false);
        
        context.markInProgress(comKey);
        expect(context.isInProgress(comKey)).toBe(true);
        
        context.markComplete(comKey);
        expect(context.isInProgress(comKey)).toBe(false);
      });
    });

    describe('setCached / getCached / isCached', () => {
      it('should cache and retrieve items', () => {
        const item = { key: priKey, name: 'Test User' };
        
        expect(context.isCached(priKey)).toBe(false);
        expect(context.getCached(priKey)).toBeUndefined();
        
        context.setCached(priKey, item);
        
        expect(context.isCached(priKey)).toBe(true);
        expect(context.getCached(priKey)).toEqual(item);
      });

      it('should work with composite keys', () => {
        const item = { key: comKey, title: 'Test Task' };
        
        expect(context.isCached(comKey)).toBe(false);
        
        context.setCached(comKey, item);
        
        expect(context.isCached(comKey)).toBe(true);
        expect(context.getCached(comKey)).toEqual(item);
      });
    });

    describe('circular dependency detection', () => {
      it('should detect circular dependencies', () => {
        context.markInProgress(priKey);
        expect(context.isInProgress(priKey)).toBe(true);
        
        // Simulate detecting a circular dependency
        const isCircular = context.isInProgress(priKey);
        expect(isCircular).toBe(true);
      });

      it('should allow same key to be processed after completion', () => {
        context.markInProgress(priKey);
        expect(context.isInProgress(priKey)).toBe(true);
        
        context.markComplete(priKey);
        expect(context.isInProgress(priKey)).toBe(false);
        
        // Should be able to process again
        context.markInProgress(priKey);
        expect(context.isInProgress(priKey)).toBe(true);
      });
    });
  });

  describe('contextManager', () => {
    it('should get current context when set', async () => {
      const context = createOperationContext();
      
      await contextManager.withContext(context, async () => {
        const currentContext = contextManager.getCurrentContext();
        expect(currentContext).toBe(context);
      });
    });

    it('should return undefined when no context is set', () => {
      const currentContext = contextManager.getCurrentContext();
      expect(currentContext).toBeUndefined();
    });

    it('should maintain context across async operations', async () => {
      const context = createOperationContext();
      const priKey: PriKey<'user'> = { kt: 'user', pk: '123' };
      
      await contextManager.withContext(context, async () => {
        // Mark in progress in the context
        context.markInProgress(priKey);
        
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Context should still be accessible
        const currentContext = contextManager.getCurrentContext();
        expect(currentContext).toBe(context);
        expect(currentContext?.isInProgress(priKey)).toBe(true);
      });
    });

    it('should isolate contexts between different async operations', async () => {
      const context1 = createOperationContext();
      const context2 = createOperationContext();
      const priKey: PriKey<'user'> = { kt: 'user', pk: '123' };
      
      const promise1 = contextManager.withContext(context1, async () => {
        context1.markInProgress(priKey);
        await new Promise(resolve => setTimeout(resolve, 20));
        return contextManager.getCurrentContext();
      });
      
      const promise2 = contextManager.withContext(context2, async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return contextManager.getCurrentContext();
      });
      
      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      expect(result1).toBe(context1);
      expect(result2).toBe(context2);
      expect(result1?.isInProgress(priKey)).toBe(true);
      expect(result2?.isInProgress(priKey)).toBe(false);
    });
  });
});

