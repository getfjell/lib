import { Item } from '@fjell/core';
import LibLogger from '@/logger';
import { Instance, isInstance } from './Instance';

const logger = LibLogger.get("Registry");
  
export interface Registry {
  register: (
    kta: string[],
    instance: Instance<any, any, any | never, any | never, any | never, any | never, any | never>,
    options?: { scopes?: string[] },
  ) => void;
  get: (
    kta: string[],
    options?: { scopes?: string[] },
  ) => Instance<any, any, any | never, any | never, any | never, any | never, any | never> | null;
  libTree: LibTree;
}

interface ScopedInstance {
  scopes?: string[];
  instance: Instance<any, any, any | never, any | never, any | never, any | never, any | never>;
}

const isScopedInstance = (instance: ScopedInstance): instance is ScopedInstance => {
  // eslint-disable-next-line no-undefined
  return instance.instance !== undefined;
}

const retrieveScopedInstance = (
  scopedInstanceArray: ScopedInstance[],
  scopes?: string[],
): Instance<any, any, any | never, any | never, any | never, any | never, any | never> => {
  let instance: Instance<
    any,
    any,
    any | never,
    any | never,
    any | never,
    any | never,
    any | never
  > | undefined;
  if( scopes ) {
    instance = scopedInstanceArray.find(sl => {
      return sl.scopes && scopes && scopes.every(scope => sl.scopes && sl.scopes.includes(scope));
    })?.instance;
  } else {
    instance = scopedInstanceArray[0]?.instance;
  }
  if(!instance) {
    throw new Error(`No Scoped Instance for ${scopes?.join(', ')}`);
  }
  return instance;
}

interface LibTree {
  [kt: string]: [ScopedInstance[], LibTree | null];
}

const libTreeToString = (libTree: LibTree): string => {
  return JSON.stringify(libTree);
}

export const createRegistry = (): Registry => {
  // TODO: My use of Generics has Boxes be into a corner where I can't reference AbstractLib without the types
  const libTree: LibTree = {};

  const register = <
        V extends Item<S, L1, L2, L3, L4, L5>,
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never,
  >(kta: S[], instance: Instance<V, S, L1, L2, L3, L4, L5>, options?: { scopes?: string[] }): void => {
    const ktaArray = [...kta];
    let currentTree = libTree;

    logger.debug(`Registering lib for KTA and scopes`, ktaArray, options?.scopes);

    if(!isInstance(instance)) {
      throw new Error(`Attempting to register a non-instance as an instance: ${ktaArray.join('.')}`);
    }

    while(ktaArray.length > 0) {
      const kt = ktaArray.pop();
      if(kt) {
        if(ktaArray.length === 0) {
          if(!currentTree[kt]) {
            currentTree[kt] = [[], null];
          }
          currentTree[kt][0].push({ scopes: options?.scopes, instance });
        } else {
          if(!currentTree[kt]) {
            const newTree: LibTree = {};
            currentTree[kt] = [[], newTree];
            currentTree = newTree;
          } else if (!currentTree[kt][1]) {
            const newTree: LibTree = {};
            currentTree[kt][1] = newTree;
            currentTree = newTree;
          } else {
            currentTree = currentTree[kt][1] as LibTree;
          }
        }
      } else {
        throw new Error(`Invalid KTA containing an empty false or undefined kt: ${ktaArray.join('.')}`);
      }
    }
  }

  const get = <
    V extends Item<S, L1, L2, L3, L4, L5>,
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never,
  >(kta: S[], options?: { scopes?: string[] }): Instance<V, S, L1, L2, L3, L4, L5> | null => {
    const ktaArray = [...kta];
    let currentTree = libTree;
    let instance: Instance<V, S, L1, L2, L3, L4, L5> | null = null;

    logger.debug(`Getting lib for KTA and scopes`, ktaArray, options?.scopes);
    
    logger.default('libTree State: %s', libTreeToString(libTree));

    while(ktaArray.length > 0) {
      const kt = ktaArray.pop();
      if(kt) {
        if(ktaArray.length === 0 && currentTree[kt]) {
          const element = currentTree[kt];
          const scopedInstanceArray: ScopedInstance[] = element[0];
          if(scopedInstanceArray.length > 0 && isScopedInstance(scopedInstanceArray[0])) {
            instance = retrieveScopedInstance(scopedInstanceArray, options?.scopes);
            // eslint-disable-next-line max-depth
            if(!instance) {
              throw new Error(
                `No Instance not found for kta: ${ktaArray.join('.')}, Scopes: ${options?.scopes?.join(', ')}`);
            }
          } else {
            throw new Error(`No Instance not found for kta: ${ktaArray.join('.')}, Last Key not a instance: ${kt}`);
          }
        } else {
          if(!currentTree[kt]) {
            throw new Error(`Lib not found for kta: ${ktaArray.join('.')}, Subtree Not Found: ${kt}`);
          } else {
            currentTree = currentTree[kt][1] as LibTree;
          }
        }
      } else {
        throw new Error(`Invalid KTA containing an empty false or undefined kt: ${ktaArray.join('.')}`);
      }
    }
    return instance;
  }

  return {
    register,
    get,
    // TODO: Remove this once we have a better way to test
    libTree,
  };
}

