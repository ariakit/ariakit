import {
  batch,
  createStore,
  init,
  setup,
  throwOnConflictingProps,
} from "@ariakit/store";
import type { Store, StoreOptions, StoreProps } from "@ariakit/store";
import {
  getDocument,
  sortBasedOnDOMPosition,
  chain,
  defaultValue,
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

const itemIdCacheThreshold = 64;

interface ItemIdCache<T extends CollectionStoreItem> {
  items?: T[];
  ids?: Set<string>;
}

// Cache IDs only for large immutable state arrays so repeated registrations can
// skip O(n) absence scans. Replacing the array invalidates the cache. Existing
// IDs still use findIndex to preserve their position and previous value.
function getCachedItemIds<T extends CollectionStoreItem>(
  items: T[],
  cache: ItemIdCache<T>,
) {
  if (items.length < itemIdCacheThreshold) {
    if (cache.ids) {
      cache.items = undefined;
      cache.ids = undefined;
    }
    return;
  }
  if (cache.items === items) {
    return cache.ids;
  }
  const ids = new Set<string>();
  for (const item of items) {
    ids.add(item.id);
  }
  cache.items = items;
  cache.ids = ids;
  return ids;
}

function setCachedItemIds<T extends CollectionStoreItem>(
  items: T[],
  cache: ItemIdCache<T>,
  ids?: Set<string>,
) {
  if (items.length < itemIdCacheThreshold) {
    if (cache.ids) {
      cache.items = undefined;
      cache.ids = undefined;
    }
    return;
  }
  if (!ids) {
    ids = new Set<string>();
    for (const item of items) {
      ids.add(item.id);
    }
  }
  cache.items = items;
  cache.ids = ids;
}

type SetItems<T extends CollectionStoreItem> = (
  getItems: (items: T[]) => T[],
) => void;

interface MergeItemOptions<T extends CollectionStoreItem> {
  cache: ItemIdCache<T>;
  setItems: SetItems<T>;
  canDeleteFromMap?: boolean;
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
  // These arrays are replaced independently, so each needs its own cache.
  const itemIdCache: ItemIdCache<T> = {};
  const renderedItemIdCache: ItemIdCache<T> = {};

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

  const sortItems = (renderedItems: T[]) => {
    const sortedItems = sortBasedOnDOMPosition(renderedItems, (i) => i.element);
    privateStore.setState("renderedItems", sortedItems);
    collection.setState("renderedItems", sortedItems);
  };

  setup(collection, () => init(privateStore));

  // Use the private store to register items and then batch the changes to the
  // public store so we don't trigger multiple updates on the store when adding
  // multiple items.
  setup(privateStore, () => {
    return batch(privateStore, ["items"], (state) => {
      collection.setState("items", state.items);
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

  const mergeItem = (
    item: T,
    { cache, setItems, canDeleteFromMap = false }: MergeItemOptions<T>,
  ) => {
    let prevItem: T | undefined;
    setItems((items) => {
      const shouldUseCache =
        !!cache.ids ||
        (items.length >= itemIdCacheThreshold &&
          (!canDeleteFromMap || !itemsMap.has(item.id)));
      const ids = shouldUseCache ? getCachedItemIds(items, cache) : undefined;
      const index =
        ids && !ids.has(item.id)
          ? -1
          : items.findIndex(({ id }) => id === item.id);
      const nextItems = items.slice();
      if (index !== -1) {
        prevItem = items[index];
        const nextItem = { ...prevItem, ...item };
        nextItems[index] = nextItem;
        itemsMap.set(item.id, nextItem);
      } else {
        nextItems.push(item);
        itemsMap.set(item.id, item);
        ids?.add(item.id);
      }
      if (
        cache.ids ||
        (index === -1 && nextItems.length >= itemIdCacheThreshold)
      ) {
        setCachedItemIds(nextItems, cache, ids);
      }
      return nextItems;
    });
    const unmergeItem = () => {
      setItems((items) => {
        const ids = cache.ids ? getCachedItemIds(items, cache) : undefined;
        if (!prevItem) {
          if (canDeleteFromMap) {
            itemsMap.delete(item.id);
          }
          const nextItems = items.filter(({ id }) => id !== item.id);
          ids?.delete(item.id);
          if (cache.ids) {
            setCachedItemIds(nextItems, cache, ids);
          }
          return nextItems;
        }
        const index = items.findIndex(({ id }) => id === item.id);
        if (index === -1) {
          return items;
        }
        const nextItems = items.slice();
        nextItems[index] = prevItem;
        itemsMap.set(item.id, prevItem);
        if (cache.ids) {
          setCachedItemIds(nextItems, cache, ids);
        }
        return nextItems;
      });
    };
    return unmergeItem;
  };

  const setItems: SetItems<T> = (getItems) =>
    privateStore.setState("items", getItems);

  const setRenderedItems: SetItems<T> = (getItems) =>
    privateStore.setState("renderedItems", getItems);

  const itemMergeOptions: MergeItemOptions<T> = {
    cache: itemIdCache,
    setItems,
    canDeleteFromMap: true,
  };

  const renderedItemMergeOptions: MergeItemOptions<T> = {
    cache: renderedItemIdCache,
    setItems: setRenderedItems,
  };

  const registerItem: CollectionStore<T>["registerItem"] = (item) =>
    mergeItem(item, itemMergeOptions);

  return {
    ...collection,

    registerItem,
    renderItem: (item) =>
      chain(registerItem(item), mergeItem(item, renderedItemMergeOptions)),

    item: (id) => {
      if (!id) return null;
      let item = itemsMap.get(id);
      if (!item) {
        const { items } = privateStore.getState();
        item = items.find((item) => item.id === id);
        if (item) {
          itemsMap.set(id, item);
        }
      }
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
   * The default value for the
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
