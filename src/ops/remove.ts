
import { ComKey, Item, PriKey } from "@fjell/core";
import { Coordinate } from "@fjell/registry";

import { Options } from "../Options";
import { HookError, RemoveError, RemoveValidationError } from "../errors";
import LibLogger from "../logger";
import { Operations } from "../Operations";
import { Registry } from "../Registry";

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
    options: Options<V, S, L1, L2, L3, L4, L5>,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    registry: Registry,
  ) => {

  const remove = async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
  ): Promise<V> => {
    logger.default('Removing item', { key });

    await runPreRemoveHook(key);
    await validateRemove(key);

    const item = await toWrap.remove(key);

    if (!item) {
      throw new RemoveError({ key }, coordinate);
    }

    await runPostRemoveHook(item);

    logger.default("removed item: %j", { item });
    return item;
  }

  async function runPreRemoveHook(key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>) {
    if (options?.hooks?.preRemove) {
      try {
        logger.default('Running preRemove hook', { key });
        await options.hooks.preRemove(key);
      } catch (error: unknown) {
        throw new HookError('preRemove', 'remove', coordinate, { cause: error as Error });
      }
    } else {
      logger.default('No preRemove hook found, returning.');
    }
  }

  async function runPostRemoveHook(item: V) {
    if (options?.hooks?.postRemove) {
      try {
        logger.default('Running postRemove hook', { item });
        await options.hooks.postRemove(item);
      } catch (error: unknown) {
        throw new HookError('postRemove', 'remove', coordinate, { cause: error as Error });
      }
    } else {
      logger.default('No postRemove hook found, returning.');
    }
  }

  async function validateRemove(key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>) {
    if (!options?.validators?.onRemove) {
      logger.default('No validator found for remove, returning.');
      return;
    }

    try {
      logger.default('Validating remove', { key });
      const isValid = await options.validators.onRemove(key);
      if (!isValid) {
        throw new RemoveValidationError(
          { key },
          coordinate,
          { cause: new Error('Error validating remove') }
        );
      }
    } catch (error: unknown) {
      throw new RemoveValidationError(
        { key },
        coordinate,
        { cause: error as Error }
      );
    }
  }

  return remove;
}
