import type { CollectionStoreItem } from "@ariakit/core/collection/collection-store";
import { identity, removeUndefinedValues } from "@ariakit/core/utils/misc";
import { useEffect, useRef } from "react";
import type { ElementType } from "react";
import { useId, useMergeRefs } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { useCollectionContext } from "./collection-context.tsx";
import type { CollectionStore } from "./collection-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `CollectionItem` component. This hook will register
 * the item in the collection store. If this hook is used in a component that is
 * wrapped by `Collection` or a component that implements `useCollection`,
 * there's no need to explicitly pass the `store` prop.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * const store = useCollectionStore();
 * const props = useCollectionItem({ store });
 * <Role {...props}>Item</Role>
 * ```
 */
export const useCollectionItem = createHook<TagName, CollectionItemOptions>(
  function useCollectionItem({
    store,
    shouldRegisterItem = true,
    getItem = identity,
    // @ts-expect-error This prop may come from a collection renderer.
    element,
    ...props
  }) {
    const context = useCollectionContext();
    store = store || context;

    const id = useId(props.id);
    const ref = useRef<HTMLType>(element);

    useEffect(() => {
      const element = ref.current;
      if (!id) return;
      if (!element) return;
      if (!shouldRegisterItem) return;
      const item = getItem({ id, element });
      return store?.renderItem(item);
    }, [id, shouldRegisterItem, getItem, store]);

    props = {
      ...props,
      ref: useMergeRefs(ref, props.ref),
    };

    return removeUndefinedValues(props);
  },
);

/**
 * Renders an item in a collection. The collection store can be passed
 * explicitly through the
 * [`store`](https://ariakit.org/reference/collection-item#store) prop or
 * implicitly through the parent
 * [`Collection`](https://ariakit.org/reference/collection) component.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * const store = useCollectionStore();
 * <CollectionItem store={store}>Item 1</CollectionItem>
 * <CollectionItem store={store}>Item 2</CollectionItem>
 * <CollectionItem store={store}>Item 3</CollectionItem>
 * ```
 */
export const CollectionItem = forwardRef(function CollectionItem(
  props: CollectionItemProps,
) {
  const htmlProps = useCollectionItem(props);
  return createElement(TagName, htmlProps);
});

export interface CollectionItemOptions<_T extends ElementType = TagName>
  extends Options {
  /**
   * Object returned by the
   * [`useCollectionStore`](https://ariakit.org/reference/use-collection-store)
   * hook. If not provided, the closest
   * [`Collection`](https://ariakit.org/reference/collection) or
   * [`CollectionProvider`](https://ariakit.org/reference/collection-provider)
   * components' context will be used.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
   */
  store?: CollectionStore;
  /**
   * The unique ID of the item. This will be used to register the item in the
   * store and for the element's `id` attribute. If not provided, a unique ID
   * will be automatically generated.
   *
   * Live examples:
   * - [Combobox with Tabs](https://ariakit.org/examples/combobox-tabs)
   * - [Tab with React Router](https://ariakit.org/examples/tab-react-router)
   * - [Animated TabPanel](https://ariakit.org/examples/tab-panel-animated)
   * - [Select with Combobox and
   *   Tabs](https://ariakit.org/examples/select-combobox-tab)
   */
  id?: string;
  /**
   * Whether the item should be registered as part of the collection.
   * @default true
   */
  shouldRegisterItem?: boolean;
  /**
   * A memoized function that returns props to be passed with the item during
   * its registration in the store.
   * @example
   * ```jsx
   * const getItem = useCallback((data) => ({ ...data, custom: true }), []);
   * <CollectionItem getItem={getItem} />
   * ```
   */
  getItem?: (props: CollectionStoreItem) => CollectionStoreItem;
}

export type CollectionItemProps<T extends ElementType = TagName> = Props<
  T,
  CollectionItemOptions<T>
>;
