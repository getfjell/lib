/* eslint-disable indent */
import { ComKey, Item, LocKeyArray, PriKey } from "@fjell/core";
import { Coordinate } from "@fjell/registry";
import { ActionMethod, AllActionMethod, AllFacetMethod, FacetMethod, Options } from "../Options";
import { Operations as AbstractOperations, wrapOperations as wrapAbstractOperations } from "../Operations";

import LibLogger from "../logger";
import { ItemQuery } from "@fjell/core";
import { Registry } from "../Registry";

const logger = LibLogger.get("primary", "Operations");

export interface Operations<
  V extends Item<S>,
  S extends string
> extends AbstractOperations<V, S> {

  all(
    itemQuery: ItemQuery,
  ): Promise<V[]>;

  one(
    itemQuery: ItemQuery,
  ): Promise<V | null>;

  create(
    item: Partial<Item<S>>,
    options?: {
      key: PriKey<S>,
    }
  ): Promise<V>;

  update(
    key: PriKey<S>,
    item: Partial<Item<S>>
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
    key: PriKey<S>,
    item: Partial<Item<S>>,
  ): Promise<V>;

  /**
   * Retrieves a single item by its primary key.
   *
   * This is a primary item library, so the key should only contain:
   * - The primary key type (kt)
   * - The primary key value (pk)
   *
   * @param key - A PriKey identifying the item
   * @returns Promise resolving to the item
   * @throws InvalidKeyTypeError if a ComKey is provided instead of PriKey
   * @throws NotFoundError if the item doesn't exist
   *
   * @example
   * ```typescript
   * const document = await library.operations.get({
   *   kt: 'documents',
   *   pk: 'doc-id'
   * });
   * ```
   */
  get(
    key: PriKey<S>,
  ): Promise<V>;

  remove(
    key: PriKey<S>,
  ): Promise<V>;

  find(
    finder: string,
    finderParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
  ): Promise<V[]>;

  findOne(
    finder: string,
    finderParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
  ): Promise<V>;

  action(
    key: PriKey<S>,
    actionKey: string,
    actionParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
  ): Promise<[V, Array<PriKey<any> | ComKey<any, any, any, any, any, any> | LocKeyArray<any, any, any, any, any>>]>;

  actions: Record<string, ActionMethod<V, S, never, never, never, never, never>>;

  facet(
    key: PriKey<S>,
    facetKey: string,
    facetParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
  ): Promise<any>;

  facets: Record<string, FacetMethod<V, S, never, never, never, never, never>>;

  allAction(
    allActionKey: string,
    allActionParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
  ): Promise<[V[], Array<PriKey<any> | ComKey<any, any, any, any, any, any> | LocKeyArray<any, any, any, any, any>>]>;

  allActions: Record<string, AllActionMethod<V, S, never, never, never, never, never>>;

  allFacet(
    allFacetKey: string,
    allFacetParams: Record<string, string | number | boolean | Date | Array<string | number | boolean | Date>>,
  ): Promise<any>;

  allFacets: Record<string, AllFacetMethod<never, never, never, never, never>>;
}

export const wrapOperations = <
  V extends Item<S>,
  S extends string
>(
  toWrap: Operations<V, S>,
  options: Options<V, S>,
  coordinate: Coordinate<S>,
  registry: Registry,

): Operations<V, S> => {
  logger.debug("wrapOperations", { toWrap, options, coordinate, registry });
  const operations = wrapAbstractOperations(toWrap, options, coordinate, registry);
  return operations;
};
