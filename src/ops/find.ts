import {
  Coordinate,
  executeWithContext,
  FindMethod,
  Item,
  LocKeyArray,
  OperationContext,
  OperationParams,
  ValidationError
} from "@fjell/core";

import { Options } from "../Options";
import LibLogger from "../logger";
import { Operations } from "../Operations";
import { Registry } from "../Registry";

const logger = LibLogger.get("library", "ops", "find");

export const wrapFindOperation = <
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
  ): FindMethod<V, S, L1, L2, L3, L4, L5> => {

  const { finders } = options || {};

  const find = async (
    finder: string,
    params: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V[]> => {
    const locs = locations ?? [];
    logger.debug("find", { finder, params, locations: locs });

    if (!finders?.[finder]) {
      const availableFinders = finders ? Object.keys(finders) : [];
      throw new ValidationError(
        `Finder "${finder}" not found`,
        availableFinders,
        'Use one of the available finders'
      );
    }

    const context: OperationContext = {
      itemType: coordinate.kta[0],
      operationType: 'find',
      operationName: finder,
      params,
      locations: locs as any
    };

    return executeWithContext(
      () => toWrap.find(finder, params, locs),
      context
    );
  };

  return find;
}
