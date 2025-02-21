import { Definition } from "@/Definition";
import { Instance as AbstractInstance, createInstance as createAbstractInstance } from "@/Instance";
import { Operations } from "@/Operations";
import { Item } from "@fjell/core";

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
    operations: Operations<V, S>
  ): Instance<V, S> => {
  const instance: AbstractInstance<V, S> = createAbstractInstance(definition, operations);
  return {
    ...instance
  };
}
