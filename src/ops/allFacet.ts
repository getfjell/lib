import { AllFacetOperationMethod, Coordinate, createAllFacetWrapper, Item } from "@fjell/core";

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

  // Use the wrapper for automatic validation
  return createAllFacetWrapper(
    coordinate,
    async (allFacetKey, allFacetParams, locations) => {
      logger.debug("AllFacet operation started", { allFacetKey, allFacetParams, locations });
      
      if (!allFacets?.[allFacetKey]) {
        throw new Error(`AllFacet ${allFacetKey} not found in definition`);
      }
      // We search for the method, but we throw the method call to the wrapped operations
      // This is because we want to make sure we're always invoking the appropriate key and event management logic.
      const allFacetMethod = allFacets[allFacetKey];
      const result = allFacetMethod(allFacetParams || {}, locations);
      logger.debug('AllFacet operation completed', { allFacetKey, result });
      return result;
    }
  );
}
