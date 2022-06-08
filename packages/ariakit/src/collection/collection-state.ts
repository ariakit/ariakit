import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addItemToArray } from "ariakit-utils/array";
import { getDocument } from "ariakit-utils/dom";
import { useControlledState } from "ariakit-utils/hooks";
import { BivariantCallback, SetState } from "ariakit-utils/types";
import { Item, RenderedItem } from "./__utils";

function isElementPreceding(a: Element, b: Element) {
  return Boolean(
    b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING
  );
}

function findDOMIndex(items: RenderedItem[], item: RenderedItem) {
  const itemElement = item.ref.current;
  if (!itemElement) return -1;
  let length = items.length;
  if (!length) return -1;
  const [first] = items;
  if (
    first?.ref.current &&
    isElementPreceding(itemElement, first.ref.current)
  ) {
    return 0;
  }
  // Most of the times, the new item will be added at the end of the list, so we
  // do a findIndex in reverse order, instead of wasting time searching the
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

function sortBasedOnDOMPosition<T extends RenderedItem>(items: T[]) {
  const pairs = items.map((item, index) => [index, item] as const);
  let isOrderDifferent = false;
  pairs.sort(([indexA, a], [indexB, b]) => {
    const elementA = a.ref.current;
    const elementB = b.ref.current;
    if (elementA === elementB) return 0;
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

function setItemsBasedOnDOMPosition<T extends RenderedItem>(
  items: T[],
  setItems: (items: T[]) => any
) {
  const sortedItems = sortBasedOnDOMPosition(items);
  if (items !== sortedItems) {
    setItems(sortedItems);
  }
}

function getCommonParent(items: RenderedItem[]) {
  const firstItem = items.find((item) => !!item.ref);
  const lastItem = [...items].reverse().find((item) => !!item.ref);
  let parentElement = firstItem?.ref?.current?.parentElement;
  while (parentElement && lastItem?.ref) {
    const parent = parentElement;
    if (lastItem && parent.contains(lastItem.ref.current)) {
      return parentElement;
    }
    parentElement = parentElement.parentElement;
  }
  return getDocument(parentElement).body;
}

function useTimeoutObserver<T extends RenderedItem = RenderedItem>(
  items: T[],
  setItems: (items: T[]) => any
) {
  useEffect(() => {
    const callback = () => setItemsBasedOnDOMPosition(items, setItems);
    const timeout = setTimeout(callback);
    return () => clearTimeout(timeout);
  });
}

function useSortBasedOnDOMPosition<T extends RenderedItem = RenderedItem>(
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
      if (item.ref?.current) {
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
  const [items, setItems] = useControlledState(
    props.defaultItems || [],
    props.items,
    props.setItems
  );
  const [renderedItems, setRenderedItems] = useState<RenderedItem<T>[]>([]);

  useEffect(() => {
    if (props.items) {
      const nextRenderedItems = props.items.filter(
        (item) => !!item.ref?.current
      );
      setRenderedItems(nextRenderedItems as RenderedItem<T>[]);
    }
  }, [props.items]);

  useSortBasedOnDOMPosition(renderedItems, setRenderedItems);

  const registerItem = useCallback((item: T) => {
    if (item.ref) {
      const renderedItem = item as RenderedItem<T>;
      setRenderedItems((prevItems) => {
        // Finds the item index based on the DOM hierarchy
        const index = findDOMIndex(prevItems, renderedItem);
        return addItemToArray(prevItems, renderedItem, index);
      });
    }
    let prevItem: T | undefined;
    setItems((prevItems) => {
      prevItem = prevItems.find((prevItem) => prevItem.id === item.id);
      if (prevItem) {
        let index = prevItems.indexOf(prevItem);
        if (index === -1) {
          index = prevItems.length;
        }
        prevItems[index] = { ...prevItem, ...item };
        return prevItems.slice();
      }
      return addItemToArray(prevItems, item);
    });
    const unregisterItem = () => {
      if (item.ref) {
        setRenderedItems((prevItems) => {
          const nextItems = prevItems.filter(({ id }) => id !== item.id);
          if (prevItems.length === nextItems.length) {
            // The item isn't registered, so do nothing
            return prevItems;
          }
          return nextItems;
        });
      }
      const previousItem = prevItem;
      if (previousItem) {
        setItems((prevItems) => {
          const index = prevItems.indexOf(previousItem);
          if (index === -1) return prevItems;
          prevItems[index] = previousItem;
          return prevItems.slice();
        });
      }
    };
    return unregisterItem;
  }, []);

  const state = useMemo(
    () => ({ renderedItems, items, setItems, registerItem }),
    [renderedItems, items, setItems, registerItem]
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
  renderedItems: RenderedItem<T>[];
  /**
   * Lists all the items with their `id`s. This state is automatically updated
   * when an item is registered or unregistered with the `registerItem`
   * function.
   * @example
   * const { items } = useCollectionState();
   * items.forEach((item) => {
   *   const { id } = item;
   *   ...
   * });
   */
  items: T[];
  /**
   * Sets the `items` state.
   * @example
   * const { setItems } = useCollectionState();
   * useEffect(() => {
   *   const item = { id: "item-1" };
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
   *   const unregisterItem = registerItem({ id: "item-1", ref });
   *   return unregisterItem;
   * }, [registerItem]);
   */
  registerItem: BivariantCallback<(item: T) => () => void>;
};

export type CollectionStateProps<T extends Item = Item> = Partial<
  Pick<CollectionState<T>, "items">
> & {
  /**
   * TODO: Comment.
   */
  defaultItems?: CollectionState<T>["items"];
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
