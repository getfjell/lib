/* eslint-disable indent */
import {
  AffectedKeys,
  ComKey,
  Coordinate,
  Operations as CoreOperations,
  CreateOptions,
  Item,
  LocKeyArray,
  OperationParams,
  PriKey
} from "@fjell/types";
import { isComKey, isPriKey } from "@fjell/core";

import { wrapAllOperation } from "./ops/all";
import { wrapCreateOperation } from "./ops/create";
import { wrapFindOperation } from "./ops/find";
import { wrapFindOneOperation } from "./ops/findOne";
import { wrapGetOperation } from "./ops/get";
import { wrapOneOperation } from "./ops/one";
import { wrapRemoveOperation } from "./ops/remove";
import { wrapUpdateOperation } from "./ops/update";
import { wrapUpsertOperation } from "./ops/upsert";
import { wrapActionOperation } from "./ops/action";
import { wrapFacetOperation } from "./ops/facet";
import { wrapAllActionOperation } from "./ops/allAction";
import { wrapAllFacetOperation } from "./ops/allFacet";

import LibLogger from './logger';
import { Registry } from "./Registry";
import { ActionMethod, AllActionMethod, AllFacetMethod, FacetMethod, FinderMethod, Options } from "./Options";

const logger = LibLogger.get('Operations');

/**
 * Lib Operations interface extends core Operations.
 * Inherits all standard operation methods from @fjell/core.
 */
export interface Operations<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> extends CoreOperations<V, S, L1, L2, L3, L4, L5> {
  // Lib-specific extensions
  finders: Record<string, FinderMethod<V, S, L1, L2, L3, L4, L5>>;
  actions: Record<string, ActionMethod<V, S, L1, L2, L3, L4, L5>>;
  facets: Record<string, FacetMethod<V, S, L1, L2, L3, L4, L5>>;
  allActions: Record<string, AllActionMethod<V, S, L1, L2, L3, L4, L5>>;
  allFacets: Record<string, AllFacetMethod<L1, L2, L3, L4, L5>>;
}

// Re-export core types for convenience
export type { OperationParams, AffectedKeys, CreateOptions };
export { isPriKey, isComKey };

export const wrapOperations = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(
  toWrap: Operations<V, S, L1, L2, L3, L4, L5>,
  options: Options<V, S, L1, L2, L3, L4, L5>,
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  registry: Registry,
): Operations<V, S, L1, L2, L3, L4, L5> => {
  logger.default('🔗 [LIB] Wrapping operations with hooks and validation', {
    coordinate: coordinate.kta,
    hasHooks: !!options.hooks,
    hasValidators: !!options.validators,
    toWrapType: toWrap.constructor?.name || 'Unknown'
  });

  const operations = {} as Operations<V, S, L1, L2, L3, L4, L5>;

  logger.default('🔗 [LIB] Wrapping create operation');
  operations.create = wrapCreateOperation(toWrap, options, coordinate, registry);
  
  logger.default('🔗 [LIB] Wrapping update operation');
  operations.update = wrapUpdateOperation(toWrap, options, coordinate, registry);
  
  logger.default('🔗 [LIB] Wrapping remove operation');
  operations.remove = wrapRemoveOperation(toWrap, options, coordinate, registry);
  
  logger.default('🔗 [LIB] Wrapping other operations');
  operations.all = wrapAllOperation(toWrap, options, coordinate, registry);
  operations.one = wrapOneOperation(toWrap, options, coordinate, registry);
  operations.get = wrapGetOperation(toWrap, options, coordinate, registry);
  operations.find = wrapFindOperation(toWrap, options, coordinate, registry);
  operations.findOne = wrapFindOneOperation(toWrap, options, coordinate, registry);
  operations.upsert = wrapUpsertOperation(operations, coordinate, registry);
  operations.action = wrapActionOperation(toWrap, options, coordinate);
  operations.facet = wrapFacetOperation(toWrap, options, coordinate, registry);
  operations.allAction = wrapAllActionOperation(toWrap, options, coordinate);
  operations.allFacet = wrapAllFacetOperation(toWrap, options, coordinate, registry);

  // Copy collection properties from options and toWrap
  operations.finders = { ...(toWrap.finders || {}), ...(options.finders || {}) };
  operations.actions = { ...(toWrap.actions || {}), ...(options.actions || {}) };
  operations.facets = { ...(toWrap.facets || {}), ...(options.facets || {}) };
  operations.allActions = { ...(toWrap.allActions || {}), ...(options.allActions || {}) };
  operations.allFacets = { ...(toWrap.allFacets || {}), ...(options.allFacets || {}) };

  logger.default('🔗 [LIB] Operations wrapping completed', {
    coordinate: coordinate.kta,
    wrappedOperations: Object.keys(operations)
  });

  return operations;
};

export const createReadOnlyOperations = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(
  toWrap: Operations<V, S, L1, L2, L3, L4, L5>,
): Operations<V, S, L1, L2, L3, L4, L5> => {

  logger.debug("createReadOnlyOperations", { toWrap });
  const create = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: CreateOptions<S, L1, L2, L3, L4, L5>
  ): Promise<V> => {
    logger.warning('create', 'Cannot Create in a ReadOnly Library, Returning Empty Item');
    return {} as V;
  };

  const update = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    item: Partial<Item<S, L1, L2, L3, L4, L5>>
  ): Promise<V> => {
    logger.warning('update', 'Cannot Update in a ReadOnly Library, Returning Empty Item');
    return {} as V;
  };

  const upsert = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    itemProperties: Partial<Item<S, L1, L2, L3, L4, L5>>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    locations?: LocKeyArray<L1, L2, L3, L4, L5>,
  ): Promise<V> => {
    logger.warning('upsert', 'Cannot Upsert in a ReadOnly Library, Returning Empty Item');
    return {} as V;
  };

  const remove = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>
  ): Promise<V> => {
    logger.warning('remove', 'Cannot Remove in a ReadOnly Library, Returning Empty Item');
    return {} as V;
  };

  return {
    ...toWrap,
    create,
    update,
    upsert,
    remove,
  };

};
