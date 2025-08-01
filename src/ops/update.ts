import { ComKey, Item, PriKey } from "@fjell/core";
import { Coordinate } from "@fjell/registry";

import { Options } from "../Options";
import { HookError, UpdateError, UpdateValidationError } from "../errors";
import LibLogger from '../logger';
import { Operations } from "../Operations";
import { Registry } from "../Registry";

const logger = LibLogger.get('library', 'ops', 'update');

export const wrapUpdateOperation = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    toWrap: Operations<V, S, L1, L2, L3, L4, L5>,
    options: Options<V, S, L1, L2, L3, L4, L5>,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    registry: Registry,
  ) => {

  const update = async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
  ): Promise<V> => {

    logger.default('update', { key, item });

    let itemToUpdate = item;
    itemToUpdate = await runPreUpdateHook(key, itemToUpdate);
    await validateUpdate(key, itemToUpdate);

    try {
      logger.default('Updating item', { key, item: itemToUpdate });
      let updatedItem = await toWrap.update(key, itemToUpdate) as V;
      updatedItem = await runPostUpdateHook(updatedItem);

      logger.default("updated item: %j", { updatedItem });
      return updatedItem;
    } catch (error: unknown) {
      throw new UpdateError(
        { key, item: itemToUpdate },
        coordinate,
        { cause: error as Error }
      );
    }
  }

  async function runPreUpdateHook(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    itemToUpdate: Partial<Item<S, L1, L2, L3, L4, L5>>
  ): Promise<Partial<Item<S, L1, L2, L3, L4, L5>>> {
    logger.debug('Running Pre Update Hook');
    if (options?.hooks?.preUpdate) {
      try {
        logger.default('Running preUpdate hook', { key, item: itemToUpdate });
        itemToUpdate = await options.hooks.preUpdate(key, itemToUpdate);
      } catch (error: unknown) {
        throw new HookError(
          'Error in preUpdate',
          'update',
          coordinate,
          { cause: error as Error }
        );
      }
    } else {
      logger.default('No preUpdate hook found, returning.');
    }
    return itemToUpdate;
  }

  async function runPostUpdateHook(
    updatedItem: V
  ): Promise<V> {
    logger.debug('Running Post Update Hook');
    if (options?.hooks?.postUpdate) {
      try {
        logger.default('Running postUpdate hook', { item: updatedItem });
        updatedItem = await options.hooks.postUpdate(updatedItem);
      } catch (error: unknown) {
        throw new HookError(
          'Error in postUpdate',
          'update',
          coordinate,
          { cause: error as Error }
        );
      }
    } else {
      logger.default('No postUpdate hook found, returning.');
    }
    return updatedItem;
  }

  async function validateUpdate(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    itemToUpdate: Partial<Item<S, L1, L2, L3, L4, L5>>
  ) {
    logger.debug('Validating update');
    if (!options?.validators?.onUpdate) {
      logger.default('No validator found for update, returning.');
      return;
    }

    try {
      logger.debug('Validating update', { key, item: itemToUpdate });
      const isValid = await options.validators.onUpdate(key, itemToUpdate);
      if (!isValid) {
        throw new UpdateValidationError(
          { key, item: itemToUpdate },
          coordinate,
          { cause: new Error('Invalid item') }
        );
      }
    } catch (error: unknown) {
      throw new UpdateValidationError(
        { key, item: itemToUpdate },
        coordinate,
        { cause: error as Error }
      );
    }
  }

  return update;
}
