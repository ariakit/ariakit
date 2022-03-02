import { useCallback, useEffect, useMemo, useRef } from "react";
import { addItemToArray } from "ariakit-utils/array";
import { getDocument } from "ariakit-utils/dom";
import { useControlledState } from "ariakit-utils/hooks";
import { BivariantCallback, SetState } from "ariakit-utils/types";
import { Item } from "./__utils";

function isElementPreceding(a: Element, b: Element) {
  return Boolean(
    b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING
  );
}

function findDOMIndex(items: Item[], item: Item) {
  const itemElement = item.ref.current;
  if (!itemElement) return -1;
  let length = items.length;
  if (!length) return -1;
  // Most of the times, the new item will be added at the end of the list, so we
  // do a findeIndex in reverse order, instead of wasting time searching the
  // index from the beginning.
  while (length--) {
    const currentItem = items[length];
    if (!currentItem?.ref.current) continue;
    if (isElementPreceding(currentItem.ref.current, itemElement)) {
      return length + 1;
    }
  }
  return -1;
}

function sortBasedOnDOMPosition<T extends Item>(items: T[]) {
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

function setItemsBasedOnDOMPosition<T extends Item>(
  items: T[],
  setItems: (items: T[]) => any
) {
  const sortedItems = sortBasedOnDOMPosition(items);
  if (items !== sortedItems) {
    setItems(sortedItems);
  }
}

function getCommonParent(items: Item[]) {
  const firstItem = items[0];
  const lastItem = items[items.length - 1];
  let parentElement = firstItem?.ref.current?.parentElement;
  while (parentElement) {
    const parent = parentElement;
    if (lastItem && parent.contains(lastItem.ref.current)) {
      return parentElement;
    }
    parentElement = parentElement.parentElement;
  }
  return getDocument(parentElement).body;
}

function useTimeoutObserver<T extends Item = Item>(
  items: T[],
  setItems: (items: T[]) => any
) {
  useEffect(() => {
    const callback = () => setItemsBasedOnDOMPosition(items, setItems);
    const timeout = setTimeout(callback);
    return () => clearTimeout(timeout);
  });
}

function useSortBasedOnDOMPosition<T extends Item = Item>(
  items: T[],
  setItems: (items: T[]) => any
) {
  // istanbul ignore else: JSDOM doesn't support IntersectionObverser
  // See https://github.com/jsdom/jsdom/issues/2032
  if (typeof IntersectionObserver !== "function") {
    useTimeoutObserver(items, setItems);
    return;
  }
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
    items.forEach((item) => {
      if (item.ref.current) {
        observer.observe(item.ref.current);
      }
    });
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
   * Sets the `items` state.
   * @example
   * const { setItems } = useCollectionState();
   * useEffect(() => {
   *   const item = { ref: React.createRef() };
   *   setItems((prevItems) => [...prevItems, item]);
   * }, [setItems])
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
  registerItem: BivariantCallback<(item: T) => () => void>;
};

export type CollectionStateProps<T extends Item = Item> = Partial<
  Pick<CollectionState<T>, "items">
> & {
  /**
   * Function that will be called when setting the collection `items` state.
   * @example
   * // Uncontrolled example
   * useCollectionState({ setItems: (items) => console.log(items) });
   * @example
   * // Controlled example
   * const [items, setItems] = useState([]);
   * useCollectionState({ items, setItems });
   * @example
   * // Externally controlled example
   * function Items({ items, onItemsChange }) {
   *   const collection = useCollectionState({
   *     items,
   *     setItems: onItemsChange,
   *   });
   * }
   */
  setItems?: (items: CollectionState<T>["items"]) => void;
};
