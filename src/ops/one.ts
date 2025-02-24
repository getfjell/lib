import { Item, LocKeyArray } from "@fjell/core";

import { ItemQuery } from "@fjell/core";

import { Definition } from "@/Definition";
import LibLogger from '@/logger';
import { Operations } from "@/Operations";

const logger = LibLogger.get('library', 'ops','one');

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    definition: Definition<V, S, L1, L2, L3, L4, L5>,
  ) => {

  const one = async (
    itemQuery: ItemQuery,
    locations: LocKeyArray<L1, L2, L3, L4, L5> | [] = []
  ): Promise<V | null> => {
    logger.debug('one', { itemQuery, locations });
    const item = await toWrap.one(itemQuery, locations);
    logger.default("one: %j", { item });
    return item;
  }

  return one;
}