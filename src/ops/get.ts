/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ComKey,
  Coordinate,
  executeWithContext,
  GetMethod,
  Item,
  OperationContext,
  PriKey,
  validateKey
} from "@fjell/core";

import { Options } from "../Options";
import LibLogger from '../logger';
import { Operations } from "../Operations";
import { Registry } from "../Registry";

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
  ): GetMethod<V, S, L1, L2, L3, L4, L5> => {

  const get = async (
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>
  ): Promise<V | null> => {
    logger.debug('get', { key });

    // Validate key structure
    validateKey(key, coordinate, 'get');

    const context: OperationContext = {
      itemType: coordinate.kta[0],
      operationType: 'get',
      operationName: 'get',
      params: { key },
      key
    };

    return executeWithContext(
      () => toWrap.get(key),
      context
    );
  };

  return get;
}
