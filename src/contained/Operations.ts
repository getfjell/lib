import { ComKey, Item, PriKey, TypesProperties } from "@fjell/core";

import { LocKeyArray } from "@fjell/core";

import { Operations as AbstractOperations, wrapOperations as wrapAbstractOperations } from "@/Operations";
import { ItemQuery } from "@fjell/core";

import { Definition } from "@/Definition";
import { Registry } from "@/Registry";

export interface Operations<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> extends AbstractOperations<V, S, L1, L2, L3, L4, L5> {

  all(
    itemQuery: ItemQuery,
    locations: LocKeyArray<L1, L2, L3, L4, L5> | [],
  ): Promise<V[]>;

  one(
    itemQuery: ItemQuery,
    locations: LocKeyArray<L1, L2, L3, L4, L5> | [],
  ): Promise<V | null>;

  create(
    item: TypesProperties<V, S, L1, L2, L3, L4, L5>,
    options?: {
      locations?: LocKeyArray<L1, L2, L3, L4, L5>,
    }
  ): Promise<V>;

  update(
    key: ComKey<S, L1, L2, L3, L4, L5>,
    item: TypesProperties<V, S, L1, L2, L3, L4, L5>
  ): Promise<V>;

  /**
   * The key supplied to upsert will be used to retrieve the item, or to create a new item.  This method will
   * attempt to retrieve the item by the supplied key, and if the item is not found it will create a new item
   * using the properties supplied in the item parameter.
   * @param key - The key to use to retrieve the item, or to create a new item.
   * @param item - The properties to use to create a new item.
   * @param options - The options to use to create a new item.
   */
  upsert(
    key: ComKey<S, L1, L2, L3, L4, L5>,
    itemProperties: TypesProperties<V, S, L1, L2, L3, L4, L5>,
  ): Promise<V>;

  get(
    key: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>,
  ): Promise<V>;

  remove(
    key: ComKey<S, L1, L2, L3, L4, L5>,
  ): Promise<V>;

  find(
    finder: string,
    finderParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    locations: LocKeyArray<L1, L2, L3, L4, L5> | [],
  ): Promise<V[]>;
}

export const wrapOperations = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(
    toWrap: Operations<V, S, L1, L2, L3, L4, L5>,
    definition: Definition<V, S, L1, L2, L3, L4, L5>,
    registry: Registry,
  ): Operations<V, S, L1, L2, L3, L4, L5> => {

  const operations = wrapAbstractOperations(toWrap, definition, registry);
  return {
    ...operations
  };
};

