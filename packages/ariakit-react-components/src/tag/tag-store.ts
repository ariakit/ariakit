import * as Core from "@ariakit/components/tag/tag-store";
import { useStore, useStoreProps } from "@ariakit/react-store";
import type { Store } from "@ariakit/react-store";
import { useSafeLayoutEffect } from "@ariakit/react-utils";
import {
  markComboboxValueControlled,
  markComboboxValueSource,
} from "../combobox/__combobox-controlled.ts";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.ts";
import { useCompositeStoreProps } from "../composite/composite-store.ts";

export function useTagStoreProps<T extends Core.TagStore>(
  store: T,
  update: () => void,
  props: TagStoreProps,
) {
  const valueControlled = props.value !== undefined;
  useSafeLayoutEffect(() => {
    if (!valueControlled) return;
    return markComboboxValueControlled(store);
  }, [store, valueControlled]);
  // Source changes recreate the store in a passive effect. Keep the source
  // connected to the store instance it was created with until then.
  useSafeLayoutEffect(
    () => markComboboxValueSource(store, props.store),
    [store],
  );

  useStoreProps(store, props, "value", "setValue");
  useStoreProps(store, props, "values", "setValues");
  return useCompositeStoreProps(store, update, props);
}

/**
 * Creates a tag store to control the state of
 * [Tag](https://ariakit.com/components/tag) components.
 * @see https://ariakit.com/components/tag
 * @example
 * ```jsx
 * const tag = useTagStore({ defaultValues: ["Apple", "Banana"]});
 * const values = useStoreState(tag, "values");
 *
 * <TagList store={tag}>
 *   {values.map((value) => (
 *     <Tag key={value} value={value}>
 *       {value}
 *       <TagRemove />
 *     </Tag>
 *   ))}
 *   <TagInput />
 * </TagList>
 * ```
 */
export function useTagStore(props: TagStoreProps = {}): TagStore {
  const [store, update] = useStore(Core.createTagStore, props);
  return useTagStoreProps(store, update, props);
}

export interface TagStoreItem extends Core.TagStoreItem {}

export interface TagStoreState
  extends Core.TagStoreState, CompositeStoreState<TagStoreItem> {}

export interface TagStoreFunctions
  extends Core.TagStoreFunctions, CompositeStoreFunctions<TagStoreItem> {}

export interface TagStoreOptions
  extends Core.TagStoreOptions, CompositeStoreOptions<TagStoreItem> {
  /**
   * A callback that gets called when the
   * [`value`](https://ariakit.com/reference/tag-provider#value) state
   * changes.
   */
  setValue?: (value: TagStoreState["value"]) => void;
  /**
   * A callback that gets called when the
   * [`values`](https://ariakit.com/reference/tag-provider#values) state
   * changes.
   */
  setValues?: (values: TagStoreState["values"]) => void;
}

export interface TagStoreProps extends TagStoreOptions, Core.TagStoreProps {}

export interface TagStore extends TagStoreFunctions, Store<Core.TagStore> {}
