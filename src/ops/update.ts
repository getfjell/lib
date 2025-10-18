import { ComKey, Coordinate, createUpdateWrapper, Item, PriKey, UpdateMethod } from "@fjell/core";

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
  ): UpdateMethod<V, S, L1, L2, L3, L4, L5> => {

  // Use the wrapper for automatic validation
  return createUpdateWrapper(
    coordinate,
    async (key, item) => {
      logger.debug('Update operation started', { key, coordinate: coordinate.kta });

      let itemToUpdate = item;
      
      itemToUpdate = await runPreUpdateHook(key, itemToUpdate);

      await validateUpdate(key, itemToUpdate);

      try {
        let updatedItem = await toWrap.update(key, itemToUpdate) as V;

        updatedItem = await runPostUpdateHook(updatedItem);

        logger.debug("Update operation completed successfully", { updatedItem });
        return updatedItem;
      } catch (error: unknown) {
        logger.error('Update operation failed', { error, key, item: itemToUpdate });
        throw new UpdateError(
          { key, item: itemToUpdate },
          coordinate,
          { cause: error as Error }
        );
      }
    }
  );

  async function runPreUpdateHook(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    itemToUpdate: Partial<Item<S, L1, L2, L3, L4, L5>>
  ): Promise<Partial<Item<S, L1, L2, L3, L4, L5>>> {
    if (options?.hooks?.preUpdate) {
      try {
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
    }
    return itemToUpdate;
  }

  async function runPostUpdateHook(
    updatedItem: V
  ): Promise<V> {
    if (options?.hooks?.postUpdate) {
      try {
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
    }
    return updatedItem;
  }

  async function validateUpdate(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    itemToUpdate: Partial<Item<S, L1, L2, L3, L4, L5>>
  ) {
    if (!options?.validators?.onUpdate) {
      return;
    }

    try {
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

}
