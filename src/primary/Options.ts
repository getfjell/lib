import { Options as AbstractOptions, ActionMethod, FinderParams } from "@/Options";
import { Item, PriKey, TypesProperties } from "@fjell/core";

export interface Options<
  V extends Item<S>,
  S extends string
> extends AbstractOptions<V, S> {
    hooks?: {
        preCreate?: (
          item: TypesProperties<V, S>,
          options?:
          {
            key?: PriKey<S>,
          }
        ) => Promise<TypesProperties<V, S>>;
        postCreate?: (
          item: V,
        ) => Promise<V>;
        preUpdate?: (
          key: PriKey<S>,
          item: TypesProperties<V, S>,
        ) => Promise<TypesProperties<V, S>>;
        postUpdate?: (
          item: V,
        ) => Promise<V>;
        preRemove?: (
          key: PriKey<S>,
        ) => Promise<TypesProperties<V, S>>;
        postRemove?: (
          item: V,
        ) => Promise<V>;
      },
      validators?: {
        onCreate?: (
          item: TypesProperties<V, S>,
          options?:
          {
            key?: PriKey<S>,
          }
        ) => Promise<boolean>;
        onUpdate?: (
          key: PriKey<S>,
          item: TypesProperties<V, S>,
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
