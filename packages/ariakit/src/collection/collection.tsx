import {
  createHook,
  createComponent,
  createElement,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { useWrapElement } from "ariakit-utils/hooks";
import { CollectionState } from "./collection-state";
import { CollectionItemContext } from "./__utils";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component. It receives the collection state through the `state` prop
 * and provides context for `CollectionItem` components.
 * @see https://ariakit.org/docs/collection
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
 * A component that renders a simple wrapper for collection items. It receives
 * the collection state through the `state` prop and provides context for
 * `CollectionItem` components.
 * @see https://ariakit.org/docs/collection
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

export type CollectionOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `useCollectionState` hook.
   */
  state: CollectionState;
};

export type CollectionProps<T extends As = "div"> = Props<CollectionOptions<T>>;
