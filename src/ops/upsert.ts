
import {
  ComKey,
  Item,
  PriKey,
  TypesProperties
} from "@fjell/core";

import LibLogger from "@/logger";
import { NotFoundError } from "@/errors";
import { Operations } from "@/Operations";
import { Registry } from "@/Registry";

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    registry: Registry,
  ) => {

  /**
   * Retrieves an item by its primary key or composite key, and creates a new item if it does not exist.
   * @param key - The primary key or composite key of the item to retrieve or create.
   * @param itemProperties - The properties of the item to create if it does not exist.
   * @returns The retrieved or created item.
   */
  const retrieveOrCreateWithKey = async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    itemProperties: TypesProperties<V, S, L1, L2, L3, L4, L5>,
  ) => {
    let item: V | null = null;
    try {
      logger.default('Retrieving Item by Key', { key });
      item = await ops.get(key);
    } catch (error) {
      if (error instanceof NotFoundError) {
        logger.default('Item not found, creating new item', { key });
        item = await ops.create(itemProperties, { key });
      } else {
        throw error;
      }
    }

    return item;
  }

  const upsert = async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    itemProperties: TypesProperties<V, S, L1, L2, L3, L4, L5>,
  ): Promise<V> => {

    let item: V | null = null;
    item = await retrieveOrCreateWithKey(key, itemProperties);

    logger.debug('Updating Item', { key: item.key, itemProperties });
    item = await ops.update(item.key, itemProperties);
    logger.default("updated item: %j", { item });

    return item;
  }

  return upsert;
}