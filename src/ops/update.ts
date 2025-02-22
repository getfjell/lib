import { ComKey, Item, PriKey, TypesProperties } from "@fjell/core";

import { Definition } from "@/Definition";
import { HookError, UpdateError, UpdateValidationError } from "@/errors";
import LibLogger from '@/logger';
import { Operations } from "@/Operations";

const logger = LibLogger.get('library', 'ops','update');

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
    definition: Definition<V, S, L1, L2, L3, L4, L5>,
  ) => {

  const update = async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    item: TypesProperties<V, S, L1, L2, L3, L4, L5>,
  ): Promise<V> => {
  
    logger.info('update', { key, item });

    let itemToUpdate = item;
    itemToUpdate = await runPreUpdateHook(key, itemToUpdate);
    await validateUpdate(key, itemToUpdate);

    try {
      logger.debug('Updating item', { key, item: itemToUpdate });
      let updatedItem = await toWrap.update(key, itemToUpdate) as V;
      updatedItem = await runPostUpdateHook(updatedItem);

      return updatedItem;
    } catch (error: unknown) {
      throw new UpdateError(
        { key, item: itemToUpdate },
        definition.coordinate,
        { cause: error as Error }
      );
    }
  }

  async function runPreUpdateHook(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    itemToUpdate: TypesProperties<V, S, L1, L2, L3, L4, L5>
  ): Promise<TypesProperties<V, S, L1, L2, L3, L4, L5>> {
    logger.debug('Running Pre Update Hook');
    if (definition.options?.hooks?.preUpdate) {
      try {
        logger.default('Running preUpdate hook', { key, item: itemToUpdate });
        itemToUpdate = await definition.options.hooks.preUpdate(key, itemToUpdate);
      } catch (error: unknown) {
        throw new HookError(
          'Error in preUpdate',
          'update',
          definition.coordinate,
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
    if (definition.options?.hooks?.postUpdate) {
      try {
        logger.default('Running postUpdate hook', { item: updatedItem });
        updatedItem = await definition.options.hooks.postUpdate(updatedItem);
      } catch (error: unknown) {
        throw new HookError(
          'Error in postUpdate',
          'update',
          definition.coordinate,
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
    itemToUpdate: TypesProperties<V, S, L1, L2, L3, L4, L5>
  ) {
    logger.debug('Validating update');
    if (!definition.options?.validators?.onUpdate) {
      logger.default('No validator found for update, returning.');
      return;
    }

    try {
      logger.info('Validating update', { key, item: itemToUpdate });
      const isValid = await definition.options.validators.onUpdate(key, itemToUpdate);
      if (!isValid) {
        throw new UpdateValidationError(
          { key, item: itemToUpdate },
          definition.coordinate,
          { cause: new Error('Invalid item') }
        );
      }
    } catch (error: unknown) {
      throw new UpdateValidationError(
        { key, item: itemToUpdate },
        definition.coordinate,
        { cause: error as Error }
      );
    }
  }

  return update;
}
