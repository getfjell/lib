import { describe, expect, it } from 'vitest';
import { buildReference, ReferenceDefinition } from '../../src/processing/ReferenceBuilder';

describe('ReferenceBuilder', () => {
  describe('buildReference', () => {
    it('should throw deprecation error when called', async () => {
      const item = {
        key: { kt: 'task', pk: 'task1' },
        title: 'Test Task'
      };

      const referenceDef: ReferenceDefinition = {
        kta: ['user']
      };

      await expect(buildReference(item, referenceDef, {} as any, undefined)).rejects.toThrow(
        'buildReference() from @fjell/lib is deprecated and no longer functional'
      );
    });

    it('should reference implementation-specific builders in error message', async () => {
      const item = {};
      const referenceDef: ReferenceDefinition = { kta: ['test'] };

      await expect(buildReference(item, referenceDef, {} as any, undefined)).rejects.toThrow(
        'buildSequelizeReference'
      );
      
      await expect(buildReference(item, referenceDef, {} as any, undefined)).rejects.toThrow(
        'buildFirestoreReference'
      );
    });
  });

  describe('ReferenceDefinition', () => {
    it('should only have kta field', () => {
      const def: ReferenceDefinition = {
        kta: ['user']
      };

      expect(def.kta).toEqual(['user']);
      expect(Object.keys(def)).toEqual(['kta']);
    });

    it('should support multiple key types', () => {
      const def: ReferenceDefinition = {
        kta: ['organization', 'department']
      };

      expect(def.kta).toHaveLength(2);
      expect(def.kta).toContain('organization');
      expect(def.kta).toContain('department');
    });
  });
});
