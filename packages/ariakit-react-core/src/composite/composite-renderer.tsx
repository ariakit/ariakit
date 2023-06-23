import type { ComponentPropsWithRef, ForwardedRef } from "react";
import { forwardRef, useContext, useMemo } from "react";
import {
  CollectionRenderer,
  getCollectionItemObject,
} from "../collection/collection-renderer.js";
import type {
  CollectionRendererItem,
  CollectionRendererOptions,
} from "../collection/collection-renderer.js";
import type { CollectionStoreItem } from "../collection/collection-store.js";
import { useStoreState } from "../utils/store.jsx";
import { CompositeContext } from "./composite-context.js";
import type { CompositeStore, CompositeStoreItem } from "./composite-store.js";

// TODO: Should be in the composite item.
// disabled?: boolean;
type Item = CollectionRendererItem;

type Store<T extends Item = any> = CompositeStore<
  T extends CollectionStoreItem ? T : CompositeStoreItem
>;

function findIndexById<T extends Item = any>(
  items: readonly T[],
  id: string
): number {
  return items.findIndex((item) => {
    const object = getCollectionItemObject(item);
    if (object.id === id) return true;
    if (object.items?.length) return findIndexById(object.items, id) !== -1;
    const ids = id.split("/");
    if (ids.length === 1) return false;
    return ids.some((id) => object.id === id);
  });
}

function CompositeRendererImpl<T extends Item = any>(
  {
    store,
    orientation: orientationProp,
    persistentIndices: persistentIndicesProp,
    ...props
  }: CompositeRendererProps<T>,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  const context = useContext(CompositeContext);
  store = store || (context as Store<T>);

  const orientation =
    useStoreState(store, (state) =>
      orientationProp ?? state.orientation === "both"
        ? undefined
        : state.orientation
    ) ?? orientationProp;

  const items =
    useStoreState(store, (state) => props.items ?? (state.items as T[])) ||
    props.items;

  const firstIndex = useMemo(() => {
    if (!items) return -1;
    if (typeof items === "number") return 0;
    if (!items.length) return -1;
    return items.findIndex((item) => !getCollectionItemObject(item).disabled);
  }, [items]);

  const lastIndex = useMemo(() => {
    if (!items) return -1;
    if (typeof items === "number") return items - 1;
    if (!items.length) return -1;
    for (let index = items.length - 1; index >= 0; index -= 1) {
      const item = items[index];
      if (!getCollectionItemObject(item).disabled) return index;
    }
    return -1;
  }, [items]);

  const activeId = useStoreState(store, "activeId");

  const activeIndex = useMemo(() => {
    if (activeId == null) return -1;
    if (!items) return -1;
    if (typeof items === "number") return -1;
    if (!items.length) return -1;
    return findIndexById(items, activeId);
  }, [items, activeId]);

  const previousIndex = useMemo(() => {
    if (!items) return -1;
    if (typeof items === "number") return activeIndex - 1;
    if (!items.length) return -1;
    let index = activeIndex - 1;
    let item = items[index];
    while (index >= 0 && getCollectionItemObject(item).disabled) {
      index -= 1;
      item = items[index];
    }
    return index;
  }, [items, activeIndex]);

  const nextIndex = useMemo(() => {
    if (!items) return -1;
    if (typeof items === "number") return activeIndex + 1;
    if (!items.length) return -1;
    let index = activeIndex + 1;
    let item = items[index];
    while (index < items.length && getCollectionItemObject(item).disabled) {
      index += 1;
      item = items[index];
    }
    return index;
  }, [items, activeIndex]);

  const persistentIndices = useMemo(() => {
    const indices = [
      firstIndex,
      lastIndex,
      activeIndex,
      previousIndex,
      nextIndex,
    ].filter((index) => index >= 0);
    if (persistentIndicesProp) {
      return [...persistentIndicesProp, ...indices];
    }
    return indices;
  }, [
    firstIndex,
    lastIndex,
    activeIndex,
    previousIndex,
    nextIndex,
    persistentIndicesProp,
  ]);

  return (
    <CollectionRenderer
      ref={forwardedRef}
      store={store}
      orientation={orientation}
      persistentIndices={persistentIndices}
      {...props}
    />
  );
}

export const CompositeRenderer = forwardRef(
  CompositeRendererImpl
) as typeof CompositeRendererImpl;

export interface CompositeRendererOptions<T extends Item = any>
  extends Omit<CollectionRendererOptions<T>, "store"> {
  store?: Store<T>;
}

export interface CompositeRendererProps<T extends Item = any>
  extends Omit<ComponentPropsWithRef<"div">, "children">,
    CompositeRendererOptions<T> {}
