import { FindMethod, Item, LocKeyArray } from "@fjell/core";
import { Coordinate } from "@fjell/registry";

import { Options } from "../Options";
import LibLogger from "../logger";
import { Operations } from "../Operations";
import { Registry } from "../Registry";
import { validateLocations } from "../validation/KeyValidator";

const logger = LibLogger.get("library", "ops", "find");

export const wrapFindOperation = <
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
  ): FindMethod<V, S, L1, L2, L3, L4, L5> => {

  const { finders } = options || {};

  const find = async (
    finder: string,
    finderParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V[]> => {
    logger.default("find", { finder, finderParams, locations });
    
    // Validate location key array order
    validateLocations(locations, coordinate, 'find');
    
    if (!finders?.[finder]) {
      throw new Error(`Finder ${finder} not found in definition for ${coordinate.toString()}`);
    }
    // We search for the method, but we throw the method call to the wrapped operations
    // This is because we want to make sure we're always invoking the appropriate key and event management logic.
    const foundItems = await toWrap.find(finder, finderParams, locations);
    logger.default("found items: %j", { foundItems });
    return foundItems;
  }

  return find;
}
