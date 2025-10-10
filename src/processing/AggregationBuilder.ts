import { ikToLKA, Item, LocKeyArray } from "@fjell/core";
import type { Registry } from "../Registry";
import { contextManager, OperationContext, serializeKey } from "./OperationContext";
import logger from "../logger";

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

  const location = ikToLKA(item.key) as unknown as LocKeyArray;

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

