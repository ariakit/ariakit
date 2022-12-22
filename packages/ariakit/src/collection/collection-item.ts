import { useContext, useRef } from "react";
import { useForkRef, useSafeLayoutEffect } from "ariakit-react-utils/hooks";
import { useStore } from "ariakit-react-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Options, Props } from "ariakit-react-utils/types";
import { CollectionItemContext, CollectionStateItem } from "./__utils";
import { CollectionState } from "./collection-state";

function identity<T>(value: T) {
  return value;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component. This hook will register the item in the collection state.
 * If this hook is used in a component that is wrapped by `Collection` or a
 * component that implements `useCollection`, there's no need to explicitly pass
 * the `state` prop.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * const state = useCollectionState();
 * const props = useCollectionItem({ state });
 * <Role {...props}>Item</Role>
 * ```
 */
export const useCollectionItem = createHook<CollectionItemOptions>(
  ({ state, shouldRegisterItem = true, getItem = identity, ...props }) => {
    state = useStore(state, ["registerItem"]);
    const contextRegisterItem = useContext(CollectionItemContext);
    const registerItem = state?.registerItem || contextRegisterItem;
    const ref = useRef<HTMLElement>(null);

    useSafeLayoutEffect(() => {
      if (!shouldRegisterItem) return;
      return registerItem?.(getItem({ ref }));
    }, [shouldRegisterItem, getItem, registerItem]);

    props = {
      ...props,
      ref: useForkRef(ref, props.ref),
    };

    return props;
  }
);

/**
 * A component that renders an item in a collection. The collection state can be
 * passed explicitly through the `state` prop or implicitly through the
 * `Collection` component.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * const state = useCollectionState();
 * <CollectionItem state={state}>Item 1</CollectionItem>
 * <CollectionItem state={state}>Item 2</CollectionItem>
 * <CollectionItem state={state}>Item 3</CollectionItem>
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
   * Object returned by the `useCollectionState` hook. If not provided, the
   * parent `Collection` component's context will be used.
   */
  state?: CollectionState;
  /**
   * Whether the item should be registered to the state.
   * @default true
   */
  shouldRegisterItem?: boolean;
  /**
   * A memoized function that returns props that will be passed along with the
   * item when it gets registered to the state.
   * @example
   * ```jsx
   * const state = useCollectionState();
   * const getItem = useCallback((item) => ({ ...item, custom: true }), []);
   * state.items[0]; // { ref, custom: true }
   * <CollectionItem state={state} getItem={getItem} />
   * ```
   */
  getItem?: (props: CollectionStateItem) => CollectionStateItem;
};

export type CollectionItemProps<T extends As = "div"> = Props<
  CollectionItemOptions<T>
>;
