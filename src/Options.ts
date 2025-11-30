import {
  ActionMethod,
  AllActionMethod,
  AllFacetMethod,
  CreateOptions,
  FacetMethod,
  FinderMethod,
  OperationParams
} from "@fjell/core";
import { ComKey, Item, PriKey } from "@fjell/core";
import type { SchemaValidator } from "@fjell/core/validation";
import deepmerge from "deepmerge";
import LibLogger from "./logger";
import { AggregationDefinition, ReferenceDefinition } from "./processing";

const logger = LibLogger.get("Options");

// Re-export method types from core for convenience
export type {
  FinderMethod,
  ActionMethod,
  AllActionMethod,
  FacetMethod,
  AllFacetMethod,
  OperationParams,
  CreateOptions
};

// Alias for backwards compatibility
export type FinderParams = OperationParams;

// Re-export SchemaValidator from core for convenience
export type { SchemaValidator };

export interface ValidationOptions<V> {
  schema?: SchemaValidator<V>;
  updateSchema?: SchemaValidator<Partial<V>>;
}

// TODO: The codesmell here is that we're passing lib to all the hooks.  This might be better with a create pattern.
export interface Options<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  hooks?: {
    preCreate?: (
      item: Partial<Item<S, L1, L2, L3, L4, L5>>,
      options?: CreateOptions<S, L1, L2, L3, L4, L5>
    ) => Promise<Partial<Item<S, L1, L2, L3, L4, L5>>>;
    postCreate?: (
      item: V,
    ) => Promise<V>;
    preUpdate?: (
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
      item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    ) => Promise<Partial<Item<S, L1, L2, L3, L4, L5>>>;
    postUpdate?: (
      item: V,
    ) => Promise<V>;
    preRemove?: (
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    ) => Promise<Partial<Item<S, L1, L2, L3, L4, L5>>>;
    postRemove?: (
      item: V,
    ) => Promise<V>;
  },
  validators?: {
    onCreate?: (
      item: Partial<Item<S, L1, L2, L3, L4, L5>>,
      options?: CreateOptions<S, L1, L2, L3, L4, L5>
    ) => Promise<boolean>;
    onUpdate?: (
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
      item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    ) => Promise<boolean>;
    onRemove?: (
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    ) => Promise<boolean>;
  },
  finders?: Record<string, FinderMethod<V, S, L1, L2, L3, L4, L5>>,
  actions?: Record<string, ActionMethod<V, S, L1, L2, L3, L4, L5>>,
  facets?: Record<string, FacetMethod<V, S, L1, L2, L3, L4, L5>>,
  allActions?: Record<string, AllActionMethod<V, S, L1, L2, L3, L4, L5>>,
  allFacets?: Record<string, AllFacetMethod<L1, L2, L3, L4, L5>>,
  references?: ReferenceDefinition[],
  aggregations?: AggregationDefinition[],
  validation?: ValidationOptions<V>,
}

export const createDefaultOptions = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(): Options<V, S, L1, L2, L3, L4, L5> => {
  logger.debug("createDefaultOptions");
  function clearAggs(
    item: Partial<Item<S, L1, L2, L3, L4, L5>>
  ): Partial<Item<S, L1, L2, L3, L4, L5>> {
    delete item.aggs;
    return item;
  }

  return {
    hooks: {
      // TODO: "We need to figure out how to make this an array of hooks..."
      preCreate: async (
        item: Partial<Item<S, L1, L2, L3, L4, L5>>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        options?: CreateOptions<S, L1, L2, L3, L4, L5>
      ) => {
        const retItem = clearAggs(item);
        return retItem as Partial<Item<S, L1, L2, L3, L4, L5>>;
      },
      // TODO: "We need to figure out how to make this an array of hooks..."
      preUpdate: async (
        key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
        item: Partial<Item<S, L1, L2, L3, L4, L5>>,
      ) => {
        const retItem = clearAggs(item);
        return retItem as Partial<Item<S, L1, L2, L3, L4, L5>>;
      },
    }
  } as Options<V, S, L1, L2, L3, L4, L5>;
}

export const createOptions = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(options?: Options<V, S, L1, L2, L3, L4, L5>): Options<V, S, L1, L2, L3, L4, L5> => {
  const defaultOptions = createDefaultOptions<V, S, L1, L2, L3, L4, L5>();
  return deepmerge(defaultOptions, options ?? {});
}
