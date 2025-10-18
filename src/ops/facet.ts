import { ComKey, FacetOperationMethod, Item, OperationParams, PriKey } from "@fjell/core";
import { Coordinate } from "@fjell/registry";

import { Options } from "../Options";
import LibLogger from "../logger";
import { Operations } from "../Operations";
import { Registry } from "../Registry";
import { validateKey } from "../validation/KeyValidator";

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

  const facet = async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    facetKey: string,
    facetParams?: OperationParams,
  ): Promise<any> => {
    logger.debug("facet for item key: %j, facet key: %s, params: %j", key, facetKey, facetParams);
    
    // Validate key type and location key order
    validateKey(key, coordinate, 'facet');
    
    if (!facets?.[facetKey]) {
      throw new Error(`Facet ${facetKey} not found in definition for ${coordinate.toString()}`);
    }
    // We search for the method, but we throw the method call to the wrapped operations
    // This is because we want to make sure we're always invoking the appropriate key and event management logic.
    const facetMethod = facets[facetKey];
    logger.debug("Getting Item for Facet by key: %j", key);
    const item = await toWrap.get(key);
    if (!item) {
      throw new Error(`Item not found for key: ${JSON.stringify(key)}`);
    }
    return facetMethod(item, facetParams || {});
  }

  return facet;
}
