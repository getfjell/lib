/* eslint-disable no-undefined */
import LibLogger from "./logger";
import { Coordinate, Item } from "@fjell/core";
import { Instance as BaseInstance, createInstance as createBaseInstance, Registry } from "@fjell/registry";
import { Operations } from "./Operations";
import { Options } from "./Options";

const logger = LibLogger.get("Library");

/**
 * The Library interface represents a data model library that extends the base Instance
 * from @fjell/registry and adds operations for interacting with the data model.
 *
 * The interface extends the base Instance (which provides coordinate and registry) with:
 * - operations: Provides methods for interacting with the data model (get, find, all, etc.)
 *
 * @template V - The type of the data model item, extending Item
 * @template S - The string literal type representing the model's key type
 * @template L1-L5 - Optional string literal types for location hierarchy levels
 */
export interface Library<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> extends BaseInstance<S, L1, L2, L3, L4, L5> {
  /** The operations object that provides methods for interacting with the data model */
  operations: Operations<V, S, L1, L2, L3, L4, L5>;

  /** The options object that provides hooks, validators, finders, actions, and facets */
  options: Options<V, S, L1, L2, L3, L4, L5>;
}

export const createLibrary = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    registry: Registry,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    operations: Operations<V, S, L1, L2, L3, L4, L5>,
    options?: Options<V, S, L1, L2, L3, L4, L5>
  ): Library<V, S, L1, L2, L3, L4, L5> => {
  logger.debug("createLibrary", { coordinate, operations, registry, options });
  const baseInstance = createBaseInstance(registry, coordinate);
  return { ...baseInstance, operations, options: options || {} };
}

export const isLibrary = (library: any): library is Library<any, any, any, any, any, any, any> => {
  return library !== null &&
    library !== undefined &&
    library.coordinate !== undefined &&
    library.operations !== undefined &&
    library.options !== undefined &&
    library.registry !== undefined;
}
