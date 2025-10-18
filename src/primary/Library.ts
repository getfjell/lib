import { Library as AbstractLibrary, createLibrary as createAbstractLibrary } from "../Library";
import LibLogger from "../logger";
import { Operations } from "./Operations";
import { Coordinate, Item } from "@fjell/core";
import { Registry } from "@fjell/registry";
import { Options } from "./Options";

const logger = LibLogger.get("primary", "Instance");

export interface Library<
  V extends Item<S>,
  S extends string
> extends AbstractLibrary<V, S> {
  operations: Operations<V, S>;
}

export const createLibrary = <
  V extends Item<S>,
  S extends string
>(
    registry: Registry,
    coordinate: Coordinate<S>,
    operations: Operations<V, S>,
    options: Options<V, S>,
  ): Library<V, S> => {

  logger.debug("createLibrary", { coordinate, operations, registry, options });

  const library: AbstractLibrary<V, S> = createAbstractLibrary(registry, coordinate, operations, options);

  // Handle null/undefined returns from abstract createLibrary
  if (!library) {
    return library as any;
  }

  return {
    ...library,
    operations,
  };
}
