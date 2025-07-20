import { Instance as AbstractInstance, createInstance as createAbstractInstance } from "@/Instance";
import LibLogger from "@/logger";
import { Operations } from "./Operations";
import { Item } from "@fjell/core";
import { Coordinate, Registry } from "@fjell/registry";
import { Options } from "./Options";

const logger = LibLogger.get("primary", "Instance");

export interface Instance<
  V extends Item<S>,
  S extends string
> extends AbstractInstance<V, S> {
  operations: Operations<V, S>;
}

export const createInstance = <
  V extends Item<S>,
  S extends string
>(
    registry: Registry,
    coordinate: Coordinate<S>,
    operations: Operations<V, S>,
    options: Options<V, S>,
  ): Instance<V, S> => {

  logger.debug("createInstance", { coordinate, operations, registry, options });

  const instance: AbstractInstance<V, S> = createAbstractInstance(registry, coordinate, operations, options);

  // Handle null/undefined returns from abstract createInstance
  if (!instance) {
    return instance as any;
  }

  return {
    ...instance,
    operations,
  };
}
