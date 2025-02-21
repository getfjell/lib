
import { ComKey, Item, PriKey } from "@fjell/core";

import { Definition } from "@/Definition";
import { HookError, RemoveError, RemoveValidationError } from "@/errors";
import LibLogger from "@/logger";
import { Operations } from "@/Operations";

const logger = LibLogger.get('library', 'ops', 'remove');

export const wrapRemoveOperation = <
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

  const remove = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
  ): Promise<V> => {
    logger.default('Removing item', { key });

    await runPreRemoveHook(key);
    await validateRemove(key);

    const item = await toWrap.remove(key);

    if (!item) {
      throw new RemoveError({ key }, definition.coordinate);
    }

    await runPostRemoveHook(item);

    return item;
  }

  async function runPreRemoveHook(key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>) {
    if (definition.options?.hooks?.preRemove) {
      try {
        logger.default('Running preRemove hook', { key });
        await definition.options.hooks.preRemove(key);
      } catch (error: unknown) {
        throw new HookError('preRemove', 'remove', definition.coordinate, { cause: error as Error });
      }
    } else {
      logger.default('No preRemove hook found, returning.');
    }
  }

  async function runPostRemoveHook(item: V) {
    if (definition.options?.hooks?.postRemove) {
      try {
        logger.default('Running postRemove hook', { item });
        await definition.options.hooks.postRemove(item);
      } catch (error: unknown) {
        throw new HookError('postRemove', 'remove', definition.coordinate, { cause: error as Error });
      }
    } else {
      logger.default('No postRemove hook found, returning.');
    }
  }

  async function validateRemove(key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>) {
    if (!definition.options?.validators?.onRemove) {
      logger.default('No validator found for remove, returning.');
      return;
    }

    try {
      logger.default('Validating remove', { key });
      const isValid = await definition.options.validators.onRemove(key);
      if (!isValid) {
        throw new RemoveValidationError(
          { key },
          definition.coordinate,
          { cause: new Error('Error validating remove') }
        );
      }
    } catch (error: unknown) {
      throw new RemoveValidationError(
        { key },
        definition.coordinate,
        { cause: error as Error }
      );
    }
  }
  
  return remove;
}