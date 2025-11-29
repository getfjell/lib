/* eslint-disable indent */
import {
  AllMethod,
  AllOperationResult,
  AllOptions,
  Coordinate,
  executeWithContext,
  Item,
  ItemQuery,
  LocKeyArray,
  OperationContext,
  validateLocations
} from "@fjell/core";

import { Options } from "../Options";
import LibLogger from "../logger";
import { Operations } from "../Operations";
import { Registry } from "../Registry";

const logger = LibLogger.get("library", "ops", "all");

export const wrapAllOperation = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  toWrap: Operations<V, S, L1, L2, L3, L4, L5>,
   
  options: Options<V, S, L1, L2, L3, L4, L5>,
   
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  registry: Registry,
): AllMethod<V, S, L1, L2, L3, L4, L5> => {

  const all = async (
    query?: ItemQuery,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | [],
    allOptions?: AllOptions
  ): Promise<AllOperationResult<V>> => {
    const locs = locations ?? [];
    logger.debug("all", { query, locations: locs, options: allOptions });

    // Validate locations
    if (locs.length > 0) {
      validateLocations(locs, coordinate, 'all');
    }

    const context: OperationContext = {
      itemType: coordinate.kta[0],
      operationType: 'all',
      operationName: 'all',
      params: { query, locations: locs, options: allOptions },
      locations: locs as any
    };

    return executeWithContext(
      () => toWrap.all(query, locs, allOptions),
      context
    );
  };

  return all;
}
