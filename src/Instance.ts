/* eslint-disable no-undefined */
import { Item } from "@fjell/core";
import { Definition } from "./Definition";
import { Operations } from "./Operations";

export interface Instance<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  definition: Definition<V, S, L1, L2, L3, L4, L5>;
  operations: Operations<V, S, L1, L2, L3, L4, L5>;
}

export const createInstance = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    definition: Definition<V, S, L1, L2, L3, L4, L5>,
    operations: Operations<V, S, L1, L2, L3, L4, L5>,
  ): Instance<V, S, L1, L2, L3, L4, L5> => {
  return { definition, operations };
}

export const isInstance = (instance: any): instance is Instance<any, any, any, any, any, any, any> => {
  return instance !== null &&
    instance !== undefined &&
    instance.definition !== undefined &&
    instance.operations !== undefined;
}