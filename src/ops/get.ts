/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComKey, Coordinate, createGetWrapper, GetMethod, Item, PriKey } from "@fjell/core";

import { Options } from "../Options";
import LibLogger from '../logger';
import { Operations } from "../Operations";
import { Registry } from "../Registry";
import { InvalidKeyTypeError, LocationKeyOrderError } from "../errors";

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

  // Use the wrapper for automatic validation with custom error handling
  return createGetWrapper(
    coordinate,
    async (key) => {
      logger.debug('Get operation started', { key });
      
      // No validation needed - wrapper handles it automatically
      const item = await toWrap.get(key);
      
      logger.debug('Get operation completed', { item });
      return item;
    },
    {
      onError: (error, context) => {
        const message = error.message;
        
        // Check if it's a location key order error
        if (message.includes('Location key array order mismatch') ||
            message.includes('Location key array length mismatch')) {
          throw new LocationKeyOrderError('get', coordinate, context.params[0] as ComKey<S, L1, L2, L3, L4, L5>, { cause: error });
        }
        
        // Check if it's an invalid key type error
        if (message.includes('Invalid key') ||
            message.includes('received composite key') ||
            message.includes('received primary key')) {
          const isCompositeLib = coordinate.kta.length > 1;
          throw new InvalidKeyTypeError('get', coordinate, context.params[0], isCompositeLib, { cause: error });
        }
        
        // Re-throw original error if not a validation error we recognize
        throw error;
      }
    }
  );
}
