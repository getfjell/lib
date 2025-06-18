import { Definition } from "@/Definition";
import { Instance as AbstractInstance, createInstance as createAbstractInstance } from "@/Instance";
import { Operations } from "@/Operations";
import { Registry } from "@/Registry";
import { Item } from "@fjell/core";

export interface Instance<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> extends AbstractInstance<V, S, L1, L2, L3, L4, L5> {
  parent?: AbstractInstance<Item<L1, L2, L3, L4, L5>, L1, L2, L3, L4, L5>;
}

export const createInstance = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(
    parent: AbstractInstance<Item<L1, L2, L3, L4, L5>, L1, L2, L3, L4, L5>,
    definition: Definition<V, S, L1, L2, L3, L4, L5>,
    operations: Operations<V, S, L1, L2, L3, L4, L5>,
    registry: Registry,
  ): Instance<V, S, L1, L2, L3, L4, L5> => {
  const instance: AbstractInstance<V, S, L1, L2, L3, L4, L5> = createAbstractInstance(definition, operations, registry);
  return {
    ...instance,
    parent,
  };
}
