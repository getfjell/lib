import { ComKey, Item, ItemProperties, LocKeyArray, PriKey, TypesProperties } from "@fjell/core";
import deepmerge from "deepmerge";
import LibLogger from "@/logger";

const logger = LibLogger.get("Options");

export interface ActionMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> {
  (
    item: V,
    actionParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
  ): Promise<V>;
}

export interface AllActionMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> {
  (
    allActionParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<V[]>;
}

export interface FacetMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> {
  (
    item: V,
    facetParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
  ): Promise<any>;
}

export interface AllFacetMethod<
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> {
  (
    allFacetParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
  ): Promise<any>;
}

export type FinderParams = Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>

export type FinderMethod<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> = (
  params: FinderParams,
  locations?: LocKeyArray<L1, L2, L3, L4, L5> | []
) => Promise<V[]>

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
      item: TypesProperties<V, S, L1, L2, L3, L4, L5>,
      options?:
      {
        key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
        locations?: never;
      } | {
        key?: never;
        locations: LocKeyArray<L1, L2, L3, L4, L5>,
      }
    ) => Promise<TypesProperties<V, S, L1, L2, L3, L4, L5>>;
    postCreate?: (
      item: V,
    ) => Promise<V>;
    preUpdate?: (
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
      item: TypesProperties<V, S, L1, L2, L3, L4, L5>,
    ) => Promise<TypesProperties<V, S, L1, L2, L3, L4, L5>>;
    postUpdate?: (
      item: V,
    ) => Promise<V>;
    preRemove?: (
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    ) => Promise<TypesProperties<V, S, L1, L2, L3, L4, L5>>;
    postRemove?: (
      item: V,
    ) => Promise<V>;
  },
  validators?: {
    onCreate?: (
      item: TypesProperties<V, S, L1, L2, L3, L4, L5>,
      options?:
      {
        key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
        locations?: never;
      } | {
        key?: never;
        locations: LocKeyArray<L1, L2, L3, L4, L5>,
      }
    ) => Promise<boolean>;
    onUpdate?: (
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
      item: TypesProperties<V, S, L1, L2, L3, L4, L5>,
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
    item: ItemProperties<S, L1, L2, L3, L4, L5>
  ): ItemProperties<S, L1, L2, L3, L4, L5> {
    delete item.aggs;
    return item;
  }

  return {
    hooks: {
      // TODO: "We need to figure out how to make this an array of hooks..."
      preCreate: async (
        item: TypesProperties<V, S, L1, L2, L3, L4, L5>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        options?:
        {
          key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
          locations?: never;
        } | {
          key?: never;
          locations: LocKeyArray<L1, L2, L3, L4, L5>,
        }
      ) => {
        const retItem = clearAggs(item);
        return retItem as TypesProperties<V, S, L1, L2, L3, L4, L5>;
      },
      // TODO: "We need to figure out how to make this an array of hooks..."
      preUpdate: async (
        key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
        item: TypesProperties<V, S, L1, L2, L3, L4, L5>,
      ) => {
        const retItem = clearAggs(item);
        return retItem as TypesProperties<V, S, L1, L2, L3, L4, L5>;
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
