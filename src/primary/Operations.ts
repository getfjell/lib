import { Definition } from "@/Definition";
import { Operations as AbstractOperations, wrapOperations as createAbstractOperations } from "@/Operations";
import { Item, ItemQuery, PriKey, TypesProperties } from "@fjell/core";

import LibLogger from "@/logger";

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
    item: TypesProperties<V, S>,
    options?: {
      key: PriKey<S>,
    }
  ): Promise<V>;

  update(
    key: PriKey<S>,
    item: TypesProperties<V, S>
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
    itemProperties: TypesProperties<V, S>,
  ): Promise<V>;

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

}

export const wrapOperations = <
  V extends Item<S>,
  S extends string
>(
    toWrap: Operations<V, S>,
    definition: Definition<V, S>,
  ): Operations<V, S> => {
  logger.debug("wrapOperations", { toWrap, definition });
  return {
    ...createAbstractOperations(toWrap, definition),
  };
}