import {
  AllActionOperationMethod,
  Coordinate,
  Item,
  LocKeyArray,
} from "@fjell/types";
import {
  executeWithContext,
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

    try {
      return await executeWithContext(
        async () => {
          const allActionMethod = allActions[allActionKey];
          const result = await allActionMethod(allActionParams || {}, locs);
          logger.debug('AllAction operation completed', { allActionKey, result });
          return result;
        },
        context
      );
    } catch (error: any) {
      // Extract error details for better logging
      const errorDetails: Record<string, any> = {
        operation: 'allAction',
        actionKey: allActionKey,
        coordinate: coordinate.kta,
        locations: locs
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

      logger.error(`AllAction "${allActionKey}" failed`, errorDetails);
      throw error;
    }
  };

  return allAction;
}
