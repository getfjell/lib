import { Item } from "@fjell/core";

import { Coordinate } from "./Coordinate";
import { createOptions, Options } from "./Options";

export interface Definition<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> {
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>;
  options: Options<V, S, L1, L2, L3, L4, L5>;
}

export const createDefinition = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    options?: Options<V, S, L1, L2, L3, L4, L5>
  ): Definition<V, S, L1, L2, L3, L4, L5> => {

  return {
    coordinate,
    options: createOptions<V, S, L1, L2, L3, L4, L5>(options),
  };
}