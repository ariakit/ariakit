import { useWrapElement } from "ariakit-react-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Options, Props } from "ariakit-react-utils/types";
import { CollectionItemContext } from "./__utils";
import { CollectionState } from "./collection-state";

/**
 * Returns collection props. It receives the collection state through the
 * [`state`](https://ariakit.org/apis/collection#state) prop and provides
 * context for [`CollectionItem`](https://ariakit.org/apis/collection-item)
 * components.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * const collection = useCollectionState();
 * const props = useCollection({ state });
 * <Role {...props}>
 *   <CollectionItem>Item 1</CollectionItem>
 *   <CollectionItem>Item 2</CollectionItem>
 *   <CollectionItem>Item 3</CollectionItem>
 * </Role>
 * ```
 */
export const useCollection = createHook<CollectionOptions>(
  ({ state, ...props }) => {
    props = useWrapElement(
      props,
      (element) => (
        <CollectionItemContext.Provider value={state.registerItem}>
          {element}
        </CollectionItemContext.Provider>
      ),
      [state.registerItem]
    );

    return props;
  }
);

/**
 * Renders a simple wrapper for collection items. It receives the collection
 * state through the [`state`](https://ariakit.org/apis/collection#state) prop
 * and provides context for
 * [`CollectionItem`](https://ariakit.org/apis/collection-item) components.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * const collection = useCollectionState();
 * <Collection state={collection}>
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
   * Object returned by the
   * [`useCollectionState`](https://ariakit.org/apis/collection-state) hook.
   */
  state: CollectionState;
};

export type CollectionProps<T extends As = "div"> = Props<CollectionOptions<T>>;
