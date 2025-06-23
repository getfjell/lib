import { ComKey, Item, PriKey } from "@fjell/core";

import { Definition } from "@/Definition";
import LibLogger from "@/logger";
import { Operations } from "@/Operations";
import { Registry } from "@/Registry";

const logger = LibLogger.get("library", "ops", "action");

export const wrapActionOperation = <
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    registry: Registry,
  ) => {

  const action = async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    actionKey: string,
    actionParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
  ): Promise<V> => {
    logger.debug("action", { key, actionKey, actionParams });
    const actionResult = await toWrap.action(key, actionKey, actionParams);
    logger.default("action result: %j", { actionResult });
    return actionResult;
  }

  return action;
}
