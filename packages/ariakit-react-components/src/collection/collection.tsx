import {
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
  useStoreProp,
} from "@ariakit/react-utils";
import type { Options, Props, ProviderComponent } from "@ariakit/react-utils";
import { removeUndefinedValues } from "@ariakit/utils";
import type { ElementType } from "react";
import {
  CollectionScopedContextProvider,
  useCollectionProviderContext,
} from "./collection-context.tsx";
import type { CollectionStore } from "./collection-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `Collection` component. It receives the collection
 * store through the `store` prop and provides context for `CollectionItem`
 * components.
 * @see https://ariakit.com/components/collection
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
    store = useStoreProp(store, context);

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
 * through the [`store`](https://ariakit.com/reference/collection#store) prop
 * and provides context for
 * [`CollectionItem`](https://ariakit.com/reference/collection-item) components.
 * @see https://ariakit.com/components/collection
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

export interface CollectionOptions<
  _T extends ElementType = TagName,
> extends Options {
  /**
   * Object returned by the
   * [`useCollectionStore`](https://ariakit.com/reference/use-collection-store)
   * hook. If not provided, the closest
   * [`CollectionProvider`](https://ariakit.com/reference/collection-provider)
   * component's context will be used.
   *
   * You can also pass a provider component (for example,
   * [`CollectionProvider`](https://ariakit.com/reference/collection-provider)).
   * In that case, the store is read from the closest matching provider, even if
   * another compatible store context is closer.
   */
  store?: CollectionStore | ProviderComponent<CollectionStore>;
}

export type CollectionProps<T extends ElementType = TagName> = Props<
  T,
  CollectionOptions<T>
>;
