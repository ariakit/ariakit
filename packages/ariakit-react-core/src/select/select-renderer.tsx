import type { CSSProperties, ComponentPropsWithRef, ForwardedRef } from "react";
import { forwardRef, useContext, useMemo } from "react";
import { toArray } from "@ariakit/core/utils/array";
import { invariant } from "@ariakit/core/utils/misc";
import type { AnyObject } from "@ariakit/core/utils/types";
import { getCollectionItemObject } from "../collection/collection-renderer.js";
import { CompositeRenderer } from "../composite/composite-renderer.js";
import type { CompositeRendererOptions } from "../composite/composite-renderer.js";
import { useStoreState } from "../utils/store.js";
import { SelectContext } from "./select-context.js";
import type { SelectStore, SelectStoreValue } from "./select-store.js";

interface ItemObject
  extends AnyObject,
    Pick<SelectRendererOptions, "gap" | "orientation"> {
  id?: string;
  element?: HTMLElement | null;
  style?: CSSProperties;
  items?: Item[];
  disabled?: boolean;
  value?: string;
}

type Item =
  | ItemObject
  | Omit<string, string>
  | Omit<number, string>
  | Omit<boolean, string>
  | null
  | undefined;

function findIndicesByValue<V extends SelectStoreValue>(
  items: readonly Item[],
  value: V
): number[] {
  const values = toArray(value);
  const indices: number[] = [];

  for (const [index, item] of items.entries()) {
    if (indices.length === values.length) break;

    const object = getCollectionItemObject(item);

    if (object.value != null && values.includes(object.value)) {
      indices.push(index);
    } else if (object.items?.length) {
      const childIndices = findIndicesByValue(object.items, value);
      if (childIndices.length) {
        indices.push(index);
      }
    }
  }

  return indices;
}

function SelectRendererImpl<T extends Item = any>(
  {
    store,
    orientation: orientationProp,
    persistentIndices: persistentIndicesProp,
    ...props
  }: SelectRendererProps<T>,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  const context = useContext(SelectContext);
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "SelectRenderer must be wrapped in a SelectPopover or SelectList component"
  );

  const items = store.useState((state) =>
    state.open ? props.items ?? (state.items as T[]) : 0
  );

  const value = useStoreState(store, "value");

  const valueIndices = useMemo(() => {
    if (!items) return [];
    if (value == null) return [];
    if (typeof items === "number") return [];
    if (!items.length) return [];
    return findIndicesByValue(items, value);
  }, [items, value]);

  const persistentIndices = useMemo(() => {
    if (persistentIndicesProp) {
      return [...persistentIndicesProp, ...valueIndices];
    }
    return valueIndices;
  }, [valueIndices, persistentIndicesProp]);

  return (
    <CompositeRenderer
      ref={forwardedRef}
      store={store as any}
      persistentIndices={persistentIndices}
      {...props}
      items={items}
    />
  );
}

export const SelectRenderer = forwardRef(
  SelectRendererImpl
) as typeof SelectRendererImpl;

export interface SelectRendererOptions<T extends Item = any>
  extends Omit<CompositeRendererOptions<T>, "store"> {
  store?: SelectStore;
}

export interface SelectRendererProps<T extends Item = any>
  extends Omit<ComponentPropsWithRef<"div">, "children">,
    SelectRendererOptions<T> {}
