import { useCallback, useEffect, useMemo, useRef } from "react";
import { addItemToArray } from "ariakit-utils/array";
import { getDocument } from "ariakit-utils/dom";
import { useControlledState } from "ariakit-utils/hooks";
import { SetState } from "ariakit-utils/types";
import { Item } from "./__utils";

function isElementPreceding(a: Element, b: Element) {
  return Boolean(
    b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING
  );
}

function findDOMIndex(items: Item[], item: Item) {
  return items.findIndex((currentItem) => {
    if (!currentItem.ref.current || !item.ref.current) return false;
    return isElementPreceding(item.ref.current, currentItem.ref.current);
  });
}

function sortBasedOnDOMPosition(items: Item[]) {
  const pairs = items.map((item, index) => [index, item] as const);
  let isOrderDifferent = false;
  pairs.sort(([indexA, a], [indexB, b]) => {
    const elementA = a.ref.current;
    const elementB = b.ref.current;
    if (!elementA || !elementB) return 0;
    // a before b
    if (isElementPreceding(elementA, elementB)) {
      if (indexA > indexB) {
        isOrderDifferent = true;
      }
      return -1;
    }
    // a after b
    if (indexA < indexB) {
      isOrderDifferent = true;
    }
    return 1;
  });
  if (isOrderDifferent) {
    return pairs.map(([_, item]) => item);
  }
  return items;
}

function setItemsBasedOnDOMPosition(
  items: Item[],
  setItems: (items: Item[]) => any
) {
  const sortedItems = sortBasedOnDOMPosition(items);
  if (items !== sortedItems) {
    setItems(sortedItems);
  }
}

function getCommonParent(items: Item[]) {
  const [firstItem, ...nextItems] = items;
  let parentElement = firstItem?.ref.current?.parentElement;
  while (parentElement) {
    const parent = parentElement;
    if (nextItems.every((item) => parent.contains(item.ref.current))) {
      return parentElement;
    }
    parentElement = parentElement.parentElement;
  }
  return getDocument(parentElement).body;
}

function useSortBasedOnDOMPosition<T extends Item = Item>(
  items: T[],
  setItems: (items: T[]) => any
) {
  // istanbul ignore else: JSDOM doesn't support IntersectionObverser
  // See https://github.com/jsdom/jsdom/issues/2032
  if (typeof IntersectionObserver !== "function") return;
  const previousItems = useRef<typeof items>([]);
  useEffect(() => {
    const callback = () => {
      const hasPreviousItems = !!previousItems.current.length;
      previousItems.current = items;
      // We don't want to sort items if items have been just registered.
      if (!hasPreviousItems) return;
      setItemsBasedOnDOMPosition(items, setItems);
    };
    const root = getCommonParent(items);
    const observer = new IntersectionObserver(callback, { root });
    for (const item of items) {
      if (item.ref.current) {
        observer.observe(item.ref.current);
      }
    }
    return () => observer.disconnect();
  }, [items, setItems]);
}

/**
 * Provides state for the `Collection` components.
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
export function useCollectionState<T extends Item = Item>(
  props: CollectionStateProps<T> = {}
): CollectionState<T> {
  const [items, setItems] = useControlledState([], props.items, props.setItems);

  useSortBasedOnDOMPosition(items, setItems);

  const registerItem = useCallback((item: T) => {
    setItems((prevItems) => {
      // Finds the item group based on the DOM hierarchy
      const index = findDOMIndex(prevItems, item);
      return addItemToArray(prevItems, item, index);
    });
    const unregisterItem = () => {
      setItems((prevItems) => {
        const nextItems = prevItems.filter(({ ref }) => ref !== item.ref);
        if (prevItems.length === nextItems.length) {
          // The item isn't registered, so do nothing
          return prevItems;
        }
        return nextItems;
      });
    };
    return unregisterItem;
  }, []);

  const state = useMemo(
    () => ({ items, setItems, registerItem }),
    [items, setItems, registerItem]
  );

  return state;
}

export type CollectionState<T extends Item = Item> = {
  /**
   * Lists all the items with their `ref`s. This state is automatically updated
   * when an item is registered or unregistered with the `registerItem`
   * function. The order of the items is automatically defined by the order of
   * the elements in the DOM.
   * @example
   * const { items } = useCollectionState();
   * items.forEach((item) => {
   *   const { ref } = item;
   *   ...
   * });
   */
  items: T[];
  /**
   * Sets `items`
   */
  setItems: SetState<CollectionState<T>["items"]>;
  /**
   * Registers an item in the collection. This function returns a cleanup
   * function that unregisters the item.
   * @example
   * const ref = useRef();
   * const { registerItem } = useCollectionState();
   * useEffect(() => {
   *   const unregisterItem = registerItem({ ref });
   *   return unregisterItem;
   * }, [registerItem]);
   */
  registerItem: (item: T) => () => void;
};

export type CollectionStateProps<T extends Item = Item> = Partial<
  Pick<CollectionState<T>, "items" | "setItems">
>;
