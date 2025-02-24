import { ItemTypeArray } from "@fjell/core";

import LibLogger from "@/logger";

const logger = LibLogger.get("Coordinate");

export interface Coordinate<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> {
  kta: ItemTypeArray<S, L1, L2, L3, L4, L5>;
  scopes: string[];
  toString: () => string;
}

export const createCoordinate = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(kta: ItemTypeArray<S, L1, L2, L3, L4, L5>, scopes: string[]): Coordinate<S, L1, L2, L3, L4, L5> => {
  const toString = () => {
    logger.debug("toString", { kta, scopes });
    return `${kta.join(', ')} - ${scopes.join(', ')}`;
  }
  logger.debug("createCoordinate", { kta, scopes, toString });
  return { kta, scopes, toString };
}