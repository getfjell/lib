import {
  Coordinate,
  FindMethod,
  FindOperationResult,
  FindOptions,
  Item,
  LocKeyArray,
  OperationParams,
} from "@fjell/types";
import {
  executeWithContext,
  OperationContext,
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
  // Note: FindMethod now returns FindOperationResult<V>

  const { finders } = options || {};

  const find = async (
    finder: string,
    params: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | [],
    findOptions?: FindOptions
  ): Promise<FindOperationResult<V>> => {
    const locs = locations ?? [];
    logger.debug("find", { finder, params, locations: locs, findOptions });

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
      () => (toWrap as any).find(finder, params, locs, findOptions) as Promise<FindOperationResult<V>>,
      context
    );
  };

  return find as unknown as FindMethod<V, S, L1, L2, L3, L4, L5>;
}
