import {
  ActionOperationMethod,
  ComKey,
  Coordinate,
  executeWithContext,
  Item,
  OperationContext,
  PriKey,
  ValidationError
} from "@fjell/core";
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
  
  const action = async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    actionKey: string,
    actionParams?: Record<string, any>
  ) => {
    logger.debug('Action operation started', { key, actionKey, actionParams });
    
    if (!actions?.[actionKey]) {
      const availableActions = actions ? Object.keys(actions) : [];
      throw new ValidationError(
        `Action "${actionKey}" not found`,
        availableActions,
        'Use one of the available actions'
      );
    }

    const context: OperationContext = {
      itemType: coordinate.kta[0],
      operationType: 'action',
      operationName: actionKey,
      params: actionParams || {},
      key
    };

    return executeWithContext(
      async () => {
        const actionMethod = actions[actionKey];
        const item = await toWrap.get(key);
        if (!item) {
          throw new Error(`Item not found for key: ${JSON.stringify(key)}`);
        }
        const result = actionMethod(item, actionParams || {});
        logger.debug('Action operation completed', { actionKey, result });
        return result;
      },
      context
    );
  };

  return action;
}
