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
  const itemElement = item.ref?.current;
  if (!itemElement) return -1;
  let length = items.length;
  if (!length) return -1;
  const firstElement = items[0]?.ref?.current;
  if (firstElement && isElementPreceding(itemElement, firstElement)) {
    return 0;
  }
  // Most of the times, the new item will be added at the end of the list, so we
  // do a findIndex in reverse order, instead of wasting time searching the
  // index from the beginning.
  while (length--) {
    const currentItem = items[length];
    if (!currentItem?.ref?.current) continue;
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
    const elementA = a.ref?.current;
    const elementB = b.ref?.current;
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
  const [renderedItems, setRenderedItems] = useControlledState(
    [],
    props.renderedItems,
    props.setRenderedItems
  );

  useSortBasedOnDOMPosition(renderedItems, setRenderedItems);

  const registerItem = useCallback((item: T) => {
    let prevItem: T | undefined;
    let index: number | undefined;

    const rendered = !!item.ref && !item.presentation;

    setItems((items) => {
      prevItem = items.find(({ id }) => id === item.id);
      const nextItems = items.slice();
      if (prevItem) {
        index = nextItems.indexOf(prevItem);
        nextItems[index] = { ...prevItem, ...item };
      } else {
        nextItems.push(item);
      }
      return nextItems;
    });

    if (rendered) {
      setRenderedItems((items) => {
        const index = findDOMIndex(items, item);
        return addItemToArray(items, item, index);
      });
    }

    const unregisterItem = () => {
      setItems((items) => {
        if (!prevItem) return items.filter(({ id }) => id !== item.id);
        if (index == null || index < 0) return items;
        const nextItems = items.slice();
        nextItems[index] = prevItem;
        return nextItems;
      });

      if (rendered) {
        setRenderedItems((items) => {
          const nextItems = items.filter(({ ref }) => ref !== item.ref);
          if (items.length === nextItems.length) return items;
          return nextItems;
        });
      }
    };

    return unregisterItem;
  }, []);

  const state = useMemo(
    () => ({
      items,
      setItems,
      renderedItems,
      setRenderedItems,
      registerItem,
    }),
    [items, setItems, renderedItems, setRenderedItems, registerItem]
  );

  return state;
}

export type CollectionState<T extends Item = Item> = {
  /**
   * Array with all the items with their respective `id`s. This state is
   * automatically updated when an item is registered or unregistered with the
   * `registerItem` function. Unlike `renderedItems`, this list is not
   * automatically sorted based on the DOM position of the items. The order of
   * the items in this list is the order in which they were registered.
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
   *   setItems((items) => [...items, item]);
   *   return () => {
   *     setItems((items) => items.filter(({ id }) => id !== item.id));
   *   };
   * }, [setItems]);
   */
  setItems: SetState<CollectionState<T>["items"]>;
  /**
   * Array with all the items with their respective `id`s and `ref`s. This state
   * is automatically updated when an item is registered or unregistered with
   * the `registerItem` function. The order of the items is automatically
   * defined by the order of the elements in the DOM.
   * @example
   * const { renderedItems } = useCollectionState();
   * renderedItems.forEach((item) => {
   *   const { id, ref } = item;
   *   ...
   * });
   */
  renderedItems: T[];
  /**
   * Sets the `renderedItems` state.
   * @example
   * const { setRenderedItems } = useCollectionState();
   * useEffect(() => {
   *   const item = { id: "item-1", ref: React.createRef() };
   *   setRenderedItems((items) => [...items, item]);
   *   return () => {
   *     setRenderedItems((items) =>
   *       items.filter(({ ref }) => ref !== item.ref)
   *     ));
   *   };
   * }, [setRenderedItems]);
   */
  setRenderedItems: SetState<CollectionState<T>["renderedItems"]>;
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
  Pick<CollectionState<T>, "items" | "renderedItems">
> & {
  /**
   * Array with all the items with their respective `id`s and any other props
   * that will be passed to the item components. This is useful when using
   * virtualized collections.
   * @example
   * const collection = useCollectionState({
   *   defaultItems: [
   *     { id: "item-1", children: "item-1" },
   *     { id: "item-2", children: "item-2" },
   *     { id: "item-3", children: "item-3" },
   *   ],
   * });
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
  setItems?: (collection: CollectionState<T>["items"]) => void;
  /**
   * Function that will be called when setting the collection `renderedItems`
   * state.
   * @example
   * // Controlled example
   * const [renderedItems, setRenderedItems] = useState([]);
   * useCollectionState({ renderedItems, setRenderedItems });
   */
  setRenderedItems?: (items: CollectionState<T>["renderedItems"]) => void;
};
