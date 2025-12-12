
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
import { validateSchema } from "@fjell/core/validation";

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
    } catch (error: any) {
      // If it is a CreateValidationError, throw it directly
      if (error instanceof CreateValidationError) {
        throw error;
      }
      
      // Log structured error information
      logger.error('Create operation failed', {
        component: 'lib',
        operation: 'create',
        itemType: coordinate.kta[0],
        itemData: JSON.stringify(item),
        createOptions: JSON.stringify(createOptions),
        errorType: error?.constructor?.name || typeof error,
        errorMessage: error?.message,
        errorCode: error?.errorInfo?.code || error?.code,
        suggestion: 'Check validation rules, required fields, unique constraints, and hooks implementation',
        coordinate: JSON.stringify(coordinate),
        stack: error?.stack
      });
      
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
      } catch (error: any) {
        logger.error('preCreate hook failed', {
          component: 'lib',
          operation: 'create',
          hook: 'preCreate',
          itemType: coordinate.kta[0],
          itemData: JSON.stringify(item),
          errorType: error?.constructor?.name,
          errorMessage: error?.message,
          suggestion: 'Check preCreate hook implementation for errors',
          coordinate: JSON.stringify(coordinate),
          stack: error?.stack
        });
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
    // 1. Schema Validation
    if (libOptions?.validation?.schema) {
      try {
        // Validate and potentially transform the item
        // We cast to any because schema validation might return a slightly different type during transformation,
        // but we expect it to be compatible with V for the rest of the flow.
        await validateSchema(item, libOptions.validation.schema);
      } catch (error: any) {
        throw new CreateValidationError(
          { item, options },
          coordinate,
          { cause: error as Error }
        );
      }
    }

    // 2. Manual Validators (legacy/custom)
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
      // If it's already a validation error (from schema above), just rethrow
      if (error instanceof CreateValidationError) throw error;

      throw new CreateValidationError(
        { item, options },
        coordinate,
        { cause: error as Error }
      );
    }
  }

}
