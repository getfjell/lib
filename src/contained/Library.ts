import { Library as AbstractLibrary, createLibrary as createAbstractLibrary } from "../Library";
import { Operations } from "./Operations";
import { Registry } from "../Registry";
import { Item } from "@fjell/core";
import { Coordinate } from "@fjell/registry";
import { Options } from "./Options";

export interface Library<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> extends AbstractLibrary<V, S, L1, L2, L3, L4, L5> {
  parent?: AbstractLibrary<Item<L1, L2, L3, L4, L5>, L1, L2, L3, L4, L5>;
  operations: Operations<V, S, L1, L2, L3, L4, L5>;
}

export const createLibrary = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(
    parent: AbstractLibrary<Item<L1, L2, L3, L4, L5>, L1, L2, L3, L4, L5>,
    registry: Registry,
    coordinate: Coordinate<S>,
    operations: Operations<V, S, L1, L2, L3, L4, L5>,
    options: Options<V, S, L1, L2, L3, L4, L5>,
  ): Library<V, S, L1, L2, L3, L4, L5> => {
  const library: AbstractLibrary<V, S, L1, L2, L3, L4, L5> = createAbstractLibrary(registry, coordinate, operations, options);
  return {
    ...library,
    parent,
  };
}
