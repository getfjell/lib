
import {
  ComKey,
  Coordinate,
  executeWithContext,
  Item,
  LocKeyArray,
  OperationContext,
  PriKey,
  UpdateOptions,
  UpsertMethod
} from "@fjell/core";

import LibLogger from "../logger";
import { NotFoundError } from "../errors";
import { Operations } from "../Operations";
import { Registry } from "../Registry";

const logger = LibLogger.get('ops', 'upsert');

// TODO: Explore how you are using the this keyword.
export const wrapUpsertOperation = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never>(
    ops: Operations<V, S, L1, L2, L3, L4, L5>,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    registry: Registry,
  ): UpsertMethod<V, S, L1, L2, L3, L4, L5> => {

  const upsert = async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    itemProperties: Partial<Item<S, L1, L2, L3, L4, L5>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5>,
    options?: UpdateOptions
  ): Promise<V> => {
    logger.debug('upsert', { key, itemProperties });

    const context: OperationContext = {
      itemType: coordinate.kta[0],
      operationType: 'upsert',
      operationName: 'upsert',
      params: { key, item: itemProperties },
      key
    };

    return executeWithContext(
      async () => {
        let item: V | null = null;
        try {
          logger.debug('Retrieving item by key', { key });
          item = await ops.get(key);
        } catch (error: any) {
          // Check if this is a NotFoundError (preserved by core wrapper)
          // Check both instanceof and error code to handle cases where
          // module duplication might break instanceof checks
          const isNotFound = error instanceof NotFoundError ||
            error?.name === 'NotFoundError' ||
            error?.errorInfo?.code === 'NOT_FOUND';

          if (isNotFound) {
            logger.debug('Item not found, creating new item', { key, errorType: error?.name, errorCode: error?.errorInfo?.code });
            const createOptions = locations ? { locations } : { key };
            item = await ops.create(itemProperties, createOptions);
          } else {
            // Re-throw other errors (connection issues, permissions, etc.)
            logger.error('Unexpected error during upsert get operation', {
              component: 'lib',
              operation: 'upsert',
              phase: 'get-existing',
              key: JSON.stringify(key),
              itemType: coordinate.kta[0],
              errorType: error?.constructor?.name || typeof error,
              errorMessage: error?.message,
              errorName: error?.name,
              errorCode: error?.errorInfo?.code,
              suggestion: 'Check database connectivity, permissions, and key validity',
              coordinate: JSON.stringify(coordinate)
            });
            throw error;
          }
        }

        if (!item) {
          logger.error('Failed to retrieve or create item during upsert', {
            component: 'lib',
            operation: 'upsert',
            key: JSON.stringify(key),
            itemType: coordinate.kta[0],
            suggestion: 'This should not happen. Check create operation implementation and error handling.',
            coordinate: JSON.stringify(coordinate)
          });
          throw new Error(`Failed to retrieve or create item for upsert with key: ${JSON.stringify(key)}`);
        }

        logger.debug('Updating item', { key: item.key, itemProperties });
        item = await ops.update(item.key, itemProperties, options);
        logger.debug('Item updated successfully', { item });

        return item;
      },
      context
    );
  };

  return upsert;
}
