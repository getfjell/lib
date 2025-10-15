import { Item, LocKeyArray } from "@fjell/core";
import { Coordinate } from "@fjell/registry";

import { ItemQuery } from "@fjell/core";

import { Options } from "../Options";
import LibLogger from '../logger';
import { Operations } from "../Operations";
import { Registry } from "../Registry";
import { validateLocations } from "../validation/KeyValidator";

const logger = LibLogger.get('library', 'ops', 'one');

export const wrapOneOperation = <
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
  ) => {

  const one = async (
    itemQuery: ItemQuery,
    locations: LocKeyArray<L1, L2, L3, L4, L5> | [] = []
  ): Promise<V | null> => {
    logger.default('one', { itemQuery, locations });
    
    // Validate location key array order
    validateLocations(locations, coordinate, 'one');
    
    const item = await toWrap.one(itemQuery, locations);
    logger.default("one: %j", { item });
    return item;
  }

  return one;
}
