import {
  batch,
  createStore,
  init,
  setup,
  sync,
  throwOnConflictingProps,
} from "@ariakit/store";
import type { Store, StoreOptions, StoreProps } from "@ariakit/store";
import {
  getDocument,
  sortBasedOnDOMPosition,
  chain,
  defaultValue,
  shallowEqual,
} from "@ariakit/utils";
import type { BivariantCallback } from "@ariakit/utils";

function getCommonParent(items: CollectionStoreItem[]) {
  const firstItem = items.find((item) => !!item.element);
  const lastElement = [...items]
    .reverse()
    .find((item) => !!item.element)?.element;
  let parentElement = firstItem?.element?.parentElement;
  if (!lastElement) {
    return getDocument(parentElement).body;
  }
  while (parentElement) {
    const parent = parentElement;
    if (parent.contains(lastElement)) {
      return parentElement;
    }
    parentElement = parentElement.parentElement;
  }
  return getDocument(parentElement).body;
}

function getPrivateStore<T extends CollectionStoreItem>(
  store?: Store & {
    __unstablePrivateStore?: Store<{
      renderedItems: T[];
    }>;
  },
) {
  return store?.__unstablePrivateStore;
}

function getItemsById<T extends CollectionStoreItem>(items: T[]) {
  const itemsById = new Map<string, T>();
  for (const item of items) {
    itemsById.set(item.id, item);
  }
  return itemsById;
}

function mergeItems<T extends CollectionStoreItem>(
  items: T[],
  stateItems: T[],
) {
  const itemsById = getItemsById(items);
  const stateItemsById = getItemsById(stateItems);

  let nextItems: T[] | undefined;
  let index = 0;

  for (const item of items) {
    const stateItem = stateItemsById.get(item.id);
    const nextItem = stateItem ? mergeItemMetadata(item, stateItem) : item;
    if (nextItem !== item) {
      nextItems ??= items.slice(0, index);
    }
    nextItems?.push(nextItem);
    index += 1;
  }

  for (const stateItem of stateItems) {
    if (itemsById.has(stateItem.id)) continue;
    nextItems ??= items.slice();
    nextItems.push(stateItem);
  }

  return nextItems || items;
}

function mergeItemsByState<T extends CollectionStoreItem>(
  items: T[],
  stateItems: T[],
) {
  const itemsById = getItemsById(items);
  const nextItems: T[] = [];
  let hasChanges = items.length !== stateItems.length;
  let index = 0;

  for (const stateItem of stateItems) {
    const item = mergeItemMetadata(itemsById.get(stateItem.id), stateItem);
    nextItems.push(item);
    if (item !== items[index]) {
      hasChanges = true;
    }
    index += 1;
  }

  return hasChanges ? nextItems : items;
}

function mergeItemMetadata<T extends CollectionStoreItem>(
  item: T | undefined,
  nextItem: T,
): T;
function mergeItemMetadata<T extends CollectionStoreItem>(
  item: T | undefined,
  nextItem?: T,
): T | undefined;
function mergeItemMetadata<T extends CollectionStoreItem>(
  item: T | undefined,
  nextItem?: T,
) {
  if (!nextItem) return;
  if (!item) {
    return nextItem;
  }
  if (nextItem.element !== undefined) {
    return nextItem;
  }
  const { element } = item;
  if (element == null) {
    return nextItem;
  }
  const mergedItem = { ...nextItem, element };
  if (shallowEqual(mergedItem, item)) {
    return item;
  }
  return mergedItem;
}

interface MergeItemWithStoreParams<T extends CollectionStoreItem> {
  item: T;
  setItems: (getItems: (items: T[]) => T[]) => void;
  canDeleteFromMap?: boolean;
  getItemsBeforeMount?: (items: T[]) => T[];
  getItemsBeforeUnmount?: (items: T[]) => T[];
  getRestoredItem?: (item?: T) => T | undefined;
}

/**
 * Creates a collection store.
 */
export function createCollectionStore<
  T extends CollectionStoreItem = CollectionStoreItem,
>(props: CollectionStoreProps<T> = {}): CollectionStore<T> {
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

  const syncPrivateStore = getPrivateStore<T>(props.store);

  const privateStore = createStore(
    { items, renderedItems: initialState.renderedItems },
    syncPrivateStore,
  );

  const collection = createStore(initialState, props.store);
  let publishedItems = collection.getState().items;
  let publishedItemsFromState = false;
  let pendingItemsBase = publishedItems;
  let pendingItemsFromState = false;

  sync(collection, ["items"], (state) => {
    const privateItems = new Map(
      privateStore.getState().items.map((item) => [item.id, item]),
    );
    itemsMap.clear();
    for (const item of state.items) {
      itemsMap.set(item.id, mergeItemMetadata(privateItems.get(item.id), item));
    }
  });

  const sortItems = (renderedItems: T[]) => {
    const sortedItems = sortBasedOnDOMPosition(renderedItems, (i) => i.element);
    privateStore.setState("renderedItems", sortedItems);
    collection.setState("renderedItems", sortedItems);
  };

  setup(collection, () => {
    privateStore.setState("items", (items) => {
      const stateItems = collection.getState().items;
      pendingItemsBase = stateItems;
      pendingItemsFromState = stateItems !== publishedItems;
      if (stateItems === publishedItems) {
        return mergeItems(items, stateItems);
      }
      return mergeItemsByState(items, stateItems);
    });
    return init(privateStore);
  });

  // Use the private store to register items and then batch the changes to the
  // public store so we don't trigger multiple updates on the store when adding
  // multiple items.
  setup(privateStore, () => {
    return batch(privateStore, ["items"], (state) => {
      const stateItems = collection.getState().items;
      const shouldPublishPrivateItems = stateItems === pendingItemsBase;
      const nextItems = shouldPublishPrivateItems
        ? state.items
        : mergeItemsByState(state.items, stateItems);
      const nextItemsFromState =
        pendingItemsFromState || !shouldPublishPrivateItems;
      if (nextItems !== state.items) {
        pendingItemsBase = nextItems;
        pendingItemsFromState = true;
        privateStore.setState("items", nextItems);
      }
      publishedItems = nextItems;
      publishedItemsFromState = nextItemsFromState;
      collection.setState("items", nextItems);
    });
  });

  setup(privateStore, () => {
    return batch(privateStore, ["renderedItems"], (state) => {
      let firstRun = true;

      let raf = requestAnimationFrame(() => {
        const { renderedItems } = collection.getState();
        // Bail out if the rendered items haven't changed. This is important
        // because the following lines can cause this function to be called
        // again.
        if (state.renderedItems === renderedItems) return;
        sortItems(state.renderedItems);
      });

      if (typeof IntersectionObserver !== "function") {
        return () => cancelAnimationFrame(raf);
      }

      const ioCallback: IntersectionObserverCallback = () => {
        if (firstRun) {
          // The IntersectionObserver callback is called synchronously the first
          // time. We just ignore it.
          firstRun = false;
          return;
        }
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => sortItems(state.renderedItems));
      };

      const root = getCommonParent(state.renderedItems);
      const observer = new IntersectionObserver(ioCallback, { root });

      for (const item of state.renderedItems) {
        if (!item.element) continue;
        observer.observe(item.element);
      }

      return () => {
        cancelAnimationFrame(raf);
        observer.disconnect();
      };
    });
  });

  const mergeItemWithStore = ({
    item,
    setItems,
    canDeleteFromMap = false,
    getItemsBeforeMount,
    getItemsBeforeUnmount,
    getRestoredItem,
  }: MergeItemWithStoreParams<T>) => {
    let prevItem: T | undefined;
    setItems((items) => {
      items = getItemsBeforeMount?.(items) || items;
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
        items = getItemsBeforeUnmount?.(items) || items;
        if (!prevItem) {
          const restoredItem = getRestoredItem?.();
          if (restoredItem) {
            const index = items.findIndex(({ id }) => id === item.id);
            if (index !== -1) {
              const nextItems = items.slice();
              nextItems[index] = restoredItem;
              itemsMap.set(item.id, restoredItem);
              return nextItems;
            }
          }
          if (canDeleteFromMap) {
            itemsMap.delete(item.id);
          }
          return items.filter(({ id }) => id !== item.id);
        }
        const index = items.findIndex(({ id }) => id === item.id);
        if (index === -1) {
          if (canDeleteFromMap) {
            itemsMap.delete(item.id);
          }
          return items;
        }
        const restoredItem = getRestoredItem
          ? getRestoredItem(prevItem)
          : prevItem;
        if (!restoredItem) {
          if (canDeleteFromMap) {
            itemsMap.delete(item.id);
          }
          return items.filter(({ id }) => id !== item.id);
        }
        const nextItems = items.slice();
        nextItems[index] = restoredItem;
        itemsMap.set(item.id, restoredItem);
        return nextItems;
      });
    };
    return unmergeItem;
  };

  const registerItem: CollectionStore<T>["registerItem"] = (item) => {
    let registeredItems: T[] | undefined;
    return mergeItemWithStore({
      item,
      setItems: (getItems) =>
        privateStore.setState("items", (items) => {
          pendingItemsBase = collection.getState().items;
          pendingItemsFromState = false;
          const nextItems = getItems(items);
          registeredItems = nextItems;
          return nextItems;
        }),
      canDeleteFromMap: true,
      getItemsBeforeMount: (items) => {
        const stateItems = collection.getState().items;
        if (stateItems === publishedItems) {
          return mergeItems(items, stateItems);
        }
        return mergeItemsByState(items, stateItems);
      },
      getItemsBeforeUnmount: (items) => {
        const stateItems = collection.getState().items;
        if (stateItems === registeredItems) {
          return items;
        }
        if (stateItems === publishedItems && !publishedItemsFromState) {
          return items;
        }
        return mergeItemsByState(items, stateItems);
      },
      getRestoredItem: (prevItem) => {
        const { items } = collection.getState();
        if (items === registeredItems) {
          return prevItem;
        }
        if (items === publishedItems && !publishedItemsFromState) {
          return prevItem;
        }
        const stateItem = items.find(({ id }) => id === item.id);
        return stateItem;
      },
    });
  };

  return {
    ...collection,

    registerItem,
    renderItem: (item) =>
      chain(
        registerItem(item),
        mergeItemWithStore({
          item,
          setItems: (getItems) =>
            privateStore.setState("renderedItems", getItems),
        }),
      ),

    item: (id) => {
      if (!id) return null;
      let item = itemsMap.get(id);
      const stateItems = collection.getState().items;
      const stateItem = stateItems.find((item) => item.id === id);
      if (stateItem) {
        item = mergeItemMetadata(item, stateItem);
        if (item) {
          itemsMap.set(id, item);
        }
        return item || null;
      }
      if (
        stateItems === pendingItemsBase ||
        (stateItems === publishedItems && !publishedItemsFromState)
      ) {
        return item || null;
      }
      return null;
    },

    // @ts-expect-error Internal
    __unstablePrivateStore: privateStore,
  };
}

export interface CollectionStoreItem {
  /**
   * The id of the item.
   */
  id: string;
  /**
   * The item HTML element. This is automatically set when the item is rendered.
   */
  element?: HTMLElement | null;
}

export interface CollectionStoreState<
  T extends CollectionStoreItem = CollectionStoreItem,
> {
  /**
   * Lists all items along with their metadata. This state is automatically
   * updated when an item is registered or unregistered using the
   * [`registerItem`](https://ariakit.com/reference/use-collection-store#registeritem)
   * function.
   *
   * Live examples:
   * - [Command Menu with
   *   Tabs](https://ariakit.com/examples/dialog-combobox-tab-command-menu)
   */
  items: T[];
  /**
   * Lists all items, along with their metadata, in the exact order they appear in
   * the DOM. This state is automatically updated when an item is rendered or
   * unmounted using the
   * [`renderItem`](https://ariakit.com/reference/use-collection-store#renderitem)
   * function.
   */
  renderedItems: T[];
}

export interface CollectionStoreFunctions<
  T extends CollectionStoreItem = CollectionStoreItem,
> {
  /**
   * Registers an item in the collection. This function returns a cleanup
   * function that unregisters the item.
   * @example
   * const unregisterItem = store.registerItem({ id: "item-1" });
   * // on cleanup
   * unregisterItem();
   */
  registerItem: BivariantCallback<(item: T) => () => void>;
  /**
   * Renders an item in the collection. This function returns a cleanup function
   * that unmounts the item.
   * @example
   * const unrenderItem = store.renderItem({ id: "item-1" });
   * // on cleanup
   * unrenderItem();
   */
  renderItem: BivariantCallback<(item: T) => () => void>;
  /**
   * Gets an item by its id.
   *
   * Live examples:
   * - [Animated TabPanel](https://ariakit.com/examples/tab-panel-animated)
   * @example
   * const item = store.item("item-1");
   */
  item: (id: string | null | undefined) => T | null;
}

export interface CollectionStoreOptions<
  T extends CollectionStoreItem = CollectionStoreItem,
> extends StoreOptions<CollectionStoreState<T>, "items"> {
  /**
   * The defaut value for the
   * [`items`](https://ariakit.com/reference/collection-provider#items) state.
   * @default []
   */
  defaultItems?: CollectionStoreState<T>["items"];
}

export interface CollectionStoreProps<
  T extends CollectionStoreItem = CollectionStoreItem,
>
  extends CollectionStoreOptions<T>, StoreProps<CollectionStoreState<T>> {}

export interface CollectionStore<
  T extends CollectionStoreItem = CollectionStoreItem,
>
  extends CollectionStoreFunctions<T>, Store<CollectionStoreState<T>> {}
