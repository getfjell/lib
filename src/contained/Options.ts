import {
  Options as AbstractOptions,
  ActionMethod,
  createOptions as createAbstractOptions,
  FinderParams,
} from "@/Options";
import { ComKey, Item, LocKeyArray, PriKey } from "@fjell/core";

// TODO: The codesmell here is that we're passing lib to all the hooks.  This might be better with a create pattern.
export interface Options<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> extends AbstractOptions<V, S, L1, L2, L3, L4, L5> {
  hooks?: {
    preCreate?: (
      item: Partial<Item<S, L1, L2, L3, L4, L5>>,
      options?:
      {
        locations?: LocKeyArray<L1, L2, L3, L4, L5>,
      }
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
      options?:
      {
        locations?: LocKeyArray<L1, L2, L3, L4, L5>,
      }
    ) => Promise<boolean>;
    onUpdate?: (
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
      item: Partial<Item<S, L1, L2, L3, L4, L5>>,
    ) => Promise<boolean>;
    onRemove?: (
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    ) => Promise<boolean>;
  },
  finders?:
    Record<
      string,
      (
        params: FinderParams,
      ) =>
        Promise<V[]>
    >,
  actions?: Record<string, ActionMethod<V, S, L1, L2, L3, L4, L5>>,
}

export const createOptions = <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(libOptions?: Options<V, S, L1, L2, L3, L4, L5>): Options<V, S, L1, L2, L3, L4, L5> => {
  const options =
    createAbstractOptions<V, S, L1, L2, L3, L4, L5>(libOptions as AbstractOptions<V, S, L1, L2, L3, L4, L5>);
  return {
    ...options
  } as Options<V, S, L1, L2, L3, L4, L5>;
}
