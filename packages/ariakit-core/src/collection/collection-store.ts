import { getDocument } from "../utils/dom";
import { chain } from "../utils/misc";
import { PartialStore, Store, createStore } from "../utils/store";
import { BivariantCallback, SetState } from "../utils/types";

function isElementPreceding(a: Element, b: Element) {
  return Boolean(
    b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING
  );
}

function sortBasedOnDOMPosition<T extends CollectionStoreItem>(items: T[]) {
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

function getCommonParent(items: CollectionStoreItem[]) {
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

export function createCollectionStore<
  T extends CollectionStoreItem = CollectionStoreItem
>({
  items = [],
  ...partialStore
}: CollectionStoreProps<T> = {}): CollectionStore<T> {
  const initialState: CollectionStoreState<T> = {
    ...partialStore?.getState?.(),
    items,
    renderedItems: [],
  };
  const store = createStore(initialState, partialStore);
  const privateStore = createStore({
    renderedItems: initialState.renderedItems,
  });

  const sortItems = () => {
    const state = privateStore.getState();
    const renderedItems = sortBasedOnDOMPosition(state.renderedItems);
    privateStore.setState("renderedItems", renderedItems);
    store.setState("renderedItems", renderedItems);
  };

  const setup = () => {
    return chain(
      store.setup(),
      privateStore.batchSync(
        (state) => {
          let firstRun = true;
          let raf = 0;
          raf = requestAnimationFrame(sortItems);
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
            if (item.element) {
              observer.observe(item.element);
            }
          });
          return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
          };
        },
        ["renderedItems"]
      )
    );
  };

  const mergeItem = (
    item: T,
    setItems: (getItems: (items: T[]) => T[]) => void
  ) => {
    let prevItem: T | undefined;
    let index: number | undefined;
    setItems((items) => {
      prevItem = items.find(({ id }) => id === item.id);
      const nextItems = items.slice();
      if (prevItem) {
        index = nextItems.indexOf(prevItem);
        const nextItem = { ...prevItem, ...item };
        nextItems[index] = nextItem;
      } else {
        nextItems.push(item);
      }
      return nextItems;
    });
    const unregisterItem = () => {
      setItems((items) => {
        if (!prevItem) {
          return items.filter(({ id }) => id !== item.id);
        }
        if (index == null || index < 0) return items;
        const nextItems = items.slice();
        nextItems[index] = prevItem;
        return nextItems;
      });
    };
    return unregisterItem;
  };

  const registerItem: CollectionStore<T>["registerItem"] = (item) =>
    mergeItem(item, (getItems) => store.setState("items", getItems));

  const itemCache: { id: string | null; items: T[]; item: T | null } = {
    id: null,
    item: null,
    items,
  };

  return {
    ...store,
    setup,

    setItems: (value) => store.setState("items", value),

    setRenderedItems: (value) => store.setState("renderedItems", value),

    registerItem,
    renderItem: (item) =>
      chain(
        registerItem(item),
        mergeItem(item, (getItems) =>
          privateStore.setState("renderedItems", getItems)
        )
      ),

    item: (id) => {
      if (!id) return null;
      const { items } = store.getState();
      if (itemCache.id === id && itemCache.items === items) {
        return itemCache.item;
      }
      const item = items.find((item) => item.id === id);
      itemCache.id = id;
      itemCache.items = items;
      itemCache.item = item || null;
      return itemCache.item;
    },
  };
}

export type CollectionStoreItem = {
  id: string;
  element?: HTMLElement | null;
};

export type CollectionStoreState<
  T extends CollectionStoreItem = CollectionStoreItem
> = {
  items: T[];
  renderedItems: T[];
};

export type CollectionStore<
  T extends CollectionStoreItem = CollectionStoreItem
> = Store<CollectionStoreState<T>> & {
  setItems: SetState<CollectionStoreState<T>["items"]>;
  setRenderedItems: SetState<CollectionStoreState<T>["renderedItems"]>;
  registerItem: BivariantCallback<(item: T) => () => void>;
  renderItem: BivariantCallback<(item: T) => () => void>;
  item: (id: string | null | undefined) => T | null;
};

export type CollectionStoreProps<
  T extends CollectionStoreItem = CollectionStoreItem
> = PartialStore<CollectionStoreState<T>> &
  Partial<Pick<CollectionStoreState<T>, "items">>;
