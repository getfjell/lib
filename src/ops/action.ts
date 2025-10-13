import { ComKey, Item, LocKeyArray, PriKey } from "@fjell/core";
import { Coordinate } from "@fjell/registry";
import { Operations } from "../Operations";
import { Options } from "../Options";
import LibLogger from "../logger";
import { validateKey } from "../validation/KeyValidator";

const logger = LibLogger.get("library", "ops", "action");

export const wrapActionOperation = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(
    toWrap: Operations<V, S, L1, L2, L3, L4, L5>,
    options: Options<V, S, L1, L2, L3, L4, L5>,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  ) => {
  const { actions } = options || {};
  const action = async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    actionKey: string,
    actionParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
  ): Promise<[V, Array<PriKey<any> | ComKey<any, any, any, any, any, any> | LocKeyArray<any, any, any, any, any>>]> => {
    logger.debug("action", { key, actionKey, actionParams });
    
    // Validate key type and location key order
    validateKey(key, coordinate, 'action');
    
    if (!actions?.[actionKey]) {
      throw new Error(`Action ${actionKey} not found in definition`);
    }
    const actionMethod = actions[actionKey];
    const item = await toWrap.get(key);
    return actionMethod(item, actionParams);
  }
  return action;
}
