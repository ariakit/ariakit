import { RefCallback, useCallback, useContext, useRef } from "react";
import { CollectionStoreItem } from "@ariakit/core/collection/collection-store";
import { identity, invariant } from "@ariakit/core/utils/misc";
import { useForkRef, useId } from "../utils/hooks";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Options, Props } from "../utils/types";
import { CollectionStore } from "./collection-store";
import { CollectionContext } from "./utils";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component. This hook will register the item in the collection store.
 * If this hook is used in a component that is wrapped by `Collection` or a
 * component that implements `useCollection`, there's no need to explicitly pass
 * the `store` prop.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * const store = useCollectionStore();
 * const props = useCollectionItem({ store });
 * <Role {...props}>Item</Role>
 * ```
 */
export const useCollectionItem = createHook<CollectionItemOptions>(
  ({ store, shouldRegisterItem = true, getItem = identity, ...props }) => {
    const context = useContext(CollectionContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "CollectionItem must be wrapped in a Collection component"
    );

    const id = useId(props.id);
    const unrenderItem = useRef<() => void>();

    const ref = useCallback<RefCallback<HTMLElement>>(
      (element) => {
        if (!element || !id || !shouldRegisterItem) {
          return unrenderItem.current?.();
        }
        const item = getItem({ id, element });
        unrenderItem.current = store?.renderItem(item);
      },
      [id, shouldRegisterItem, getItem, store]
    );

    props = {
      ...props,
      ref: useForkRef(ref, props.ref),
    };

    return props;
  }
);

/**
 * A component that renders an item in a collection. The collection store can be
 * passed explicitly through the `store` prop or implicitly through the
 * `Collection` component.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * const store = useCollectionStore();
 * <CollectionItem store={store}>Item 1</CollectionItem>
 * <CollectionItem store={store}>Item 2</CollectionItem>
 * <CollectionItem store={store}>Item 3</CollectionItem>
 * ```
 */
export const CollectionItem = createComponent<CollectionItemOptions>(
  (props) => {
    const htmlProps = useCollectionItem(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  CollectionItem.displayName = "CollectionItem";
}

export type CollectionItemOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `useCollectionStore` hook. If not provided, the
   * parent `Collection` component's context will be used.
   */
  store?: CollectionStore;
  /**
   * Whether the item should be registered to the store.
   * @default true
   */
  shouldRegisterItem?: boolean;
  /**
   * A memoized function that returns props that will be passed along with the
   * item when it gets registered to the store.
   * @example
   * ```jsx
   * const store = useCollectionStore();
   * const getItem = useCallback((item) => ({ ...item, custom: true }), []);
   * store.items[0]; // { ref, custom: true }
   * <CollectionItem store={store} getItem={getItem} />
   * ```
   */
  getItem?: (props: CollectionStoreItem) => CollectionStoreItem;
};

export type CollectionItemProps<T extends As = "div"> = Props<
  CollectionItemOptions<T>
>;
