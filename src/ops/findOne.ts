import {
  Coordinate,
  FindOneMethod,
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
import LibLogger from '../logger';
import { Operations } from "../Operations";
import { Registry } from "../Registry";

const logger = LibLogger.get('library', 'ops', 'findOne');

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

  const { finders } = options || {};

  const findOne = async (
    finder: string,
    params: OperationParams,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V | null> => {
    const locs = locations ?? [];
    logger.debug("findOne", { finder, params, locations: locs });

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
      operationType: 'findOne',
      operationName: finder,
      params,
      locations: locs as any
    };

    return executeWithContext(
      () => toWrap.findOne(finder, params, locs),
      context
    );
  };

  return findOne;
}
