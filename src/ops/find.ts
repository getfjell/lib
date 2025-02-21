import { Item, LocKeyArray } from "@fjell/core";

import { Definition } from "@/Definition";
import LibLogger from "@/logger";
import { Operations } from "@/Operations";

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    definition: Definition<V, S, L1, L2, L3, L4, L5>,
  ) => {

  const find = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    finder: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    finderParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V[]> => {
    logger.default("find", { finder, finderParams, locations });
    const foundItems = await toWrap.find(finder, finderParams, locations);
    return foundItems;
  }

  return find;
}