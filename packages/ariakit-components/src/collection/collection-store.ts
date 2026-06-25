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
  hasOwnProperty,
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

function areItemsEqual<T extends CollectionStoreItem>(
  items: T[],
  nextItems: T[],
) {
  if (items === nextItems) {
    return true;
  }
  if (items.length !== nextItems.length) {
    return false;
  }
  return items.every((item, index) => shallowEqual(item, nextItems[index]));
}

function mergeMissingItemMetadata<T extends CollectionStoreItem>(
  item: T | undefined,
  nextItem: T,
) {
  if (!item) {
    return nextItem;
  }
  let mergedItem: T | undefined;

  for (const key in item) {
    if (!hasOwnProperty(item, key)) continue;
    if (key === "id") continue;
    if (hasOwnProperty(nextItem, key)) continue;
    mergedItem ??= { ...nextItem };
    mergedItem[key] = item[key];
  }

  return mergedItem || nextItem;
}

interface MergeItemMetadataParams<T extends CollectionStoreItem> {
  item: T | undefined;
  nextItem: T;
  renderedItem?: T;
  currentItem?: T;
}

function mergeItemMetadata<T extends CollectionStoreItem>({
  item,
  nextItem,
  renderedItem,
  currentItem,
}: MergeItemMetadataParams<T>) {
  let mergedItem = nextItem;
  if (nextItem.element === undefined) {
    const element = item?.element;
    if (element != null) {
      mergedItem = { ...nextItem, element };
    }
  }
  mergedItem = mergeMissingItemMetadata(renderedItem, mergedItem);
  if (currentItem && shallowEqual(mergedItem, currentItem)) {
    return currentItem;
  }
  if (shallowEqual(mergedItem, nextItem)) {
    return nextItem;
  }
  return mergedItem;
}

function mergeItemWithPrivateMetadata<T extends CollectionStoreItem>(
  item: T,
  stateItem: T,
) {
  const mergedItem = { ...stateItem, ...item };
  if (shallowEqual(mergedItem, item)) {
    return item;
  }
  return mergedItem;
}

function mergeItemsFromPrivate<T extends CollectionStoreItem>(
  items: T[],
  stateItems: T[],
) {
  const itemsById = getItemsById(items);
  const stateItemsById = getItemsById(stateItems);

  let nextItems: T[] | undefined;
  let index = 0;

  for (const item of items) {
    const stateItem = stateItemsById.get(item.id);
    const nextItem = stateItem
      ? mergeItemWithPrivateMetadata(item, stateItem)
      : item;
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

interface MergeItemsFromStateParams<T extends CollectionStoreItem> {
  items: T[];
  stateItems: T[];
  renderedItems?: T[];
  preserveId?: string;
}

function mergeItemsFromState<T extends CollectionStoreItem>({
  items,
  stateItems,
  renderedItems = [],
  preserveId,
}: MergeItemsFromStateParams<T>) {
  const itemsById = getItemsById(items);
  const renderedItemsById = getItemsById(renderedItems);
  const stateItemsById = getItemsById(stateItems);
  const nextItems: T[] = [];
  let hasChanges = items.length !== stateItems.length;
  let index = 0;

  for (const stateItem of stateItems) {
    const currentItem = items[index];
    const item = mergeItemMetadata({
      item: itemsById.get(stateItem.id),
      nextItem: stateItem,
      renderedItem: renderedItemsById.get(stateItem.id),
      currentItem,
    });
    nextItems.push(item);
    if (item !== currentItem) {
      hasChanges = true;
    }
    index += 1;
  }

  if (preserveId && !stateItemsById.has(preserveId)) {
    const item = itemsById.get(preserveId);
    if (item && !nextItems.includes(item)) {
      nextItems.push(item);
      if (item !== items[index]) {
        hasChanges = true;
      }
    }
  }

  return hasChanges ? nextItems : items;
}

interface MergeItemWithStoreParams<T extends CollectionStoreItem> {
  item: T;
  setItems: (getItems: (items: T[]) => T[]) => void;
  syncItemsMap?: (items: T[]) => void;
  canDeleteFromMap?: boolean;
  getItemsBeforeMount?: (items: T[], item: T) => T[];
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
  let itemsVersion = 0;
  let publishedItemsVersion = 0;
  let pendingItemsVersion = 0;
  let privateItemsPending = false;
  let publishingPrivateItems = false;
  let publicItemsFromPrivate = true;

  const setItemsMap = (items: T[]) => {
    itemsMap.clear();
    for (const item of items) {
      itemsMap.set(item.id, item);
    }
  };

  const isPublicStateCurrent = () =>
    publicItemsFromPrivate && itemsVersion === publishedItemsVersion;

  const updateItemsMap = ({
    items = privateStore.getState().items,
    renderedItems = privateStore.getState().renderedItems,
    includePrivateItems = false,
  } = {}) => {
    const stateItems = collection.getState().items;
    const nextItems = mergeItemsFromState({
      items,
      stateItems,
      renderedItems,
    });
    setItemsMap(nextItems);
    if (!includePrivateItems) return;
    if (!publishingPrivateItems && itemsVersion !== pendingItemsVersion) return;
    const stateItemsById = getItemsById(stateItems);
    for (const item of items) {
      if (stateItemsById.has(item.id)) continue;
      itemsMap.set(item.id, item);
    }
    if (!publicItemsFromPrivate) return;
    for (const item of renderedItems) {
      if (stateItemsById.has(item.id)) continue;
      if (itemsMap.has(item.id)) continue;
      if (item.element && !item.element.isConnected) continue;
      itemsMap.set(item.id, item);
    }
  };

  sync(collection, ["items"], (state, prevState) => {
    if (state.items !== prevState.items) {
      itemsVersion += 1;
      if (!publishingPrivateItems) {
        const itemsFromPrivate =
          !privateItemsPending && areItemsEqual(state.items, publishedItems);
        publicItemsFromPrivate = itemsFromPrivate;
        if (itemsFromPrivate) {
          publishedItems = state.items;
          publishedItemsVersion = itemsVersion;
        }
      }
    }
    updateItemsMap({ includePrivateItems: publishingPrivateItems });
  });

  const sortItems = (renderedItems: T[]) => {
    const sortedItems = sortBasedOnDOMPosition(renderedItems, (i) => i.element);
    privateStore.setState("renderedItems", sortedItems);
    collection.setState("renderedItems", sortedItems);
  };

  setup(collection, () => {
    privateStore.setState("items", (items) => {
      const stateItems = collection.getState().items;
      const { renderedItems } = privateStore.getState();
      pendingItemsVersion = itemsVersion;
      if (isPublicStateCurrent()) {
        return mergeItemsFromPrivate(items, stateItems);
      }
      return mergeItemsFromState({ items, stateItems, renderedItems });
    });
    return init(privateStore);
  });

  // Use the private store to register items and then batch the changes to the
  // public store so we don't trigger multiple updates on the store when adding
  // multiple items.
  setup(privateStore, () => {
    return batch(privateStore, ["items"], (state) => {
      const stateItems = collection.getState().items;
      if (itemsVersion !== pendingItemsVersion) {
        const nextItems = mergeItemsFromState({
          items: state.items,
          stateItems,
          renderedItems: privateStore.getState().renderedItems,
        });
        pendingItemsVersion = -1;
        privateItemsPending = false;
        if (nextItems !== state.items) {
          privateStore.setState("items", nextItems);
          updateItemsMap({ items: nextItems });
        }
        return;
      }
      try {
        publishingPrivateItems = true;
        collection.setState("items", state.items);
        publishedItems = state.items;
        publishedItemsVersion = itemsVersion;
        privateItemsPending = false;
        publicItemsFromPrivate = true;
      } finally {
        publishingPrivateItems = false;
      }
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
    syncItemsMap,
    canDeleteFromMap = false,
    getItemsBeforeMount,
    getItemsBeforeUnmount,
    getRestoredItem,
  }: MergeItemWithStoreParams<T>) => {
    let prevItem: T | undefined;
    setItems((items) => {
      items = getItemsBeforeMount?.(items, item) || items;
      const index = items.findIndex(({ id }) => id === item.id);
      const nextItems = items.slice();
      if (index !== -1) {
        prevItem = items[index];
        const nextItem = { ...prevItem, ...item };
        nextItems[index] = nextItem;
      } else {
        nextItems.push(item);
      }
      syncItemsMap?.(nextItems);
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
              syncItemsMap?.(nextItems);
              return nextItems;
            }
          }
          if (canDeleteFromMap && !syncItemsMap) {
            itemsMap.delete(item.id);
          }
          const nextItems = items.filter(({ id }) => id !== item.id);
          syncItemsMap?.(nextItems);
          return nextItems;
        }
        const index = items.findIndex(({ id }) => id === item.id);
        if (index === -1) {
          if (canDeleteFromMap && !syncItemsMap) {
            itemsMap.delete(item.id);
          }
          syncItemsMap?.(items);
          return items;
        }
        const restoredItem = getRestoredItem
          ? getRestoredItem(prevItem)
          : prevItem;
        if (!restoredItem) {
          if (canDeleteFromMap && !syncItemsMap) {
            itemsMap.delete(item.id);
          }
          const nextItems = items.filter(({ id }) => id !== item.id);
          syncItemsMap?.(nextItems);
          return nextItems;
        }
        const nextItems = items.slice();
        nextItems[index] = restoredItem;
        syncItemsMap?.(nextItems);
        return nextItems;
      });
    };
    return unmergeItem;
  };

  const registerItem: CollectionStore<T>["registerItem"] = (item) => {
    return mergeItemWithStore({
      item,
      setItems: (getItems) =>
        privateStore.setState("items", (items) => {
          pendingItemsVersion = itemsVersion;
          const nextItems = getItems(items);
          privateItemsPending = nextItems !== items;
          return nextItems;
        }),
      syncItemsMap: (items) =>
        updateItemsMap({ items, includePrivateItems: true }),
      canDeleteFromMap: true,
      getItemsBeforeMount: (items) => {
        const stateItems = collection.getState().items;
        if (isPublicStateCurrent() && !privateItemsPending) {
          return mergeItemsFromPrivate(items, stateItems);
        }
        if (isPublicStateCurrent()) {
          return items;
        }
        const { renderedItems } = privateStore.getState();
        return mergeItemsFromState({
          items,
          stateItems,
          renderedItems,
          preserveId: item.id,
        });
      },
      getItemsBeforeUnmount: (items) => {
        const stateItems = collection.getState().items;
        if (isPublicStateCurrent() && !privateItemsPending) {
          return mergeItemsFromPrivate(items, stateItems);
        }
        if (isPublicStateCurrent()) {
          return items;
        }
        const { renderedItems } = privateStore.getState();
        return mergeItemsFromState({ items, stateItems, renderedItems });
      },
      getRestoredItem: (prevItem) => {
        if (isPublicStateCurrent()) {
          return prevItem;
        }
        const { items } = collection.getState();
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
          syncItemsMap: (renderedItems) =>
            updateItemsMap({ renderedItems, includePrivateItems: true }),
        }),
      ),

    item: (id) => {
      if (!id) return null;
      const item = itemsMap.get(id);
      return item || null;
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
