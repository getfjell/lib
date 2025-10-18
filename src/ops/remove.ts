
import { ComKey, Item, PriKey, RemoveMethod } from "@fjell/core";
import { Coordinate } from "@fjell/registry";

import { Options } from "../Options";
import { HookError, RemoveError, RemoveValidationError } from "../errors";
import LibLogger from "../logger";
import { Operations } from "../Operations";
import { Registry } from "../Registry";
import { validateKey } from "../validation/KeyValidator";

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
  ): RemoveMethod<V, S, L1, L2, L3, L4, L5> => {

  const remove = async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
  ): Promise<V> => {
    logger.default('📚 [LIB] Wrapped remove operation called', { key, coordinate: coordinate.kta });

    // Validate key type and location key order
    validateKey(key, coordinate, 'remove');

    logger.default('📚 [LIB] Running pre-remove hook');
    await runPreRemoveHook(key);
    logger.default('📚 [LIB] Pre-remove hook completed');

    logger.default('📚 [LIB] Running remove validation');
    await validateRemove(key);
    logger.default('📚 [LIB] Remove validation completed');

    logger.default('📚 [LIB] Calling underlying operation (lib-firestore)', { key });
    const item = await toWrap.remove(key);
    logger.default('📚 [LIB] Underlying operation completed', { item });

    if (!item) {
      logger.error('📚 [LIB] Remove operation failed - no item returned', { key });
      throw new RemoveError({ key }, coordinate);
    }

    logger.default('📚 [LIB] Running post-remove hook');
    await runPostRemoveHook(item);
    logger.default('📚 [LIB] Post-remove hook completed', { item });

    logger.default("📚 [LIB] Wrapped remove operation completed", { item });
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
