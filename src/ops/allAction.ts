import { ComKey, Item, LocKeyArray, PriKey } from "@fjell/core";
import { Operations } from "../Operations";
import { Options } from "../Options";
import LibLogger from "../logger";

const logger = LibLogger.get("library", "ops", "allAction");

export const wrapAllActionOperation = <
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
  ) => {
  const { allActions } = options || {};
  const allAction = async (
    allActionKey: string,
    allActionParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<[V[], Array<PriKey<any> | ComKey<any, any, any, any, any, any> | LocKeyArray<any, any, any, any, any>>]> => {
    logger.debug("allAction", { allActionKey, allActionParams, locations });
    if (!allActions?.[allActionKey]) {
      const availableActions = allActions ? Object.keys(allActions) : [];
      const errorMessage = `AllAction "${allActionKey}" not found in definition. Available actions: ${availableActions.length > 0 ? availableActions.join(', ') : 'none'}`;
      logger.error(errorMessage, {
        requestedAction: allActionKey,
        availableActions,
        allActionsKeys: allActions ? Object.keys(allActions) : [],
        params: allActionParams,
        locations
      });
      throw new Error(errorMessage);
    }
    const allActionMethod = allActions[allActionKey];
    return allActionMethod(allActionParams, locations);
  }
  return allAction;
}
