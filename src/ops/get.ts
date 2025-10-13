/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComKey, Item, PriKey } from "@fjell/core";
import { Coordinate } from "@fjell/registry";

import { Options } from "../Options";
import LibLogger from '../logger';
import { Operations } from "../Operations";
import { Registry } from "../Registry";
import { validateKey } from "../validation/KeyValidator";

const logger = LibLogger.get('library', 'ops', 'get');

export const wrapGetOperation = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    toWrap: Operations<V, S, L1, L2, L3, L4, L5>,
    options: Options<V, S, L1, L2, L3, L4, L5>,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,

    registry: Registry,
  ) => {

  const get = async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
  ): Promise<V> => {
    logger.default('get', { key });
    
    // Validate key type and location key order
    validateKey(key, coordinate, 'get');
    
    const item = await toWrap.get(key);
    logger.default("get: %j", { item });
    return item;
  }

  return get;

}
