import { createInstance as createAbstractInstance, Instance } from "@/Instance";
import LibLogger from "@/logger";
import { Operations } from "@/Operations";
import { Item } from "@fjell/core";
import { Coordinate, Registry } from "@fjell/registry";
import { Options } from "./Options";

const logger = LibLogger.get("primary", "Instance");

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

  const instance: Instance<V, S> = createAbstractInstance(registry, coordinate, operations, options);
  logger.debug("created instance", { instance });
  return instance;
}
