import { useStoreState } from "@ariakit/react-store";
import { createElement, forwardRef } from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { toArray } from "@ariakit/utils";
import type { ElementType } from "react";
import { useMemo } from "react";
import type {
  CompositeRendererBaseItemProps,
  CompositeRendererItem,
  CompositeRendererItemObject,
  CompositeRendererItemProps,
  CompositeRendererOptions,
} from "../composite/composite-renderer.tsx";
import {
  getCompositeRendererItem,
  getCompositeRendererItemId,
  useCompositeRenderer,
} from "../composite/composite-renderer.tsx";
import { useComboboxContext } from "./combobox-context.tsx";
import type {
  ComboboxStore,
  ComboboxStoreSelectedValue,
} from "./combobox-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

interface ItemObject extends CompositeRendererItemObject {
  value?: string;
}

type Item = ItemObject | CompositeRendererItem;

type BaseItemProps = CompositeRendererBaseItemProps;

type ItemProps<
  T extends Item,
  P extends BaseItemProps = BaseItemProps,
> = CompositeRendererItemProps<T, P>;

function getItemObject(item: Item): ItemObject {
  if (!item || typeof item !== "object") {
    return { value: `${item}` };
  }
  return item;
}

function findIndicesByValue(
  items: readonly Item[],
  selectedValue: ComboboxStoreSelectedValue,
): number[] {
  const values = toArray(selectedValue);
  const indices: number[] = [];

  for (const [index, item] of items.entries()) {
    if (indices.length === values.length) break;

    const object = getItemObject(item);

    if (object.value != null && values.includes(object.value)) {
      indices.push(index);
    } else if (object.items?.length) {
      const childIndices = findIndicesByValue(object.items, selectedValue);
      if (childIndices.length) {
        indices.push(index);
      }
    }
  }

  return indices;
}

function useComboboxRenderer<T extends Item = any>({
  store,
  persistentIndices: persistentIndicesProp,
  items: itemsProp,
  selectedValue: selectedValueProp,
  ...props
}: ComboboxRendererProps<T>) {
  const context = useComboboxContext();
  store = store || context;

  const items = useStoreState(store, ["mounted", "items"], (state) => {
    if (!state) return itemsProp;
    if (!state.mounted) return 0;
    return itemsProp ?? (state.items as T[]);
  });

  const selectedValue = useStoreState(
    store,
    ["selectedValue"],
    (state) => selectedValueProp ?? state?.selectedValue,
  );

  const selectedValueIndices = useMemo(() => {
    if (!items) return [];
    if (selectedValue == null) return [];
    if (typeof items === "number") return [];
    if (!items.length) return [];
    return findIndicesByValue(items, selectedValue);
  }, [items, selectedValue]);

  const persistentIndices = useMemo(() => {
    if (persistentIndicesProp) {
      return [...persistentIndicesProp, ...selectedValueIndices];
    }
    return selectedValueIndices;
  }, [selectedValueIndices, persistentIndicesProp]);

  return useCompositeRenderer({
    store: store as CompositeRendererOptions["store"],
    items,
    persistentIndices,
    ...props,
  });
}

export const ComboboxRenderer = forwardRef(function ComboboxRenderer<
  T extends Item = any,
>(props: ComboboxRendererProps<T>) {
  const htmlProps = useComboboxRenderer(props);
  return createElement(TagName, htmlProps);
});

export {
  getCompositeRendererItem as getComboboxRendererItem,
  getCompositeRendererItemId as getComboboxRendererItemId,
};

export type ComboboxRendererItemObject = ItemObject;
export type ComboboxRendererItem = Item;
export type ComboboxRendererBaseItemProps = BaseItemProps;
export type ComboboxRendererItemProps<
  T extends Item,
  P extends BaseItemProps = BaseItemProps,
> = ItemProps<T, P>;

export interface ComboboxRendererOptions<T extends Item = any> extends Omit<
  CompositeRendererOptions<T>,
  "store"
> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook.
   */
  store?: ComboboxStore;
  /**
   * The current selected value of the combobox. This will ensure the item with
   * the given value is rendered even if it's not in the viewport, so it can be
   * automatically focused when the combobox popover is opened. If not
   * provided, the selected value will be read from the store.
   */
  selectedValue?: ComboboxStoreSelectedValue;
}

export interface ComboboxRendererProps<T extends Item = any> extends Props<
  TagName,
  ComboboxRendererOptions<T>
> {}
