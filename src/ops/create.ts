
import {
  ComKey,
  Item,
  LocKeyArray,
  PriKey,
  TypesProperties
} from "@fjell/core";

import { Definition } from "@/Definition";
import { CreateValidationError, HookError } from "@/errors";
import LibLogger from "@/logger";
import { Operations } from "@/Operations";

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
    definition: Definition<V, S, L1, L2, L3, L4, L5>,
  ) => {

  const libOptions = definition.options;

  const create = async (
    item: TypesProperties<V, S, L1, L2, L3, L4, L5>,
    options?: {
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
      locations?: never;
    } | {
      key?: never;
      locations: LocKeyArray<L1, L2, L3, L4, L5>,
    }
  ): Promise<V> => {
    logger.debug("create", { item, options });

    let itemToCreate = item;

    itemToCreate = await runPreCreateHook(itemToCreate, options);
    await validateCreate(itemToCreate, options);
    
    let createdItem = await toWrap.create(itemToCreate, options);
    createdItem = await runPostCreateHook(createdItem);

    logger.default("created item: %j", { createdItem });
    return createdItem;
  }

  async function runPreCreateHook(
    item: TypesProperties<V, S, L1, L2, L3, L4, L5>,
    options?: {
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
      locations?: never;
    } | {
      key?: never;
      locations: LocKeyArray<L1, L2, L3, L4, L5>,
    }
  ): Promise<TypesProperties<V, S, L1, L2, L3, L4, L5>> {
    let itemToCreate = item;
    if (libOptions?.hooks?.preCreate) {
      try {
        logger.debug('Running preCreate hook', { item: itemToCreate, options });
        itemToCreate = await libOptions.hooks.preCreate(itemToCreate, options);
      } catch (error: unknown) {
        throw new HookError(
          'Error in preCreate',
          'create',
          definition.coordinate,
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
          definition.coordinate,
          { cause: error as Error }
        );
      }
    } else {
      logger.default('No postCreate hook found, returning.');
    }
    return createdItem;
  }

  async function validateCreate(
    item: TypesProperties<V, S, L1, L2, L3, L4, L5>,
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
      logger.debug('Validating create', { item, options });
      const isValid = await libOptions.validators.onCreate(item, options);
      if (!isValid) {
        throw new CreateValidationError(
          { item, options },
          definition.coordinate,
          { cause: new Error('Invalid item') }
        );
      }
    } catch (error: unknown) {
      throw new CreateValidationError(
        { item, options },
        definition.coordinate,
        { cause: error as Error }
      );
    }
  }

  return create;
}