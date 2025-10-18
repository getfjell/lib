
import {
  ComKey,
  Coordinate,
  CreateMethod,
  executeWithContext,
  Item,
  LocKeyArray,
  OperationContext,
  PriKey,
  validateKey,
  validateLocations
} from "@fjell/core";

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
  ): CreateMethod<V, S, L1, L2, L3, L4, L5> => {

  const libOptions = options;

  const create = async (
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    createOptions?: {
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>;
      locations?: never;
    } | {
      key?: never;
      locations: LocKeyArray<L1, L2, L3, L4, L5>;
    }
  ): Promise<V> => {
    try {
      logger.debug("create", { item, createOptions });

      // Validate create options
      if (createOptions) {
        if ('key' in createOptions && createOptions.key) {
          validateKey(createOptions.key, coordinate, 'create');
        }
        if ('locations' in createOptions && createOptions.locations) {
          validateLocations(createOptions.locations, coordinate, 'create');
        }
      }

      let itemToCreate = item;

      itemToCreate = await runPreCreateHook(itemToCreate, createOptions);

      await validateCreate(itemToCreate, createOptions);

      const context: OperationContext = {
        itemType: coordinate.kta[0],
        operationType: 'create',
        operationName: 'create',
        params: { item: itemToCreate, options: createOptions },
        locations: createOptions?.locations as any
      };

      let createdItem = await executeWithContext(
        () => toWrap.create(itemToCreate, createOptions),
        context
      );

      createdItem = await runPostCreateHook(createdItem);

      logger.debug("Create operation completed successfully", { createdItem });
      return createdItem;
    } catch (error) {
      throw new Error((error as Error).message, { cause: error });
    }
  };

  return create;

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
    }
    return itemToCreate;
  }

  async function runPostCreateHook(
    createdItem: V
  ): Promise<V> {
    if (libOptions?.hooks?.postCreate) {
      try {
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
      return;
    }

    try {
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

}
