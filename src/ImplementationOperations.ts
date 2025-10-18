import { Item } from "@fjell/core";
import {
  AllMethod,
  CreateMethod,
  FindMethod,
  FindOneMethod,
  GetMethod,
  OneMethod,
  RemoveMethod,
  UpdateMethod,
  UpsertMethod
} from "@fjell/core";

/**
 * ImplementationOperations
 *
 * The subset of operations that implementation libraries (lib-firestore, lib-sequelize)
 * are required to implement. This interface excludes extended operations like facets and
 * actions which are added by the wrapping layer in wrapImplementationOperations().
 *
 * Implementation libraries should:
 * 1. Implement these core CRUD and query operations
 * 2. Return an ImplementationOperations object from their createOperations function
 * 3. Use wrapImplementationOperations() to add extended operations (facets, actions) as stubs
 *
 * This approach:
 * - Makes the contract explicit and honest
 * - Removes boilerplate stub implementations from every implementation library
 * - Centralizes the pattern of adding extended operations
 * - Maintains backward compatibility with the full Operations interface
 */
export interface ImplementationOperations<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  // Core CRUD operations - must be implemented by all libraries
  create: CreateMethod<V, S, L1, L2, L3, L4, L5>;
  get: GetMethod<V, S, L1, L2, L3, L4, L5>;
  update: UpdateMethod<V, S, L1, L2, L3, L4, L5>;
  remove: RemoveMethod<V, S, L1, L2, L3, L4, L5>;
  upsert: UpsertMethod<V, S, L1, L2, L3, L4, L5>;
  
  // Query operations - must be implemented by all libraries
  all: AllMethod<V, S, L1, L2, L3, L4, L5>;
  one: OneMethod<V, S, L1, L2, L3, L4, L5>;
  find: FindMethod<V, S, L1, L2, L3, L4, L5>;
  findOne: FindOneMethod<V, S, L1, L2, L3, L4, L5>;
  
  // Note: facet, allFacet, action, allAction are NOT required here
  // They will be added by wrapImplementationOperations() with default stub implementations
}

