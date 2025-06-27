import { ComKey, Item, PriKey } from "@fjell/core";

import { LocKeyArray } from "@fjell/core";

import { ItemQuery } from "@fjell/core";

import { Definition } from "./Definition";
import { wrapAllOperation } from "./ops/all";
import { wrapCreateOperation } from "./ops/create";
import { wrapFindOperation } from "./ops/find";
import { wrapFindOneOperation } from "./ops/findOne";
import { wrapGetOperation } from "./ops/get";
import { wrapOneOperation } from "./ops/one";
import { wrapRemoveOperation } from "./ops/remove";
import { wrapUpdateOperation } from "./ops/update";
import { wrapUpsertOperation } from "./ops/upsert";

import LibLogger from '@/logger';
import { Registry } from "./Registry";
import { wrapActionOperation } from "./ops/action";
import { ActionMethod, AllActionMethod, AllFacetMethod, FacetMethod, FinderMethod } from "./Options";
import { wrapFacetOperation } from "./ops/facet";
import { wrapAllActionOperation } from "./ops/allAction";

const logger = LibLogger.get('Operations');

export interface Operations<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> {

  /**
   * Retrieves all the items that match the query.  If locations are provided, the items will be retrieved from
   * the specified locations.  If no locations are provided, the items will be retrieved from all locations if the
   * item is present in multiple locations.
   * @param itemQuery - The query to use to retrieve the items.
   * @param locations - The locations to retrieve the items from.   If locations is [], this translates to a global
   * query.
   */
  all(
    itemQuery: ItemQuery,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | [],
  ): Promise<V[]>;

  /**
   * Retrieves the item that matches the query.  If locations are provided, the item will be retrieved from
   * the specified locations.  If no locations are provided, the item will be retrieved from all locations if the
   * item is present in multiple locations.
   * @param itemQuery - The query to use to retrieve the item.
   * @param locations - The locations to retrieve the item from.
   */
  one(
    itemQuery: ItemQuery,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | [],
  ): Promise<V | null>;

  /**
   * Creates a new item in the library.  The key supplied to the item will be used to retrieve the item, or to
   * create a new item.  If the key is not supplied, the library will generate a new key for the item using a
   * default strategy (that likely will involve UUIDs).
   * @param item - The properties to use to create a new item.
   * @param options - This contains an explicit value for the key to use for the new item.  If not supplied,
   * the library will generate a new key for the item using a default strategy (that likely will involve UUIDs).
   * This also contains a locations option, which is used to specify the locations to create the item in.  Note that
   * you can either provide an optional key or an optional locations option.  The idea here is that if you are going
   * to specify the primary key in key for a ComKey, you would just pass in the locations through the key.
   */
  create(
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    options?: {
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
      locations?: never;
    } | {
      key?: never;
      locations: LocKeyArray<L1, L2, L3, L4, L5>,
    }
  ): Promise<V>;

  update(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
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
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    itemProperties: Partial<Item<S, L1, L2, L3, L4, L5>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5>,
  ): Promise<V>;

  get(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
  ): Promise<V>;

  remove(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
  ): Promise<V>;

  find(
    finder: string,
    finderParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | [],
  ): Promise<V[]>;

  findOne(
    finder: string,
    finderParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | [],
  ): Promise<V>;

  finders: Record<string, FinderMethod<V, S, L1, L2, L3, L4, L5>>;

  action(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    actionKey: string,
    actionParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
  ): Promise<V>;

  actions: Record<string, ActionMethod<V, S, L1, L2, L3, L4, L5>>;

  facet(
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    facetKey: string,
    facetParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
  ): Promise<any>;

  facets: Record<string, FacetMethod<V, S, L1, L2, L3, L4, L5>>;

  allAction(
    allActionKey: string,
    allActionParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | [],
  ): Promise<V[]>;

  allActions: Record<string, AllActionMethod<V, S, L1, L2, L3, L4, L5>>;

  allFacet(
    allFacetKey: string,
    allFacetParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
    locations?: LocKeyArray<L1, L2, L3, L4, L5> | [],
  ): Promise<any>;

  allFacets: Record<string, AllFacetMethod<L1, L2, L3, L4, L5>>;
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
  const operations = {} as Operations<V, S, L1, L2, L3, L4, L5>;

  operations.all = wrapAllOperation(toWrap, definition, registry);
  operations.one = wrapOneOperation(toWrap, definition, registry);
  operations.create = wrapCreateOperation(toWrap, definition, registry);
  operations.update = wrapUpdateOperation(toWrap, definition, registry);
  operations.get = wrapGetOperation(toWrap, definition, registry);
  operations.remove = wrapRemoveOperation(toWrap, definition, registry);
  operations.find = wrapFindOperation(toWrap, definition, registry);
  operations.findOne = wrapFindOneOperation(toWrap, definition, registry);
  operations.upsert = wrapUpsertOperation(operations, registry);
  operations.action = wrapActionOperation(toWrap, definition, registry);
  operations.facet = wrapFacetOperation(toWrap, definition, registry);
  operations.allAction = wrapAllActionOperation(toWrap, definition, registry);

  return operations;
};

export const createReadOnlyOperations = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(
    toWrap: Operations<V, S, L1, L2, L3, L4, L5>,
  ): Operations<V, S, L1, L2, L3, L4, L5> => {

  logger.debug("createReadOnlyOperations", { toWrap });
  const create = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: {
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
      locations?: never;
    } | {
      key?: never;
      locations: LocKeyArray<L1, L2, L3, L4, L5>,
    }
  ): Promise<V> => {
    logger.warning('create', 'Cannot Create in a ReadOnly Library, Returning Empty Item');
    return {} as V;
  };

  const update = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    item: Partial<Item<S, L1, L2, L3, L4, L5>>
  ): Promise<V> => {
    logger.warning('update', 'Cannot Update in a ReadOnly Library, Returning Empty Item');
    return {} as V;
  };

  const upsert = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    itemProperties: Partial<Item<S, L1, L2, L3, L4, L5>>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    locations?: LocKeyArray<L1, L2, L3, L4, L5>,
  ): Promise<V> => {
    logger.warning('upsert', 'Cannot Upsert in a ReadOnly Library, Returning Empty Item');
    return {} as V;
  };

  const remove = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>
  ): Promise<V> => {
    logger.warning('remove', 'Cannot Remove in a ReadOnly Library, Returning Empty Item');
    return {} as V;
  };

  return {
    ...toWrap,
    create,
    update,
    upsert,
    remove,
  };

};

