import type { ComponentPropsWithRef, ReactNode } from "react";
import { useMemo } from "react";
import {
  getCollectionRendererItem,
  getCollectionRendererItemId,
  useCollectionRenderer,
} from "../collection/collection-renderer.js";
import type {
  CollectionRendererBaseItemProps,
  CollectionRendererItem,
  CollectionRendererItemObject,
  CollectionRendererItemProps,
  CollectionRendererOptions,
} from "../collection/collection-renderer.js";
import type { CollectionStoreItem } from "../collection/collection-store.js";
import { useId } from "../utils/hooks.js";
import { useStoreState } from "../utils/store.jsx";
import { createElement, forwardRef } from "../utils/system.js";
import { useCompositeContext } from "./composite-context.js";
import type { CompositeStore, CompositeStoreItem } from "./composite-store.js";

interface ItemObject extends CollectionRendererItemObject {
  disabled?: boolean;
}

type Item = ItemObject | CollectionRendererItem;

interface BaseItemProps extends CollectionRendererBaseItemProps {
  "aria-setsize": number;
  "aria-posinset": number;
}

type ItemProps<
  T extends Item,
  P extends BaseItemProps = BaseItemProps,
> = CollectionRendererItemProps<T, P>;

function getItemObject(item: Item): ItemObject {
  if (!item || typeof item !== "object") {
    return { value: item };
  }
  return item;
}

function countItems<T extends Item>(items?: number | readonly T[]): number[] {
  if (!items) return [0];
  if (typeof items === "number") {
    return Array.from({ length: items }, (_, index) => index + 1);
  }
  return items.reduce<number[]>((count, item, index) => {
    const object = getItemObject(item);
    if (!object.items) {
    }
    if (!object.items) {
      count[index] = index + 1;
      return count;
    }
    const prevCount = count[index - 1] ?? 0;
    const itemsCount = countItems(object.items)[object.items.length - 1] ?? 0;
    count[index] = prevCount + itemsCount;
    return count;
  }, []);
}

function findFirst<T extends Item>(items: readonly T[], offset = 1): number {
  for (
    let index = offset > 0 ? 0 : items.length - 1;
    index >= 0 && index < items.length;
    index += offset
  ) {
    const item = items[index];
    const object = getItemObject(item);
    if (object.items && findFirst(object.items, offset) !== -1) return index;
    if (!object.disabled) return index;
  }
  return -1;
}

function findLast<T extends Item>(items: readonly T[]) {
  return findFirst(items, -1);
}

function findById<T extends Item>(
  items: readonly T[],
  id: string,
  baseId: string,
): number {
  return items.findIndex((item, index) => {
    const itemId = getCollectionRendererItemId(item, index, baseId);
    if (itemId === id) return true;
    const object = getItemObject(item);
    if (object.items?.length) return findById(object.items, id, itemId) !== -1;
    const ids = id.split("/");
    if (ids.length === 1) return false;
    return ids.some((id) => itemId === id);
  });
}

export function useCompositeRenderer<T extends Item = any>({
  store,
  orientation: orientationProp,
  persistentIndices: persistentIndicesProp,
  children: renderItem,
  "aria-setsize": ariaSetSize,
  "aria-posinset": ariaPosInSet = 1,
  ...props
}: CompositeRendererProps<T>) {
  const context = useCompositeContext();
  store = store || (context as typeof store);

  const orientation = useStoreState(store, (state) =>
    orientationProp ?? state?.orientation === "both"
      ? "vertical"
      : state?.orientation,
  );

  const items = useStoreState(store, (state) => {
    if (!state) return props.items;
    if ("mounted" in state && !state.mounted) return 0;
    return props.items ?? (state.items as T[]);
  });

  const id = useId(props.id);

  const itemsCount = useMemo(() => countItems(items), [items]);

  const setSize = useMemo(
    () => ariaSetSize ?? itemsCount[itemsCount.length - 1] ?? 0,
    [ariaSetSize, itemsCount],
  );

  const firstIndex = useMemo(() => {
    if (!items) return -1;
    if (typeof items === "number") return 0;
    if (!items.length) return -1;
    return findFirst(items);
  }, [items]);

  const lastIndex = useMemo(() => {
    if (!items) return -1;
    if (typeof items === "number") return items - 1;
    if (!items.length) return -1;
    return findLast(items);
  }, [items]);

  const activeId = useStoreState(store, "activeId");

  const activeIndex = useMemo(() => {
    if (!id) return -1;
    if (!items) return -1;
    if (activeId == null) return -1;
    if (typeof items === "number") return -1;
    if (!items.length) return -1;
    return findById(items, activeId, id);
  }, [id, items, activeId]);

  const persistentIndices = useMemo(() => {
    const indices = [firstIndex, activeIndex, lastIndex].filter(
      (index) => index >= 0,
    );
    if (persistentIndicesProp) {
      return [...persistentIndicesProp, ...indices];
    }
    return indices;
  }, [firstIndex, activeIndex, lastIndex, persistentIndicesProp]);

  return useCollectionRenderer({
    id,
    store,
    orientation,
    persistentIndices,
    ...props,
    children: (item) => {
      const nextItem = {
        ...item,
        "aria-setsize": setSize,
        "aria-posinset": ariaPosInSet + (itemsCount[item.index - 1] ?? 0),
      };
      return renderItem?.(nextItem as ItemProps<T>);
    },
  });
}

export {
  getCollectionRendererItem as getCompositeRendererItem,
  getCollectionRendererItemId as getCompositeRendererItemId,
};

export type CompositeRendererItemObject = ItemObject;
export type CompositeRendererItem = Item;
export type CompositeRendererBaseItemProps = BaseItemProps;
export type CompositeRendererItemProps<
  T extends Item,
  P extends BaseItemProps = BaseItemProps,
> = ItemProps<T, P>;

export const CompositeRenderer = forwardRef(function CompositeRenderer<
  T extends Item = any,
>(props: CompositeRendererProps<T>) {
  const htmlProps = useCompositeRenderer(props);
  return createElement("div", htmlProps);
});

export interface CompositeRendererOptions<T extends Item = any>
  extends Omit<CollectionRendererOptions<T>, "store" | "children"> {
  /**
   * Object returned by the
   * [`useCompositeStore`](https://ariakit.org/reference/use-composite-store)
   * hook. If not provided, the closest
   * [Composite](https://ariakit.org/components/composite) component's context
   * will be used.
   *
   * The store
   * [`items`](https://ariakit.org/reference/use-composite-store#items) state
   * will be used to render the items if the
   * [`items`](https://ariakit.org/reference/composite-items#items) prop is not
   * provided.
   */
  store?: CompositeStore<
    T extends CollectionStoreItem ? T : CompositeStoreItem
  >;
  /**
   * The `children` should be a function that receives item props and returns a
   * React element. The item props should be spread onto the element that
   * renders the item.
   */
  children?: (item: ItemProps<T>) => ReactNode;
}

export interface CompositeRendererProps<T extends Item = any>
  extends Omit<ComponentPropsWithRef<"div">, "children">,
    CompositeRendererOptions<T> {}
