import { Options as AbstractOptions, ActionMethod, FinderParams } from "@/Options";
import { Item, PriKey } from "@fjell/core";

export interface Options<
  V extends Item<S>,
  S extends string
> extends AbstractOptions<V, S> {
    hooks?: {
        preCreate?: (
          item: Partial<Item<S>>,
          options?:
          {
            key?: PriKey<S>,
          }
        ) => Promise<Partial<Item<S>>>;
        postCreate?: (
          item: V,
        ) => Promise<V>;
        preUpdate?: (
          key: PriKey<S>,
          item: Partial<Item<S>>,
        ) => Promise<Partial<Item<S>>>;
        postUpdate?: (
          item: V,
        ) => Promise<V>;
        preRemove?: (
          key: PriKey<S>,
        ) => Promise<Partial<Item<S>>>;
        postRemove?: (
          item: V,
        ) => Promise<V>;
      },
      validators?: {
        onCreate?: (
          item: Partial<Item<S>>,
          options?:
          {
            key?: PriKey<S>,
          }
        ) => Promise<boolean>;
        onUpdate?: (
          key: PriKey<S>,
          item: Partial<Item<S>>,
        ) => Promise<boolean>;
        onRemove?: (
          key: PriKey<S>,
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
      actions?: Record<string, ActionMethod<V, S>>,
    }
