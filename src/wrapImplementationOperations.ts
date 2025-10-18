import { AffectedKeys, Item } from "@fjell/core";
import { ImplementationOperations } from "./ImplementationOperations";
import { Operations } from "./Operations";
import { Options } from "./Options";

/**
 * wrapImplementationOperations
 * 
 * Wraps implementation operations (from lib-firestore, lib-sequelize) with:
 * 1. Default stub implementations for extended operations (facets, actions)
 * 2. Metadata dictionaries (finders, actions, facets, allActions, allFacets)
 * 
 * This centralizes the pattern of adding extended operations, removing the need for
 * implementation libraries to provide their own stub implementations.
 * 
 * @param implOps - The core operations implemented by the library
 * @param options - Library options containing finders, actions, facets definitions
 * @returns Complete Operations object with all required methods and metadata
 */
export function wrapImplementationOperations<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  implOps: ImplementationOperations<V, S, L1, L2, L3, L4, L5>,
  options: Options<V, S, L1, L2, L3, L4, L5>
): Operations<V, S, L1, L2, L3, L4, L5> {
  return {
    // Spread the implementation operations
    ...implOps,
    
    // Add stub implementations for extended operations
    // These return "no-op" values since they're not implemented by default
    facet: async (): Promise<any> => null,
    allFacet: async (): Promise<any> => null,
    action: async (): Promise<[V, AffectedKeys]> => [{} as V, []],
    allAction: async (): Promise<[V[], AffectedKeys]> => [[], []],
    
    // Add metadata dictionaries from options
    finders: { ...(options.finders || {}) },
    actions: { ...(options.actions || {}) },
    facets: { ...(options.facets || {}) },
    allActions: { ...(options.allActions || {}) },
    allFacets: { ...(options.allFacets || {}) },
  };
}

