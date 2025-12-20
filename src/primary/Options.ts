import { ActionMethod, ComKey, CreateOptions, Item, PriKey } from "@fjell/types";
import { Options as AbstractOptions, FinderParams } from "../Options";

export interface Options<
  V extends Item<S>,
  S extends string
> extends AbstractOptions<V, S> {
    hooks?: {
        preCreate?: (
          item: Partial<Item<S>>,
          options?: CreateOptions<S>
        ) => Promise<Partial<Item<S>>>;
        postCreate?: (
          item: V,
        ) => Promise<V>;
        preUpdate?: (
          key: PriKey<S> | ComKey<S>,
          item: Partial<Item<S>>,
        ) => Promise<Partial<Item<S>>>;
        postUpdate?: (
          item: V,
        ) => Promise<V>;
        preRemove?: (
          key: PriKey<S> | ComKey<S>,
        ) => Promise<Partial<Item<S>>>;
        postRemove?: (
          item: V,
        ) => Promise<V>;
      },
      validators?: {
        onCreate?: (
          item: Partial<Item<S>>,
          options?: CreateOptions<S>
        ) => Promise<boolean>;
        onUpdate?: (
          key: PriKey<S> | ComKey<S>,
          item: Partial<Item<S>>,
        ) => Promise<boolean>;
        onRemove?: (
          key: PriKey<S> | ComKey<S>,
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
