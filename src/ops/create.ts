
import {
  ComKey,
  Item,
  LocKeyArray,
  PriKey,
} from "@fjell/core";
import { Coordinate } from "@fjell/registry";

import { Options } from "../Options";
import { CreateValidationError, HookError } from "../errors";
import LibLogger from "../logger";
import { Operations } from "../Operations";
import { Registry } from "../Registry";

const logger = LibLogger.get("library", "ops", "create");

export const wrapCreateOperation = <
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

  const libOptions = options;

  const create = async (
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    options?: {
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
      locations?: never;
    } | {
      key?: never;
      locations: LocKeyArray<L1, L2, L3, L4, L5>,
    }
  ): Promise<V> => {
    logger.default("create", { item, options });

    let itemToCreate = item;

    itemToCreate = await runPreCreateHook(itemToCreate, options);
    await validateCreate(itemToCreate, options);

    let createdItem = await toWrap.create(itemToCreate, options);
    createdItem = await runPostCreateHook(createdItem);

    logger.default("created item: %j", { createdItem });
    return createdItem;
  }

  async function runPreCreateHook(
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    options?: {
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
      locations?: never;
    } | {
      key?: never;
      locations: LocKeyArray<L1, L2, L3, L4, L5>,
    }
  ): Promise<Partial<Item<S, L1, L2, L3, L4, L5>>> {
    let itemToCreate = item;
    if (libOptions?.hooks?.preCreate) {
      try {
        logger.default('Running preCreate hook', { item: itemToCreate, options });
        itemToCreate = await libOptions.hooks.preCreate(itemToCreate, options);
      } catch (error: unknown) {
        throw new HookError(
          'Error in preCreate',
          'create',
          coordinate,
          { cause: error as Error }
        );
      }
    } else {
      logger.default('No preCreate hook found, returning.');
    }
    return itemToCreate;
  }

  async function runPostCreateHook(
    createdItem: V
  ): Promise<V> {
    if (libOptions?.hooks?.postCreate) {
      try {
        logger.default('Running postCreate hook', { item: createdItem });
        createdItem = await libOptions.hooks.postCreate(createdItem);
      } catch (error: unknown) {
        throw new HookError(
          'Error in postCreate',
          'create',
          coordinate,
          { cause: error as Error }
        );
      }
    } else {
      logger.default('No postCreate hook found, returning.');
    }
    return createdItem;
  }

  async function validateCreate(
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    options?: {
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
      locations?: never;
    } | {
      key?: never;
      locations: LocKeyArray<L1, L2, L3, L4, L5>,
    }
  ) {
    if (!libOptions?.validators?.onCreate) {
      logger.default('No validator found for create, returning.');
      return;
    }

    try {
      logger.default('Validating create', { item, options });
      const isValid = await libOptions.validators.onCreate(item, options);
      if (!isValid) {
        throw new CreateValidationError(
          { item, options },
          coordinate,
          { cause: new Error('Invalid item') }
        );
      }
    } catch (error: unknown) {
      throw new CreateValidationError(
        { item, options },
        coordinate,
        { cause: error as Error }
      );
    }
  }

  return create;
}
