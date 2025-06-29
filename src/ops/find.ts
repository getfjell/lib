import { Item, LocKeyArray } from "@fjell/core";

import { Definition } from "@/Definition";
import LibLogger from "@/logger";
import { Operations } from "@/Operations";
import { Registry } from "@/Registry";

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

    definition: Definition<V, S, L1, L2, L3, L4, L5>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    registry: Registry,
  ) => {

  const { coordinate, options } = definition;
  const { finders } = options || {};

  const find = async (
    finder: string,
    finderParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V[]> => {
    logger.default("find", { finder, finderParams, locations });
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
