/* eslint-disable indent */
import { Item, ItemQuery, LocKeyArray } from "@fjell/core";
import { Coordinate } from "@fjell/registry";

import { Options } from "@/Options";
import LibLogger from "@/logger";
import { Operations } from "@/Operations";
import { Registry } from "@/Registry";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: Options<V, S, L1, L2, L3, L4, L5>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  registry: Registry,
) => {

  const all = async (
    itemQuery: ItemQuery,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V[]> => {

    logger.default("getAllOperation", { itemQuery, locations });
    const items = await toWrap.all(itemQuery, locations);
    logger.default("getAllOperation: %j", { items });
    return items;
  }

  return all;
}
