import { getDocument } from "ariakit-utils/dom";
import { chain } from "ariakit-utils/misc";
import { Store, createStore } from "ariakit-utils/store";
import { BivariantCallback, SetState } from "ariakit-utils/types";

type Item = {
  id: string;
  element?: HTMLElement | null;
};

function isElementPreceding(a: Element, b: Element) {
  return Boolean(
    b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING
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

export function createCollectionStore<T extends Item = Item>({
  items = [],
}: CollectionStoreProps<T> = {}): CollectionStore<T> {
  const privateStore = createStore({ renderedItems: [] as T[] });
  const store = createStore<CollectionStoreState<T>>({
    items,
    renderedItems: [],
  });

  const setup = () => {
    return chain(
      () => {
        // istanbul ignore else: JSDOM doesn't support IntersectionObverser
        // See https://github.com/jsdom/jsdom/issues/2032
        if (typeof IntersectionObserver === "function") return;
        const timeout = setInterval(
          () =>
            store.setState(
              "renderedItems",
              sortBasedOnDOMPosition(privateStore.getState().renderedItems)
            ),
          50
        );
        return () => clearInterval(timeout);
      },
      privateStore.subscribe(
        (state) => {
          if (typeof IntersectionObserver !== "function") return;
          let raf = 0;
          const callback = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
              store.setState(
                "renderedItems",
                sortBasedOnDOMPosition(state.renderedItems)
              );
            });
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

  const setItems: CollectionStore<T>["setItems"] = (value) =>
    store.setState("items", value);

  const setRenderedItems: CollectionStore<T>["setRenderedItems"] = (value) =>
    store.setState("renderedItems", value);

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

  const renderItem: CollectionStore<T>["renderItem"] = (item) =>
    chain(
      registerItem(item),
      mergeItem(item, (getItems) =>
        privateStore.setState("renderedItems", getItems)
      )
    );

  const cache: { id: string | null; items: T[]; item: T | null } = {
    id: null,
    item: null,
    items,
  };

  const item: CollectionStore<T>["item"] = (id) => {
    if (!id) return null;
    const { items } = store.getState();
    if (cache.id === id && cache.items === items) {
      return cache.item;
    }
    const item = items.find((item) => item.id === id);
    cache.id = id;
    cache.items = items;
    cache.item = item || null;
    return cache.item;
  };

  return {
    ...store,
    setup,
    setItems,
    setRenderedItems,
    registerItem,
    renderItem,
    item,
  };
}

export type CollectionStoreState<T extends Item = Item> = {
  /**
   * Lists all the items with their `ref`s. This state is automatically updated
   * when an item is registered or unregistered with the `registerItem`
   * function. The order of the items is automatically defined by the order of
   * the elements in the DOM.
   */
  items: T[];
  renderedItems: T[];
};

export type CollectionStore<T extends Item = Item> = Store<
  CollectionStoreState<T>
> & {
  setItems: SetState<CollectionStoreState<T>["items"]>;
  setRenderedItems: SetState<CollectionStoreState<T>["renderedItems"]>;
  registerItem: BivariantCallback<(item: T) => () => void>;
  renderItem: BivariantCallback<(item: T) => () => void>;
  item: (id: string | null | undefined) => T | null;
};

export type CollectionStoreProps<T extends Item = Item> = Partial<
  Pick<CollectionStoreState<T>, "items">
>;
