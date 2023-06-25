import type { ComponentPropsWithRef } from "react";
import { createContext, useContext, useMemo } from "react";
import {
  getCollectionItem,
  getCollectionItemId,
  useCollectionRenderer,
} from "../collection/collection-renderer.js";
import type {
  CollectionRendererItem,
  CollectionRendererItemObject,
  CollectionRendererOptions,
} from "../collection/collection-renderer.js";
import type { CollectionStoreItem } from "../collection/collection-store.js";
import { useId, useWrapElement } from "../utils/hooks.js";
import { useStoreState } from "../utils/store.jsx";
import { createElement, forwardRef } from "../utils/system.js";
import { CompositeContext } from "./composite-context.js";
import type { CompositeStore, CompositeStoreItem } from "./composite-store.js";

interface ItemObject extends CollectionRendererItemObject {
  disabled?: boolean;
}

type Item = ItemObject | CollectionRendererItem;

type Store<T extends Item> = CompositeStore<
  T extends CollectionStoreItem ? T : CompositeStoreItem
>;

interface CompositeRendererContextValue {
  store: CompositeRendererOptions["store"];
  orientation: CompositeRendererOptions["orientation"];
  firstId: string | null;
  lastId: string | null;
}

const CompositeRendererContext =
  createContext<CompositeRendererContextValue | null>(null);

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
  baseId: string
): number {
  return items.findIndex((item, index) => {
    const itemId = getCollectionItemId(item, index, baseId);
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
  const context = useContext(CompositeContext);
  store = store || (context as Store<T>);

  const orientation =
    useStoreState(store, (state) =>
      orientationProp ?? state.orientation === "both"
        ? "vertical"
        : state.orientation
    ) ?? orientationProp;

  const items =
    useStoreState(store, (state) => props.items ?? (state.items as T[])) ||
    props.items;

  const id = useId(props.id);

  let parent = useContext(CompositeRendererContext);
  if (store && parent?.store !== store) {
    parent = null;
  }

  const itemsCount = useMemo(() => countItems(items), [items]);

  const setSize = useMemo(
    () => ariaSetSize ?? itemsCount[itemsCount.length - 1] ?? 0,
    [ariaSetSize, itemsCount]
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
      (index) => index >= 0
    );
    if (persistentIndicesProp) {
      return [...persistentIndicesProp, ...indices];
    }
    return indices;
  }, [firstIndex, activeIndex, lastIndex, persistentIndicesProp]);

  const firstId = useMemo(() => {
    if (!id) return null;
    if (!items) return null;
    if (firstIndex === -1) return null;
    const item = getCollectionItem(items, firstIndex);
    return getCollectionItemId(item, firstIndex, id);
  }, [id, items, firstIndex]);

  const lastId = useMemo(() => {
    if (!id) return null;
    if (!items) return null;
    if (lastIndex === -1) return null;
    const item = getCollectionItem(items, lastIndex);
    return getCollectionItemId(item, lastIndex, id);
  }, [id, items, lastIndex]);

  const contextValue = useMemo(
    () => ({ store, orientation, firstId, lastId }),
    [store, orientation, firstId, lastId]
  );

  props = useWrapElement(
    props,
    (element) => (
      <CompositeRendererContext.Provider value={contextValue}>
        {element}
      </CompositeRendererContext.Provider>
    ),
    [contextValue]
  );

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
      return renderItem?.(nextItem);
    },
  });
}

export const CompositeRenderer = forwardRef(function CompositeRenderer<
  T extends Item = any
>(props: CompositeRendererProps<T>) {
  const htmlProps = useCompositeRenderer(props);
  return createElement("div", htmlProps);
});

export interface CompositeRendererOptions<T extends Item = any>
  extends Omit<CollectionRendererOptions<T>, "store"> {
  store?: Store<T>;
}

export interface CompositeRendererProps<T extends Item = any>
  extends Omit<ComponentPropsWithRef<"div">, "children">,
    CompositeRendererOptions<T> {}
