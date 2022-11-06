import { useWrapElement } from "ariakit-react-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Options, Props } from "ariakit-react-utils/types";
import { CollectionContext } from "./__store-utils";
import { CollectionStore } from "./store-collection-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component. It receives the collection store through the `store` prop
 * and provides context for `CollectionItem` components.
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
    props = useWrapElement(
      props,
      (element) => (
        <CollectionContext.Provider value={store}>
          {element}
        </CollectionContext.Provider>
      ),
      [store]
    );
    return props;
  }
);

/**
 * A component that renders a simple wrapper for collection items. It receives
 * the collection store through the `store` prop and provides context for
 * `CollectionItem` components.
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

export type CollectionOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `useCollectionStore` hook.
   */
  store: CollectionStore;
};

export type CollectionProps<T extends As = "div"> = Props<CollectionOptions<T>>;
