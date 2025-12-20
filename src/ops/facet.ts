import {
  ComKey,
  Coordinate,
  FacetOperationMethod,
  Item,
  PriKey,
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
    facetParams?: Record<string, any>
  ) => {
    logger.debug('Facet operation started', { key, facetKey, facetParams });
    
    if (!facets?.[facetKey]) {
      const availableFacets = facets ? Object.keys(facets) : [];
      throw new ValidationError(
        `Facet "${facetKey}" not found`,
        availableFacets,
        'Use one of the available facets'
      );
    }

    const context: OperationContext = {
      itemType: coordinate.kta[0],
      operationType: 'facet',
      operationName: facetKey,
      params: facetParams || {},
      key
    };

    return executeWithContext(
      async () => {
        const facetMethod = facets[facetKey];
        logger.debug("Getting item for facet", { key });
        const item = await toWrap.get(key);
        if (!item) {
          throw new Error(`Item not found for key: ${JSON.stringify(key)}`);
        }
        const result = facetMethod(item, facetParams || {});
        logger.debug('Facet operation completed', { facetKey, result });
        return result;
      },
      context
    );
  };

  return facet;
}
