import { getDocument } from "../utils/dom.js";
import { chain, defaultValue } from "../utils/misc.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import {
  batch,
  createStore,
  setup,
  throwOnConflictingProps,
} from "../utils/store.js";
import type { BivariantCallback } from "../utils/types.js";

interface Item {
  id: string;
  element?: HTMLElement | null;
}

function isElementPreceding(a: Element, b: Element) {
  return Boolean(
    b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING,
  );
}

function sortBasedOnDOMPosition<T extends Item>(items: T[]) {
  const pairs = items.map((item, index) => [index, item] as const);
  let isOrderDifferent = false;
  pairs.sort(([indexA, a], [indexB, b]) => {
    const elementA = a.element;
    const elementB = b.element;
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

function getCommonParent(items: Item[]) {
  const firstItem = items.find((item) => !!item.element);
  const lastItem = [...items].reverse().find((item) => !!item.element);
  let parentElement = firstItem?.element?.parentElement;
  while (parentElement && lastItem?.element) {
    const parent = parentElement;
    if (lastItem && parent.contains(lastItem.element)) {
      return parentElement;
    }
    parentElement = parentElement.parentElement;
  }
  return getDocument(parentElement).body;
}

/**
 * Creates a collection store.
 */
export function createCollectionStore<T extends Item = Item>(
  props: CollectionStoreProps<T> = {},
): CollectionStore<T> {
  throwOnConflictingProps(props, props.store);

  const syncState = props.store?.getState();

  const items = defaultValue(
    props.items,
    syncState?.items,
    props.defaultItems,
    [],
  );

  const itemsMap = new Map<string, T>(items.map((item) => [item.id, item]));

  const initialState: CollectionStoreState<T> = {
    items,
    renderedItems: defaultValue(syncState?.renderedItems, []),
  };

  const privateStore = createStore({
    renderedItems: initialState.renderedItems,
  });
  const collection = createStore(initialState, props.store);

  const sortItems = () => {
    const state = privateStore.getState();
    const renderedItems = sortBasedOnDOMPosition(state.renderedItems);
    privateStore.setState("renderedItems", renderedItems);
    collection.setState("renderedItems", renderedItems);
  };

  setup(collection, () => {
    return batch(privateStore, ["renderedItems"], (state) => {
      let firstRun = true;
      let raf = requestAnimationFrame(sortItems);
      if (typeof IntersectionObserver !== "function") return;
      const callback = () => {
        if (firstRun) {
          firstRun = false;
          return;
        }
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(sortItems);
      };
      const root = getCommonParent(state.renderedItems);
      const observer = new IntersectionObserver(callback, { root });
      state.renderedItems.forEach((item) => {
        if (!item.element) return;
        observer.observe(item.element);
      });
      return () => {
        cancelAnimationFrame(raf);
        observer.disconnect();
      };
    });
  });

  const mergeItem = (
    item: T,
    setItems: (getItems: (items: T[]) => T[]) => void,
    canDeleteFromMap = false,
  ) => {
    let prevItem: T | undefined;
    setItems((items) => {
      const index = items.findIndex(({ id }) => id === item.id);
      const nextItems = items.slice();
      if (index !== -1) {
        prevItem = items[index];
        const nextItem = { ...prevItem, ...item };
        nextItems[index] = nextItem;
        itemsMap.set(item.id, nextItem);
      } else {
        nextItems.push(item);
        itemsMap.set(item.id, item);
      }
      return nextItems;
    });
    const unmergeItem = () => {
      setItems((items) => {
        if (!prevItem) {
          if (canDeleteFromMap) {
            itemsMap.delete(item.id);
          }
          return items.filter(({ id }) => id !== item.id);
        }
        const index = items.findIndex(({ id }) => id === item.id);
        if (index === -1) return items;
        const nextItems = items.slice();
        nextItems[index] = prevItem;
        itemsMap.set(item.id, prevItem);
        return nextItems;
      });
    };
    return unmergeItem;
  };

  const registerItem: CollectionStore<T>["registerItem"] = (item) =>
    mergeItem(item, (getItems) => collection.setState("items", getItems), true);

  return {
    ...collection,

    registerItem,
    renderItem: (item) =>
      chain(
        registerItem(item),
        mergeItem(item, (getItems) =>
          privateStore.setState("renderedItems", getItems),
        ),
      ),

    item: (id) => {
      if (!id) return null;
      let item = itemsMap.get(id);
      if (!item) {
        const { items } = collection.getState();
        item = items.find((item) => item.id === id);
        if (item) {
          itemsMap.set(id, item);
        }
      }
      return item || null;
    },
  };
}

export type CollectionStoreItem = Item;

export interface CollectionStoreState<T extends Item = Item> {
  /**
   * Lists all the items with their meta data. This state is automatically
   * updated when an item is registered or unregistered with the `registerItem`
   * function.
   */
  items: T[];
  /**
   * Lists all the items that are currently rendered. This state is
   * automatically updated when an item is rendered or unrendered with the
   * `renderItem` function. This state is also automatically sorted based on
   * their DOM position.
   */
  renderedItems: T[];
}

export interface CollectionStoreFunctions<T extends Item = Item> {
  /**
   * Registers an item in the collection. This function returns a cleanup
   * function that unregisters the item.
   * @param item The item to register.
   * @example
   * const unregisterItem = store.registerItem({ id: "item-1" });
   * // on cleanup
   * unregisterItem();
   */
  registerItem: BivariantCallback<(item: T) => () => void>;
  /**
   * Renders an item in the collection. This function returns a cleanup function
   * that unrenders the item.
   * @param item The item to render.
   * @example
   * const unrenderItem = store.renderItem({ id: "item-1" });
   * // on cleanup
   * unrenderItem();
   */
  renderItem: BivariantCallback<(item: T) => () => void>;
  /**
   * Gets an item by its id.
   * @param id The id of the item.
   * @example
   * const item = store.item("item-1");
   */
  item: (id: string | null | undefined) => T | null;
}

export interface CollectionStoreOptions<T extends Item = Item>
  extends StoreOptions<CollectionStoreState<T>, "items"> {
  /**
   * The defaut value for the `items` state.
   * @default []
   */
  defaultItems?: CollectionStoreState<T>["items"];
}

export interface CollectionStoreProps<T extends Item = Item>
  extends CollectionStoreOptions<T>,
    StoreProps<CollectionStoreState<T>> {}

export interface CollectionStore<T extends Item = Item>
  extends CollectionStoreFunctions<T>,
    Store<CollectionStoreState<T>> {}
