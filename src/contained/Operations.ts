import { ComKey, Item, PriKey } from "@fjell/core";

import { LocKeyArray } from "@fjell/core";

import { Operations as AbstractOperations, wrapOperations as wrapAbstractOperations } from "../Operations";
import { ItemQuery } from "@fjell/core";

import { Registry } from "../Registry";
import { Options } from "./Options";
import { Coordinate } from "@fjell/registry";
import { ActionMethod } from "../Options";

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
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    options?: {
      locations?: LocKeyArray<L1, L2, L3, L4, L5>,
    }
  ): Promise<V>;

  update(
    key: ComKey<S, L1, L2, L3, L4, L5>,
    item: Partial<Item<S, L1, L2, L3, L4, L5>>
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
    itemProperties: Partial<Item<S, L1, L2, L3, L4, L5>>,
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

  findOne(
    finder: string,
    finderParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    locations: LocKeyArray<L1, L2, L3, L4, L5> | [],
  ): Promise<V>;

  action(
    key: ComKey<S, L1, L2, L3, L4, L5>,
    actionKey: string,
    actionParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
  ): Promise<V>;

  actions: Record<string, ActionMethod<V, S, L1, L2, L3, L4, L5>>;

  facet(
    key: ComKey<S, L1, L2, L3, L4, L5>,
    facetKey: string,
    facetParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
  ): Promise<any>;

  allAction(
    allActionKey: string,
    allActionParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    locations: LocKeyArray<L1, L2, L3, L4, L5> | [],
  ): Promise<V[]>;

  allFacet(
    allFacetKey: string,
    allFacetParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    locations: LocKeyArray<L1, L2, L3, L4, L5> | [],
  ): Promise<any>;

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
    options: Options<V, S, L1, L2, L3, L4, L5>,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    registry: Registry,

  ): Operations<V, S, L1, L2, L3, L4, L5> => {

  const operations = wrapAbstractOperations(toWrap, options, coordinate, registry);
  return {
    ...operations
  };
};
