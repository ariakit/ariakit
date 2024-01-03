import { useWrapElement } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";
import {
  CollectionScopedContextProvider,
  useCollectionProviderContext,
} from "./collection-context.js";
import type { CollectionStore } from "./collection-store.js";

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
export const useCollection = createHook<CollectionOptions>(
  ({ store, ...props }) => {
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
    return props;
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
export const Collection = createComponent<CollectionOptions>((props) => {
  const htmlProps = useCollection(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Collection.displayName = "Collection";
}

export interface CollectionOptions<T extends As = "div"> extends Options<T> {
  /**
   * Object returned by the
   * [`useCollectionStore`](https://ariakit.org/reference/use-collection-store)
   * hook. If not provided, the closest
   * [`CollectionProvider`](https://ariakit.org/reference/collection-provider)
   * component's context will be used.
   */
  store?: CollectionStore;
}

export type CollectionProps<T extends As = "div"> = Props<CollectionOptions<T>>;
