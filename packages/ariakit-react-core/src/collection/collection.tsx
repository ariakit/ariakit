import type { ElementType } from "react";
import { removeUndefinedValues } from "@ariakit/core/utils/misc";
import { useWrapElement } from "../utils/hooks.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Options, Props } from "../utils/types.js";
import {
  CollectionScopedContextProvider,
  useCollectionProviderContext,
} from "./collection-context.js";
import type { CollectionStore } from "./collection-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `Collection` component. It receives the collection
 * store through the `store` prop and provides context for `CollectionItem`
 * components.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * const collection = useCollectionStore();
 * const props = useCollection({ store });
 * <Role {...props}>
 *   <CollectionItem>Item 1</CollectionItem>
 *   <CollectionItem>Item 2</CollectionItem>
 *   <CollectionItem>Item 3</CollectionItem>
 * </Role>
 * ```
 */
export const useCollection = createHook<TagName, CollectionOptions>(
  function useCollection({ store, ...props }) {
    const context = useCollectionProviderContext();
    store = store || context;

    props = useWrapElement(
      props,
      (element) => (
        <CollectionScopedContextProvider value={store}>
          {element}
        </CollectionScopedContextProvider>
      ),
      [store],
    );

    return removeUndefinedValues(props);
  },
);

/**
 * Renders a simple wrapper for collection items. It accepts a collection store
 * through the [`store`](https://ariakit.org/reference/collection#store) prop
 * and provides context for
 * [`CollectionItem`](https://ariakit.org/reference/collection-item) components.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * const collection = useCollectionStore();
 * <Collection store={collection}>
 *   <CollectionItem>Item 1</CollectionItem>
 *   <CollectionItem>Item 2</CollectionItem>
 *   <CollectionItem>Item 3</CollectionItem>
 * </Collection>
 * ```
 */
export const Collection = forwardRef(function Collection(
  props: CollectionProps,
) {
  const htmlProps = useCollection(props);
  return createElement(TagName, htmlProps);
});

export interface CollectionOptions<_T extends ElementType = TagName>
  extends Options {
  /**
   * Object returned by the
   * [`useCollectionStore`](https://ariakit.org/reference/use-collection-store)
   * hook. If not provided, the closest
   * [`CollectionProvider`](https://ariakit.org/reference/collection-provider)
   * component's context will be used.
   */
  store?: CollectionStore;
}

export type CollectionProps<T extends ElementType = TagName> = Props<
  T,
  CollectionOptions<T>
>;
