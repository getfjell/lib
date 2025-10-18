import { Coordinate, createFindOneWrapper, FindOneMethod, Item } from "@fjell/core";

import { Options } from "../Options";
import LibLogger from '../logger';
import { Operations } from "../Operations";
import { Registry } from "../Registry";

const logger = LibLogger.get('library', 'ops', 'one');

export const wrapFindOneOperation = <
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    registry: Registry,
  ): FindOneMethod<V, S, L1, L2, L3, L4, L5> => {

  // Use the wrapper for automatic validation
  return createFindOneWrapper(
    coordinate,
    async (finder, finderParams, locations) => {
      logger.debug("FindOne operation started", { finder, finderParams, locations });
      
      const foundItems = await toWrap.findOne(finder, finderParams, locations);
      logger.debug("FindOne operation completed", { foundItems });
      return foundItems;
    }
  );
}
