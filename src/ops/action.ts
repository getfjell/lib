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
      logger.error('Action not found', {
        component: 'lib',
        operation: 'action',
        requestedAction: actionKey,
        availableActions,
        key: JSON.stringify(key),
        itemType: coordinate.kta[0],
        suggestion: availableActions.length > 0
          ? `Use one of the available actions: ${availableActions.join(', ')}`
          : 'Define actions in your library configuration',
        coordinate: JSON.stringify(coordinate)
      });
      throw new ValidationError(
        `Action "${actionKey}" not found`,
        availableActions,
        availableActions.length > 0
          ? `Use one of the available actions: ${availableActions.join(', ')}`
          : 'Define actions in your library configuration'
      );
    }

    const context: OperationContext = {
      itemType: coordinate.kta[0],
      operationType: 'action',
      operationName: actionKey,
      params: actionParams || {},
      key
    };

    try {
      return await executeWithContext(
        async () => {
          const actionMethod = actions[actionKey];
          const item = await toWrap.get(key);
          if (!item) {
            logger.error('Item not found for action', {
              component: 'lib',
              operation: 'action',
              action: actionKey,
              key: JSON.stringify(key),
              itemType: coordinate.kta[0],
              suggestion: 'Verify the item exists before calling actions. Check if the key is correct or if the item was deleted.',
              coordinate: JSON.stringify(coordinate)
            });
            throw new Error(`Item not found for action "${actionKey}" with key: ${JSON.stringify(key)}`);
          }
          const result = await actionMethod(item, actionParams || {});
          logger.debug('Action operation completed', { actionKey, result });
          return result;
        },
        context
      );
    } catch (error: any) {
      // Extract error details for better logging
      const errorDetails: Record<string, any> = {
        operation: 'action',
        actionKey,
        coordinate: coordinate.kta,
        key: JSON.stringify(key)
      };

      // Add standard error properties
      if (typeof error.message === 'string') {
        errorDetails.message = error.message;
      }
      if (typeof error.name === 'string') {
        errorDetails.name = error.name;
      }
      if (typeof error.code === 'string' || typeof error.code === 'number') {
        errorDetails.code = error.code;
      }
      if (typeof error.stack === 'string') {
        errorDetails.stack = error.stack;
      }

      // Add database-specific properties
      if (typeof error.constraint === 'string') {
        errorDetails.constraint = error.constraint;
      }
      if (typeof error.detail === 'string') {
        errorDetails.detail = error.detail;
      }

      // Add Sequelize validation errors
      if (error.errors && Array.isArray(error.errors)) {
        errorDetails.validationErrors = error.errors.map((e: any) => ({
          message: e.message,
          type: e.type,
          path: e.path
        }));
      }

      logger.error(`Action "${actionKey}" failed`, errorDetails);
      throw error;
    }
  };

  return action;
}
