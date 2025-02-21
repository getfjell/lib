/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComKey, Item, PriKey } from "@fjell/core";

import { Definition } from "@/Definition";
import LibLogger from '@/logger';
import { Operations } from "@/Operations";

const logger = LibLogger.get('library', 'ops','get');

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
    definition: Definition<V, S, L1, L2, L3, L4, L5>,
  ) => {

  const get = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
  ): Promise<V> => {
    logger.default('get', { key });
    const item = await toWrap.get(key);
    return item;
  }

  return get;

}
    