import {
  AllFacetOperationMethod,
  Coordinate,
  Item,
  LocKeyArray,
} from "@fjell/types";
import {
  executeWithContext,
  OperationContext,
  ValidationError
} from "@fjell/core";

import { Options } from "../Options";
import LibLogger from "../logger";
import { Operations } from "../Operations";
import { Registry } from "../Registry";

const logger = LibLogger.get("library", "ops", "allFacet");

export const wrapAllFacetOperation = <
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
  ): AllFacetOperationMethod<L1, L2, L3, L4, L5> => {

  const { allFacets } = options || {};

  const allFacet = async (
    allFacetKey: string,
    allFacetParams?: Record<string, any>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ) => {
    const locs = locations ?? [];
    logger.debug('AllFacet operation started', { allFacetKey, allFacetParams, locations: locs });
    
    if (!allFacets?.[allFacetKey]) {
      const availableFacets = allFacets ? Object.keys(allFacets) : [];
      throw new ValidationError(
        `AllFacet "${allFacetKey}" not found`,
        availableFacets,
        'Use one of the available facets'
      );
    }

    const context: OperationContext = {
      itemType: coordinate.kta[0],
      operationType: 'allFacet',
      operationName: allFacetKey,
      params: allFacetParams || {},
      locations: locs as any
    };

    return executeWithContext(
      () => {
        const allFacetMethod = allFacets[allFacetKey];
        const result = allFacetMethod(allFacetParams || {}, locs);
        logger.debug('AllFacet operation completed', { allFacetKey, result });
        return result;
      },
      context
    );
  };

  return allFacet;
}
