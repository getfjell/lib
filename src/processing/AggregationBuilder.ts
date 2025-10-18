import { ComKey, ikToLKA, isComKey, Item, LocKey, LocKeyArray } from "@fjell/core";
import type { Registry } from "../Registry";
import { contextManager, OperationContext, serializeKey } from "./OperationContext";
import LibLogger from "../logger";

const logger = LibLogger.get('lib', 'processing', 'AggregationBuilder');

/**
 * Definition for an aggregation relationship.
 * Aggregations are location-based queries that populate properties with related items.
 */
export interface AggregationDefinition {
  /** Key type array of the items to aggregate */
  kta: string[];
  /** Property name to populate with the aggregated result */
  property: string;
  /** Whether to return one item or many */
  cardinality: 'one' | 'many';
}

/**
 * Build an aggregation by querying for related items at the same location.
 *
 * @param item - The item to populate with aggregated data
 * @param aggregationDefinition - Definition of what to aggregate
 * @param registry - Registry to look up library instances
 * @param context - Optional operation context for caching and cycle detection
 * @returns The item with the aggregation property populated
 */
export const buildAggregation = async (
  item: Item,
  aggregationDefinition: AggregationDefinition,
  registry: Registry,
  context?: OperationContext
) => {

  // 🔍 DEBUG LOGGING: Log initial state
  logger.debug('🔍 AggregationBuilder START', {
    itemKeyType: item.key.kt,
    itemKeyPk: (item.key as any).pk,
    itemKeyFull: JSON.stringify(item.key),
    targetKta: aggregationDefinition.kta,
    aggregationProperty: aggregationDefinition.property,
    cardinality: aggregationDefinition.cardinality
  });

  // Construct the location array for aggregation queries.
  // There are two types of aggregations:
  //
  // 1. SIBLING AGGREGATIONS: Finding items at the same parent location
  //    Example: User (in Org) finding Profile (in Org) - both siblings under Org
  //    Target coordinate: ['profile'] or ['profile', 'org']
  //    Current item: User with coordinate ['user', 'org']
  //    Location to pass: [org] (parent location only)
  //
  // 2. CHILD AGGREGATIONS: Finding items contained in the current item
  //    Example: OrderForm finding OrderNoseShape contained in it
  //    Target coordinate: ['orderNoseShape', 'orderForm', 'order']
  //    Current item: OrderForm with coordinate ['orderForm', 'order']
  //    Location to pass: [orderForm, order] (current item + parents)
  //
  // We detect child aggregations by checking if the target coordinate includes
  // the current item's type in its hierarchy (after the first element).
  
  const currentItemType = item.key.kt;
  const targetKta = aggregationDefinition.kta;
  const targetKtaSliced = targetKta.slice(1);
  const isChildAggregation = targetKta.length > 1 && targetKtaSliced.includes(currentItemType);
  
  // 🔍 DEBUG LOGGING: Log detection logic
  logger.debug('🔍 AggregationBuilder DETECTION', {
    currentItemType,
    targetKta,
    targetKtaSliced,
    includesCurrentItem: targetKtaSliced.includes(currentItemType),
    isChildAggregation,
    isComKeyResult: isComKey(item.key)
  });

  let location: LocKeyArray;
  if (isComKey(item.key)) {
    // TypeScript type narrowing: explicitly cast to ComKey to access .loc property
    const comKey = item.key as ComKey<string, string, string, string, string, string>;
    
    // 🔍 DEBUG LOGGING: Log ComKey details
    logger.debug('🔍 AggregationBuilder COMKEY', {
      comKeyKt: comKey.kt,
      comKeyPk: comKey.pk,
      comKeyLoc: JSON.stringify(comKey.loc),
      comKeyLocLength: comKey.loc?.length || 0
    });
    
    if (isChildAggregation) {
      // Child aggregation: include current item as location key
      const currentItemLocKey: LocKey<string> = {
        kt: comKey.kt,
        lk: comKey.pk
      };
      location = [currentItemLocKey, ...comKey.loc] as unknown as LocKeyArray;
      
      // 🔍 DEBUG LOGGING: Log child aggregation location construction
      logger.debug('🔍 AggregationBuilder CHILD AGGREGATION', {
        currentItemLocKey,
        parentLocs: JSON.stringify(comKey.loc),
        constructedLocation: JSON.stringify(location),
        locationLength: location.length
      });
    } else {
      // Sibling aggregation: use parent locations only
      location = ikToLKA(comKey) as unknown as LocKeyArray;
      
      // 🔍 DEBUG LOGGING: Log sibling aggregation location construction
      logger.debug('🔍 AggregationBuilder SIBLING AGGREGATION', {
        ikToLKAResult: JSON.stringify(location),
        locationLength: location.length
      });
    }
  } else {
    // For primary keys, ikToLKA already returns the item as a location
    location = ikToLKA(item.key) as unknown as LocKeyArray;
    
    // 🔍 DEBUG LOGGING: Log primary key handling
    logger.debug('🔍 AggregationBuilder PRIMARY KEY', {
      ikToLKAResult: JSON.stringify(location),
      locationLength: location.length
    });
  }

  // 🔍 DEBUG LOGGING: Log final result before calling operation
  logger.debug('🔍 AggregationBuilder FINAL LOCATION', {
    finalLocation: JSON.stringify(location),
    finalLocationLength: location.length,
    operationType: aggregationDefinition.cardinality,
    targetLibraryKta: aggregationDefinition.kta
  });

  // Get the library instance from the registry using the key type array
  const libraryInstance = registry.get(aggregationDefinition.kta as any);
  if (!libraryInstance) {
    throw new Error(`Library instance not found for key type array: ${aggregationDefinition.kta.join(', ')}`);
  }

  // Create a cache key for this aggregation query
  // This helps avoid running the same aggregation multiple times
  const aggregationCacheKey = `${aggregationDefinition.kta.join('.')}_${aggregationDefinition.cardinality}_${serializeKey(item.key)}`;

  if (context) {
    // Check if this aggregation is already cached
    if (context.cache.has(aggregationCacheKey)) {
      const cachedResult = context.cache.get(aggregationCacheKey);
      logger.debug('Using cached aggregation result', {
        aggregationCacheKey,
        property: aggregationDefinition.property
      });
      item[aggregationDefinition.property] = cachedResult;
      return item;
    }

    // Note: We don't check for circular dependencies here because:
    // 1. Aggregations are location-based queries, not key-based references
    // 2. They should be allowed to run during normal item processing
    // 3. The main circular dependency concern is with references, not aggregations
  }

  // Execute aggregation within the provided context, current context, or create a new one
  // This allows aggregations within reference loading to share context for proper circular reference detection
  return contextManager.withContext(context || contextManager.getCurrentContext() || { inProgress: new Set(), cache: new Map() } as any, async () => {
    // Based on cardinality, use either one or all operation
    if (aggregationDefinition.cardinality === 'one') {
      // For one-to-one relationship, use the one operation
      return (libraryInstance as any).operations.one({}, location)
        .then((result: any) => {
          if (context) {
            context.cache.set(aggregationCacheKey, result);
          }
          item[aggregationDefinition.property] = result;
          return item;
        });
    } else {
      // For one-to-many relationship, use the all operation
      return (libraryInstance as any).operations.all({}, location)
        .then((results: any) => {
          if (context) {
            context.cache.set(aggregationCacheKey, results);
          }
          item[aggregationDefinition.property] = results;
          return item;
        });
    }
  });
}

