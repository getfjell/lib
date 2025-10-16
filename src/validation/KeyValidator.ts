import { ComKey, isComKey, isPriKey, LocKey, LocKeyArray, PriKey } from "@fjell/core";
import { Coordinate } from "@fjell/registry";
import { InvalidKeyTypeError, LocationKeyOrderError } from "../errors";
import LibLogger from "../logger";

const logger = LibLogger.get('validation', 'KeyValidator');

/**
 * Validates that the location key array in a ComKey matches the expected hierarchy
 * defined by the coordinate's key type array (kta).
 */
const validateLocationKeyOrder = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    key: ComKey<S, L1, L2, L3, L4, L5>,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    operation: string
  ): void => {
  const keyTypeArray = coordinate.kta;
  const expectedLocationTypes = keyTypeArray.slice(1); // Remove primary key type
  const actualLocationTypes = key.loc.map(loc => loc.kt);
  
  // Check if lengths match
  if (expectedLocationTypes.length !== actualLocationTypes.length) {
    logger.error('Location key array length mismatch', {
      expected: expectedLocationTypes.length,
      actual: actualLocationTypes.length,
      key,
      coordinate,
      operation
    });
    throw new LocationKeyOrderError(operation, coordinate, key);
  }
  
  // Check if each position matches
  for (let i = 0; i < expectedLocationTypes.length; i++) {
    if (expectedLocationTypes[i] !== actualLocationTypes[i]) {
      logger.error('Location key array order mismatch', {
        position: i,
        expected: expectedLocationTypes[i],
        actual: actualLocationTypes[i],
        key,
        coordinate,
        operation
      });
      throw new LocationKeyOrderError(operation, coordinate, key);
    }
  }
};

/**
 * Validates that a standalone LocKeyArray parameter matches the expected hierarchy
 * defined by the coordinate's key type array (kta).
 *
 * This is used to validate the `locations` parameter passed to operations like
 * all(), find(), create(), etc.
 *
 * @param locations - The location key array to validate
 * @param coordinate - The coordinate defining the library's key type hierarchy
 * @param operation - The operation name (for error messages)
 * @throws Error if location key array order is incorrect
 */
export const validateLocations = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    locations: LocKeyArray<L1, L2, L3, L4, L5> | [] | undefined,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    operation: string
  ): void => {
  // Skip validation if locations is empty or undefined
  if (!locations || locations.length === 0) {
    return;
  }
  
  const keyTypeArray = coordinate.kta;
  const expectedLocationTypes = keyTypeArray.slice(1); // Remove primary key type
  const actualLocationTypes = (locations as Array<LocKey<L1 | L2 | L3 | L4 | L5>>).map(loc => loc.kt);
  
  logger.debug(`Validating locations for ${operation}`, {
    expected: expectedLocationTypes,
    actual: actualLocationTypes,
    coordinate: keyTypeArray
  });
  
  // Check if lengths match
  if (actualLocationTypes.length > expectedLocationTypes.length) {
    logger.error('Location key array has too many elements', {
      expected: expectedLocationTypes.length,
      actual: actualLocationTypes.length,
      expectedTypes: expectedLocationTypes,
      actualTypes: actualLocationTypes,
      coordinate,
      operation
    });
    throw new Error(
      `Invalid location key array for ${operation}: ` +
      `Expected at most ${expectedLocationTypes.length} location keys ` +
      `(hierarchy: [${expectedLocationTypes.join(', ')}]), ` +
      `but received ${actualLocationTypes.length} ` +
      `(types: [${actualLocationTypes.join(', ')}])`
    );
  }
  
  // Check if each position matches the expected hierarchy
  for (let i = 0; i < actualLocationTypes.length; i++) {
    if (expectedLocationTypes[i] !== actualLocationTypes[i]) {
      logger.error('Location key array order mismatch', {
        position: i,
        expected: expectedLocationTypes[i],
        actual: actualLocationTypes[i],
        expectedHierarchy: expectedLocationTypes,
        actualOrder: actualLocationTypes,
        coordinate,
        operation
      });
      throw new Error(
        `Invalid location key array order for ${operation}: ` +
        `At position ${i}, expected key type "${expectedLocationTypes[i]}" ` +
        `but received "${actualLocationTypes[i]}". ` +
        `Location keys must be ordered according to the hierarchy: [${expectedLocationTypes.join(', ')}]. ` +
        `Received order: [${actualLocationTypes.join(', ')}]`
      );
    }
  }
  
  logger.debug(`Location key array validation passed for ${operation}`, { locations });
};

/**
 * Validates that a key is valid and matches the expected library type.
 *
 * This function performs comprehensive validation:
 * 1. Validates key type (PriKey vs ComKey) matches library type (primary vs composite)
 * 2. For composite keys, validates location key array order matches hierarchy
 * 3. Validates key structure is correct
 *
 * @param key - The key to validate
 * @param coordinate - The coordinate defining the library's key type hierarchy
 * @param operation - The operation name (for error messages)
 * @throws InvalidKeyTypeError if key type doesn't match library type
 * @throws LocationKeyOrderError if location key array order is incorrect
 */
export const validateKey = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    operation: string
  ): void => {
  logger.debug(`Validating key for ${operation}`, { key, coordinate: coordinate.kta });
  
  // Runtime validation: Check if the key type matches the library type
  const isCompositeLibrary = coordinate.kta.length > 1;
  const keyIsComposite = isComKey(key);
  const keyIsPrimary = isPriKey(key);
  
  // Validate that the key type matches the library type
  if (isCompositeLibrary && !keyIsComposite) {
    // This is a composite library but received a primary key
    logger.error(`Composite library received primary key in ${operation}`, { key, coordinate });
    throw new InvalidKeyTypeError(operation, coordinate, key, true);
  }
  
  if (!isCompositeLibrary && keyIsComposite) {
    // This is a primary library but received a composite key
    logger.error(`Primary library received composite key in ${operation}`, { key, coordinate });
    throw new InvalidKeyTypeError(operation, coordinate, key, false);
  }
  
  if (!keyIsPrimary && !keyIsComposite) {
    // Invalid key structure
    logger.error(`Invalid key structure in ${operation}`, { key, coordinate });
    throw new InvalidKeyTypeError(operation, coordinate, key, isCompositeLibrary);
  }
  
  // For composite keys, validate the location key array order
  if (keyIsComposite) {
    const comKey = key as ComKey<S, L1, L2, L3, L4, L5>;
    
    // Empty loc array is a special case: it means "find by primary key across all locations"
    // This is used for foreign key references to composite items where the location context is unknown
    if (comKey.loc.length === 0) {
      logger.debug(`Empty loc array detected in ${operation} - will search across all locations`, { key });
    } else {
      // For non-empty loc arrays, validate the order matches the expected hierarchy
      validateLocationKeyOrder(comKey, coordinate, operation);
    }
  }
  
  logger.debug(`Key validation passed for ${operation}`, { key });
};

