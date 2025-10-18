import { Coordinate, createFacetWrapper, FacetOperationMethod, Item } from "@fjell/core";

import { Options } from "../Options";
import LibLogger from "../logger";
import { Operations } from "../Operations";
import { Registry } from "../Registry";

const logger = LibLogger.get("library", "ops", "facet");

export const wrapFacetOperation = <
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
  ): FacetOperationMethod<S, L1, L2, L3, L4, L5> => {

  const { facets } = options || {};

  // Use the wrapper for automatic validation
  return createFacetWrapper(
    coordinate,
    async (key, facetKey, facetParams) => {
      logger.debug("Facet operation started", { key, facetKey, facetParams });
      
      if (!facets?.[facetKey]) {
        throw new Error(`Facet ${facetKey} not found in definition for ${coordinate.toString()}`);
      }
      // We search for the method, but we throw the method call to the wrapped operations
      // This is because we want to make sure we're always invoking the appropriate key and event management logic.
      const facetMethod = facets[facetKey];
      logger.debug("Getting item for facet", { key });
      const item = await toWrap.get(key);
      if (!item) {
        throw new Error(`Item not found for key: ${JSON.stringify(key)}`);
      }
      const result = facetMethod(item, facetParams || {});
      logger.debug('Facet operation completed', { facetKey, result });
      return result;
    }
  );
}
