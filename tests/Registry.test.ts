import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Definition } from '@/Definition';
import { Instance } from '@/Instance';
import { Operations } from '@/Operations';
import { createRegistry, Registry } from '@/Registry';
import { Item } from '@fjell/core';

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
vi.mock('@/logger');

describe('LibRegistry', () => {
  let registry: Registry;

  beforeEach(() => {
    registry = createRegistry();
    vi.clearAllMocks();
  });

  it('should register a library', () => {
    const lib = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;
    // @ts-expect-error
    registry.register(['testLib'], lib);
    expect(registry.get(['testLib'])).toBe(lib);
  });

  it('should return undefined for unregistered library', () => {
    expect(() => registry.get(['nonExistentLib'])).toThrow();
  });

  it('should register and retrieve library with multi-element key array', () => {
    const lib = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;
    // @ts-expect-error
    registry.register(['test', 'nested', 'lib'], lib);
    expect(registry.get(['test', 'nested', 'lib'])).toBe(lib);
  });

  it('should return undefined when partial key array match', () => {
    const lib = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;
    // @ts-expect-error
    registry.register(['test', 'nested', 'lib'], lib);
    expect(() => registry.get(['test', 'nested'])).toThrow();
  });

  it('should handle multiple libraries with different key arrays', () => {
    const lib1 = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;
    const lib2 = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;

    // @ts-expect-error
    registry.register(['test', 'lib1'], lib1);
    // @ts-expect-error
    registry.register(['test', 'lib2'], lib2);

    expect(registry.get(['test', 'lib1'])).toBe(lib1);
    expect(registry.get(['test', 'lib2'])).toBe(lib2);
  });

  it('should handle multiple libraries with very different key arrays', () => {
    const element = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;
    const container = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;
    const region = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;
    const nation = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;

    // @ts-expect-error
    registry.register(['nation'], nation);
    // @ts-expect-error
    registry.register(['region', 'nation'], region);
    // @ts-expect-error
    registry.register(['container', 'region', 'nation'], container);
    // @ts-expect-error
    registry.register(['element', 'container', 'region', 'nation'], element);

    expect(registry.get(['element', 'container', 'region', 'nation'])).toBe(element);
    expect(registry.get(['container', 'region', 'nation'])).toBe(container);
    expect(registry.get(['region', 'nation'])).toBe(region);
    expect(registry.get(['nation'])).toBe(nation);
  });

  it('should handle multiple libraries with very different key arrays', () => {
    const element = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;
    const container = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;
    const region = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;
    const nation = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;

    // @ts-expect-error
    registry.register(['element', 'container', 'region', 'nation'], element);
    // @ts-expect-error
    registry.register(['nation'], nation);
    // @ts-expect-error
    registry.register(['region', 'nation'], region);
    // @ts-expect-error
    registry.register(['container', 'region', 'nation'], container);

    expect(registry.get(['nation'])).toBe(nation);
    expect(registry.get(['element', 'container', 'region', 'nation'])).toBe(element);
    expect(registry.get(['container', 'region', 'nation'])).toBe(container);
    expect(registry.get(['region', 'nation'])).toBe(region);
  });

  it('should handle multiple libraries with different scopes', () => {
    const nationDefault = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;
    const nationFirestore = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;
    const nationSequelize = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;

    // @ts-expect-error
    registry.register(['nation'], nationDefault);
    // @ts-expect-error
    registry.register(['nation'], nationFirestore, { scopes: ['firestore'] });
    // @ts-expect-error
    registry.register(['nation'], nationSequelize, { scopes: ['sequelize'] });

    expect(registry.get(['nation'])).toBe(nationDefault);
    expect(registry.get(['nation'], { scopes: ['firestore'] })).toBe(nationFirestore);
    expect(registry.get(['nation'], { scopes: ['sequelize'] })).toBe(nationSequelize);
  });

  it('should handle multiple libraries with very different key arrays', () => {
    const elementFirestore1 =
      {
        definition: {} as Definition<Item<'test'>, 'test'>,
        operations: {} as Operations<Item<'test'>, 'test'>,
        registry: {} as Registry,
      } as unknown as Instance<Item<'test'>, 'test'>;
    const elementSequelize1 =
      {
        definition: {} as Definition<Item<'test'>, 'test'>,
        operations: {} as Operations<Item<'test'>, 'test'>,
        registry: {} as Registry,
      } as unknown as Instance<Item<'test'>, 'test'>;
    const elementSequelize2 =
      {
        definition: {} as Definition<Item<'test'>, 'test'>,
        operations: {} as Operations<Item<'test'>, 'test'>,
        registry: {} as Registry,
      } as unknown as Instance<Item<'test'>, 'test'>;
    const elementFirestore2 =
      {
        definition: {} as Definition<Item<'test'>, 'test'>,
        operations: {} as Operations<Item<'test'>, 'test'>,
        registry: {} as Registry,
      } as unknown as Instance<Item<'test'>, 'test'>;
    const elementSequelizeBlamo2 =
      {
        definition: {} as Definition<Item<'test'>, 'test'>,
        operations: {} as Operations<Item<'test'>, 'test'>,
        registry: {} as Registry,
      } as unknown as Instance<Item<'test'>, 'test'>;
    const container = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;
    const containerFirestore =
      {
        definition: {} as Definition<Item<'test'>, 'test'>,
        operations: {} as Operations<Item<'test'>, 'test'>,
        registry: {} as Registry,
      } as unknown as Instance<Item<'test'>, 'test'>;
    const containerSequelize =
      {
        definition: {} as Definition<Item<'test'>, 'test'>,
        operations: {} as Operations<Item<'test'>, 'test'>,
        registry: {} as Registry,
      } as unknown as Instance<Item<'test'>, 'test'>;
    const region = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;
    const nation = {
      definition: {} as Definition<Item<'test'>, 'test'>,
      operations: {} as Operations<Item<'test'>, 'test'>,
      registry: {} as Registry,
    } as unknown as Instance<Item<'test'>, 'test'>;

    // @ts-expect-error
    registry.register(['element', 'container', 'region', 'nation'], elementFirestore1, { scopes: ['firestore'] });
    // @ts-expect-error
    registry.register(['element', 'container', 'region', 'nation'], elementSequelize1, { scopes: ['sequelize'] });
    // @ts-expect-error
    registry.register(['element2', 'container', 'region', 'nation'], elementSequelize2, { scopes: ['sequelize'] });
    // @ts-expect-error
    registry.register(['element2', 'container', 'region', 'nation'], elementFirestore2, { scopes: ['firestore'] });
    registry.register(['element2', 'container', 'region', 'nation'],
      // @ts-expect-error
      elementSequelizeBlamo2, { scopes: ['sequelize', 'blamo'] });
    // @ts-expect-error
    registry.register(['nation'], nation);
    // @ts-expect-error
    registry.register(['region', 'nation'], region);
    // @ts-expect-error
    registry.register(['container', 'region', 'nation'], container);
    // @ts-expect-error
    registry.register(['container', 'region', 'nation'], containerFirestore, { scopes: ['firestore'] });
    // @ts-expect-error
    registry.register(['container', 'region', 'nation'], containerSequelize, { scopes: ['sequelize'] });

    expect(registry.get(['nation'])).toBe(nation);
    expect(registry.get(['element', 'container', 'region', 'nation']))
      .toBe(elementFirestore1);
    expect(registry.get(['element', 'container', 'region', 'nation'], { scopes: ['firestore'] }))
      .toBe(elementFirestore1);
    expect(registry.get(['element', 'container', 'region', 'nation'], { scopes: ['sequelize'] }))
      .toBe(elementSequelize1);
    expect(registry.get(['element', 'container', 'region', 'nation'], { scopes: ['sequelize'] }))
      .toBe(elementSequelize1);
    expect(() => registry.get(['element', 'container', 'region', 'nation'], { scopes: ['sequelize', 'blamo'] }))
      .toThrow();
    expect(registry.get(['element2', 'container', 'region', 'nation']))
      .toBe(elementSequelize2);
    expect(registry.get(['element2', 'container', 'region', 'nation'], { scopes: ['firestore'] }))
      .toBe(elementFirestore2);
    expect(registry.get(['element2', 'container', 'region', 'nation'], { scopes: ['sequelize'] }))
      .toBe(elementSequelize2);
    expect(registry.get(['element2', 'container', 'region', 'nation'], { scopes: ['sequelize', 'blamo'] }))
      .toBe(elementSequelizeBlamo2);
    expect(registry.get(['container', 'region', 'nation'])).toBe(container);
    expect(registry.get(['container', 'region', 'nation'], { scopes: ['firestore'] })).toBe(containerFirestore);
    expect(registry.get(['container', 'region', 'nation'], { scopes: ['sequelize'] })).toBe(containerSequelize);
    expect(registry.get(['region', 'nation'])).toBe(region);
  });

});