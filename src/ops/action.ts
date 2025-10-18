import { ActionOperationMethod, Coordinate, createActionWrapper, Item } from "@fjell/core";
import { Operations } from "../Operations";
import { Options } from "../Options";
import LibLogger from "../logger";

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
  ): ActionOperationMethod<V, S, L1, L2, L3, L4, L5> => {
  const { actions } = options || {};
  // Use the wrapper for automatic validation
  return createActionWrapper(
    coordinate,
    async (key, actionKey, actionParams) => {
      logger.debug("Action operation started", { key, actionKey, actionParams });
      
      if (!actions?.[actionKey]) {
        throw new Error(`Action ${actionKey} not found in definition`);
      }
      const actionMethod = actions[actionKey];
      const item = await toWrap.get(key);
      if (!item) {
        throw new Error(`Item not found for key: ${JSON.stringify(key)}`);
      }
      const result = actionMethod(item, actionParams || {});
      logger.debug('Action operation completed', { actionKey, result });
      return result;
    }
  );
}
