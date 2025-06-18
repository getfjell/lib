import { Definition } from "@/Definition";
import { Instance as AbstractInstance, createInstance as createAbstractInstance } from "@/Instance";
import { Operations } from "@/Operations";
import { Item } from "@fjell/core";
import LibLogger from "@/logger";
import { Registry } from "@/Registry";

const logger = LibLogger.get("primary", "Instance");

export interface Instance<
  V extends Item<S>,
  S extends string
> {
  definition: Definition<V, S>;
  operations: Operations<V, S>;
}

export const createInstance = <
  V extends Item<S>,
  S extends string
>(
    definition: Definition<V, S>,
    operations: Operations<V, S>,
    registry: Registry
  ): Instance<V, S> => {

  logger.debug("createInstance", { definition, operations });

  const instance: AbstractInstance<V, S> = createAbstractInstance(definition, operations, registry);
  logger.debug("created instance", { instance });
  return {
    ...instance
  };
}
