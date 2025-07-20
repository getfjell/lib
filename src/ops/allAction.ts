import { Item, LocKeyArray } from "@fjell/core";
import { Coordinate } from "@fjell/registry";

import { Options } from "@/Options";
import LibLogger from "@/logger";
import { Operations } from "@/Operations";
import { Registry } from "@/Registry";

const logger = LibLogger.get("library", "ops", "allAction");

export const wrapAllActionOperation = <
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    registry: Registry,
  ) => {

  const { allActions } = options || {};

  const allAction = async (
    allActionKey: string,
    allActionParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V[]> => {
    logger.debug("allAction", { allActionKey, allActionParams, locations });
    if (!allActions?.[allActionKey]) {
      throw new Error(`AllAction ${allActionKey} not found in definition`);
    }
    // We search for the method, but we throw the method call to the wrapped operations
    // This is because we want to make sure we're always invoking the appropriate key and event management logic.
    const allActionMethod = allActions[allActionKey];
    return allActionMethod(allActionParams, locations);
  }

  return allAction;
}
