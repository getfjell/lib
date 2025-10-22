import {
  AllActionOperationMethod,
  Coordinate,
  executeWithContext,
  Item,
  LocKeyArray,
  OperationContext,
  ValidationError
} from "@fjell/core";
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
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  ): AllActionOperationMethod<V, S, L1, L2, L3, L4, L5> => {
  const { allActions } = options || {};
  
  const allAction = async (
    allActionKey: string,
    allActionParams?: Record<string, any>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ) => {
    const locs = locations ?? [];
    logger.debug('AllAction operation started', { allActionKey, allActionParams, locations: locs });
    
    if (!allActions?.[allActionKey]) {
      const availableActions = allActions ? Object.keys(allActions) : [];
      throw new ValidationError(
        `AllAction "${allActionKey}" not found`,
        availableActions,
        'Use one of the available actions'
      );
    }

    const context: OperationContext = {
      itemType: coordinate.kta[0],
      operationType: 'allAction',
      operationName: allActionKey,
      params: allActionParams || {},
      locations: locs as any
    };

    return executeWithContext(
      () => {
        const allActionMethod = allActions[allActionKey];
        const result = allActionMethod(allActionParams || {}, locs);
        logger.debug('AllAction operation completed', { allActionKey, result });
        return result;
      },
      context
    );
  };

  return allAction;
}
