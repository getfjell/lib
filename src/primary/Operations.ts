/* eslint-disable indent */
import {
  AffectedKeys,
  PrimaryOperations as CorePrimaryOperations,
  OperationParams
} from "@fjell/core";
import { Coordinate, Item } from "@fjell/core";
import { ActionMethod, AllActionMethod, AllFacetMethod, FacetMethod, FinderMethod, Options } from "../Options";
import { wrapOperations as wrapAbstractOperations } from "../Operations";

import LibLogger from "../logger";
import { Registry } from "../Registry";

const logger = LibLogger.get("primary", "Operations");

/**
 * Primary Operations interface - extends core PrimaryOperations and adds lib-specific properties
 */
export interface Operations<
  V extends Item<S>,
  S extends string
> extends CorePrimaryOperations<V, S> {
  // Lib-specific extensions
  finders: Record<string, FinderMethod<V, S>>;
  actions: Record<string, ActionMethod<V, S>>;
  facets: Record<string, FacetMethod<V, S>>;
  allActions: Record<string, AllActionMethod<V, S>>;
  allFacets: Record<string, AllFacetMethod>;
}

// Re-export types
export type { OperationParams, AffectedKeys };

export const wrapOperations = <
  V extends Item<S>,
  S extends string
>(
  toWrap: Operations<V, S>,
  options: Options<V, S>,
  coordinate: Coordinate<S>,
  registry: Registry,

): Operations<V, S> => {
  logger.debug("wrapOperations", { toWrap, options, coordinate, registry });
  const operations = wrapAbstractOperations(toWrap, options, coordinate, registry);
  return operations;
};
