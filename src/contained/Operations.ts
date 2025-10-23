/* eslint-disable indent */
import {
  AffectedKeys,
  ContainedOperations as CoreContainedOperations,
  OperationParams
} from "@fjell/core";
import { Coordinate, Item } from "@fjell/core";
import { wrapOperations as wrapAbstractOperations } from "../Operations";
import { Registry } from "../Registry";
import { Options } from "./Options";
import { ActionMethod, AllActionMethod, AllFacetMethod, FacetMethod, FinderMethod } from "../Options";

import logger from "../logger";

/**
 * Contained Operations interface - extends core ContainedOperations and adds lib-specific properties
 */
export interface Operations<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> extends CoreContainedOperations<V, S, L1, L2, L3, L4, L5> {
  // Lib-specific extensions
  finders: Record<string, FinderMethod<V, S, L1, L2, L3, L4, L5>>;
  actions: Record<string, ActionMethod<V, S, L1, L2, L3, L4, L5>>;
  facets: Record<string, FacetMethod<V, S, L1, L2, L3, L4, L5>>;
  allActions: Record<string, AllActionMethod<V, S, L1, L2, L3, L4, L5>>;
  allFacets: Record<string, AllFacetMethod<L1, L2, L3, L4, L5>>;
}

// Re-export types
export type { OperationParams, AffectedKeys };

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
  logger.debug("wrapOperations", { toWrap, options, coordinate, registry });
  const operations = wrapAbstractOperations(toWrap, options, coordinate, registry);
  return operations;
};
