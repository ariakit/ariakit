import type {
  CSSProperties,
  ComponentPropsWithRef,
  ReactElement,
  ReactNode,
  RefCallback,
} from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getScrollingElement, getWindow } from "@ariakit/core/utils/dom";
import { chain, invariant } from "@ariakit/core/utils/misc";
import type { AnyObject, EmptyObject } from "@ariakit/core/utils/types";
import { flushSync } from "react-dom";
import {
  useForceUpdate,
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
} from "../utils/hooks.js";
import { useStoreState } from "../utils/store.js";
import { createElement } from "../utils/system.jsx";
import type { RenderProp } from "../utils/types.js";
import { CollectionContext } from "./collection-context.js";
import type {
  CollectionStore,
  CollectionStoreItem,
} from "./collection-store.js";

interface ItemObject
  extends AnyObject,
    Pick<CollectionItemsOptions, "gap" | "orientation"> {
  id?: string;
  element?: HTMLElement | null;
  style?: CSSProperties;
  items?: Item[];
}

type Item =
  | ItemObject
  | Omit<string, string>
  | Omit<number, string>
  | Omit<boolean, string>
  | null
  | undefined;

type Items<T extends Item = never> = number | readonly T[];

type Store<T extends Item = never> = CollectionStore<
  T extends CollectionStoreItem ? T : CollectionStoreItem
>;

interface BaseItemProps {
  id: string;
  ref: RefCallback<HTMLElement>;
  style: CSSProperties;
}

type ItemProps<T extends Item = never> = unknown extends T
  ? BaseItemProps
  : BaseItemProps & (T extends AnyObject ? T : { value: T });

type RawItemProps<T extends Item = never> = unknown extends T
  ? EmptyObject
  : T extends AnyObject
  ? T
  : { value: T };

interface DataItem {
  index: number;
  rendered: boolean;
  start: number;
  end: number;
}

type Data = Map<string, DataItem>;

type CollectionItemsContextProps = Pick<
  CollectionItemsOptions,
  "store" | "estimatedItemSize" | "gap" | "orientation" | "overscan"
>;

const CollectionItemsContext =
  createContext<CollectionItemsContextProps | null>(null);

function findNearestIndex<T extends Item = never>(
  items: Items<T>,
  target: number,
  getValue: (index: number) => number
) {
  let left = 0;
  let right = getItemsLength(items) - 1;
  while (left <= right) {
    const index = ((left + right) / 2) | 0;
    const value = getValue(index);
    if (value === target) return index;
    else if (value < target) left = index + 1;
    else right = index - 1;
  }
  if (left > 0) return left - 1;
  return null;
}

function getItemsLength<T extends Item>(items: Items<T>) {
  return typeof items === "number" ? items : items.length;
}

function getItemObject(item: Item): ItemObject {
  if (!item || typeof item !== "object") {
    return { value: item };
  }
  return item;
}

function getItemId(item: Item, index: number, baseId?: string) {
  invariant(baseId, "CollectionItems must be given an `id` prop.");
  const defaultId = `${baseId}/${index}`;
  return getItemObject(item).id ?? defaultId;
}

function getItem<T extends Item>(
  items: Items<T>,
  index: number
): RawItemProps<T> {
  if (typeof items === "number") return {} as RawItemProps<T>;
  const item = items[index];
  invariant(item, `Couldn't find item at index ${index}`);
  if (typeof item === "object") return item as RawItemProps<T>;
  return { value: item } as unknown as RawItemProps<T>;
}

function getItemSize(
  item: Item,
  horizontal: boolean,
  fallbackElement?: HTMLElement | null | false
): number {
  const itemObject = getItemObject(item);
  horizontal = itemObject.orientation === "horizontal" ?? horizontal;
  const prop = horizontal ? "width" : "height";
  const style = itemObject.style;
  if (style) {
    const size = style[prop];
    if (typeof size === "number") return size;
  }
  const element = itemObject.element || fallbackElement;
  if (element && element.isConnected) {
    return element.getBoundingClientRect()[prop];
  }
  const items = itemObject.items;
  if (items?.length) {
    const initialSize = (itemObject.gap ?? 0) * (items.length - 1);
    return items.reduce<number>(
      (sum, item) => sum + getItemSize(item, horizontal),
      initialSize
    );
  }
  return 0;
}

function getAverageSize<T extends Item>(props: {
  baseId: string;
  data: Data;
  items: Items<T>;
  elements: Map<string, HTMLElement>;
  estimatedItemSize: number;
  horizontal: boolean;
}) {
  const length = getItemsLength(props.items);
  let currentIndex = 0;
  let averageSize = props.estimatedItemSize;

  const setAverageSize = (size: number) => {
    const prevIndex = currentIndex;
    currentIndex = currentIndex + 1;
    averageSize = (averageSize * prevIndex + size) / currentIndex;
  };

  for (let index = 0; index < length; index += 1) {
    const item = getItem(props.items, index);
    const itemId = getItemId(item, index, props.baseId);
    const itemData = props.data.get(itemId);
    const fallbackElement = props.elements.get(itemId);
    const size = getItemSize(item, props.horizontal, fallbackElement);
    if (size) {
      setAverageSize(size);
    } else if (itemData?.rendered) {
      setAverageSize(itemData.end - itemData.start);
    }
  }

  return averageSize;
}

function getOffset(
  element: HTMLElement,
  scrollingElement: Element,
  horizontal: boolean
): number {
  const win = getWindow(element);
  const htmlElement = win?.document.documentElement;
  if (scrollingElement === htmlElement) {
    const { left, top } = element.getBoundingClientRect();
    const { scrollX, scrollY } = win;
    if (horizontal) return scrollX + left;
    return scrollY + top;
  }
  const elementRect = element.getBoundingClientRect();
  const scrollingElmentRect = scrollingElement.getBoundingClientRect();
  const positionProp = horizontal ? "left" : "top";
  const scrollProp = horizontal ? "scrollLeft" : "scrollTop";
  return (
    elementRect[positionProp] -
    scrollingElmentRect[positionProp] +
    scrollingElement[scrollProp]
  );
}

function getScrollOffset(
  scrollingElement: Element,
  horizontal: boolean,
  end: number
) {
  const prop = horizontal ? "scrollLeft" : "scrollTop";
  let scrollOffset = scrollingElement[prop];
  const { flexDirection } = getComputedStyle(scrollingElement);
  if (flexDirection.endsWith("-reverse")) {
    scrollOffset = end + scrollOffset;
  }
  return scrollOffset;
}

function getViewport(scrollingElement: Element) {
  const { defaultView, documentElement } = scrollingElement.ownerDocument;
  if (scrollingElement === documentElement) {
    return defaultView;
  }
  return scrollingElement;
}

function getItemsEnd<T extends Item>(props: {
  baseId?: string;
  items: Items<T>;
  data: Data;
  gap: number;
  horizontal: boolean;
  itemSize?: number;
  estimatedItemSize: number;
  defaultEnd?: number;
}) {
  const length = getItemsLength(props.items);
  if (!length) return 0;
  const lastIndex = length - 1;
  const totalGap = lastIndex * props.gap;
  if (props.itemSize != null) {
    return length * props.itemSize + totalGap;
  }
  const defaultEnd =
    props.defaultEnd || length * props.estimatedItemSize + totalGap;
  if (!props.baseId) return defaultEnd;
  const lastItem = getItem(props.items, lastIndex);
  const lastItemId = getItemId(lastItem, lastIndex, props.baseId);
  const lastItemData = props.data.get(lastItemId);
  if (lastItemData?.end) return lastItemData.end;
  if (!Array.isArray(props.items)) return defaultEnd;
  const end = props.items.reduce<number>(
    (sum, item) => sum + getItemSize(item, props.horizontal, false),
    0
  );
  if (!end) return defaultEnd;
  return end + totalGap;
}

function getEndFromStyle(style: CSSProperties) {
  if (!("--end" in style)) return;
  return style["--end"] as number;
}

export function CollectionItems<T extends Item = never>({
  store: storeProp,
  items: itemsProp,
  initialItems = 0,
  orientation: orientationProp,
  itemSize,
  estimatedItemSize: estimatedItemSizeProp,
  gap: gapProp,
  overscan: overscanProp,
  getVisibleIds,
  children: renderItem,
  ...props
}: CollectionItemsProps<T>) {
  const context = useContext(CollectionContext);
  const store = storeProp || (context as Store<T>);

  const items =
    useStoreState(store, (state) => itemsProp ?? (state.items as Items<T>)) ||
    itemsProp;

  invariant(
    items != null,
    process.env.NODE_ENV !== "production" &&
      "CollectionItems must be either wrapped in a Collection component or be given an `items` prop."
  );

  let parent = useContext(CollectionItemsContext);
  if (store && parent?.store !== store) {
    parent = null;
  }

  const orientation = orientationProp ?? parent?.orientation ?? "vertical";
  const estimatedItemSize =
    estimatedItemSizeProp ?? parent?.estimatedItemSize ?? 40;
  const gap = gapProp ?? parent?.gap ?? 0;
  const overscan = overscanProp ?? parent?.overscan ?? 1;

  const ref = useRef<HTMLDivElement>(null);
  const baseId = useId(props.id);
  const horizontal = orientation === "horizontal";
  const [data, setData] = useState<Data>(() => new Map());
  const elements = useMemo(() => new Map<string, HTMLElement>(), []);
  const [elementsUpdated, updateElements] = useForceUpdate();

  const [visibleIds, setVisibleIds] = useState<string[]>(() => {
    if (!initialItems) return [];
    const length = getItemsLength(initialItems);
    if (!length) return [];
    const ids: string[] = [];
    for (let index = 0; index < length; index += 1) {
      const item = getItem(initialItems, index);
      const id = getItemId(item, index, baseId);
      ids.push(id);
    }
    return ids;
  });

  useSafeLayoutEffect(() => {
    if (!baseId) return;
    if (itemSize != null) return;
    setData((data) => {
      if (!items) return data;
      const length = getItemsLength(items);
      let nextData: Data | undefined;
      let start = 0;
      const avgSize = getAverageSize({
        baseId,
        data,
        horizontal,
        items,
        elements,
        estimatedItemSize,
      });
      for (let index = 0; index < length; index += 1) {
        const item = getItem(items, index);
        const itemId = getItemId(item, index, baseId);
        const itemData = data.get(itemId);
        const prevRendered = itemData?.rendered ?? false;

        const setSize = (size: number, rendered = prevRendered) => {
          start = start ? start + gap : start;
          const end = start + size;
          const hasChanged =
            itemData?.start !== start ||
            itemData.end !== end ||
            itemData?.rendered !== rendered;
          if (hasChanged) {
            if (!nextData) {
              nextData = new Map(data);
            }
            nextData.set(itemId, { index, rendered, start, end });
          }
          start = end;
        };

        const size = getItemSize(item, horizontal, elements.get(itemId));

        if (size) {
          setSize(size, true);
        } else if (itemData?.rendered) {
          setSize(itemData.end - itemData.start, true);
        } else {
          setSize(avgSize);
        }
      }

      return nextData || data;
    });
  }, [
    elementsUpdated,
    baseId,
    itemSize,
    items,
    horizontal,
    elements,
    estimatedItemSize,
    gap,
  ]);

  const defaultEnd = props.style ? getEndFromStyle(props.style) : undefined;

  const getEnd = useCallback(() => {
    return getItemsEnd({
      baseId,
      items,
      data,
      gap,
      horizontal,
      itemSize,
      estimatedItemSize,
      defaultEnd,
    });
  }, [
    baseId,
    items,
    data,
    gap,
    horizontal,
    itemSize,
    estimatedItemSize,
    defaultEnd,
  ]);

  const processVisibleItems = useCallback(
    (scrollingElement: Element) => {
      if (!baseId) return;
      const container = ref.current;
      if (!container) return;
      if (!data.size && !itemSize) return;
      const offset = getOffset(container, scrollingElement, horizontal);
      const length = getItemsLength(items);
      const scrollOffset = getScrollOffset(
        scrollingElement,
        horizontal,
        getEnd()
      );

      const getItemOffset = (index: number) => {
        const item = getItem(items, index);
        const itemId = getItemId(item, index, baseId);
        const itemData = data.get(itemId);
        const defaultOffset = itemSize ? itemSize * index + gap * index : 0;
        return itemData?.start ?? defaultOffset;
      };

      const startTarget = scrollOffset - offset;
      const initialStart = findNearestIndex(items, startTarget, getItemOffset);
      if (initialStart == null) return;

      let initialEnd = initialStart + 1;

      const scrollingSize = horizontal
        ? scrollingElement.clientWidth
        : scrollingElement.clientHeight;
      const scrollingEnd = scrollOffset - offset + scrollingSize;

      while (initialEnd < length && getItemOffset(initialEnd) < scrollingEnd) {
        initialEnd += 1;
      }

      const start = Math.max(initialStart - overscan, 0);
      const end = Math.min(initialEnd + overscan, length);

      let ids: string[] = [];

      for (let index = start; index < end; index++) {
        const item = getItem(items, index);
        const itemId = getItemId(item, index, baseId);
        ids.push(itemId);
      }

      if (getVisibleIds) {
        ids = getVisibleIds(ids);
      }

      setVisibleIds(ids);
    },
    [
      baseId,
      data,
      itemSize,
      horizontal,
      items,
      getEnd,
      gap,
      overscan,
      getVisibleIds,
    ]
  );

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const scrollingElement = getScrollingElement(container);
    if (!scrollingElement) return;
    const viewport = getViewport(scrollingElement);
    if (!viewport) return;
    const scroll = () => {
      const onScroll = () => {
        flushSync(() => {
          processVisibleItems(scrollingElement);
        });
      };
      viewport.addEventListener("scroll", onScroll, { passive: true });
      return () => viewport.removeEventListener("scroll", onScroll);
    };
    const observeScrollingElement = () => {
      if (scrollingElement.tagName === "HTML") return;
      let firstRun = true;
      const observer = new ResizeObserver(() => {
        if (firstRun) {
          firstRun = false;
          return;
        }
        processVisibleItems(scrollingElement);
      });
      observer.observe(scrollingElement);
      return () => observer.disconnect();
    };
    const observeWindow = () => {
      if (scrollingElement.tagName !== "HTML") return;
      const onResize = () => {
        processVisibleItems(scrollingElement);
      };
      viewport.addEventListener("resize", onResize, { passive: true });
      return () => viewport.removeEventListener("resize", onResize);
    };
    return chain(scroll(), observeScrollingElement(), observeWindow());
  }, [processVisibleItems]);

  const elementObserver = useMemo(() => {
    if (typeof ResizeObserver !== "function") return;
    const observedElements = new WeakSet<Element>();
    return new ResizeObserver(([entry]) => {
      if (!entry) return;
      if (!observedElements.has(entry.target)) {
        observedElements.add(entry.target);
        return;
      }
      updateElements();
    });
  }, [updateElements]);

  const itemRef = useCallback<RefCallback<HTMLElement>>(
    (element) => {
      if (!element) return;
      elements.set(element.id, element);
      elementObserver?.observe(element);
      updateElements();
    },
    [elements, elementObserver, updateElements]
  );

  const getItemProps = useCallback(
    (item: RawItemProps<T>, index: number) => {
      if (!baseId) return;
      const itemId = getItemId(item, index, baseId);
      const itemData = data.get(itemId);
      const defaultOffset = itemSize ? itemSize * index + gap * index : 0;
      const offset = itemData?.start ?? defaultOffset;
      const axis = horizontal ? "X" : "Y";
      const size = itemData ? itemData.end - itemData.start : itemSize;
      const baseItemProps: BaseItemProps = {
        id: itemId,
        ref: itemRef,
        style: {
          // @ts-expect-error
          "--size": size,
          transform: `translate${axis}(${offset}px)`,
          position: "absolute",
          left: 0,
          top: 0,
        },
      };
      if (item == null) return baseItemProps as ItemProps<T>;
      const itemProps = getItemObject(item);
      return {
        ...itemProps,
        ...baseItemProps,
        style: {
          ...itemProps.style,
          ...baseItemProps.style,
        },
      } as ItemProps<T>;
    },
    [baseId, data, itemSize, gap, horizontal, itemRef]
  );

  const children = useMemo(() => {
    const itemsProps: ItemProps<T>[] = [];
    const length = getItemsLength(items);
    for (let index = 0; index < length; index += 1) {
      const item = getItem(items, index);
      const itemId = getItemId(item, index, baseId);
      if (!visibleIds.includes(itemId)) continue;
      const itemProps = getItemProps(item, index);
      if (!itemProps) continue;
      itemsProps.push(itemProps);
    }
    if (!renderItem) return null;
    return itemsProps.map(renderItem);
  }, [items, baseId, visibleIds, getItemProps, renderItem]);

  const sizeProperty = horizontal ? "width" : "height";
  const end = useMemo(getEnd, [getEnd]);
  const styleProp = props.style;

  const style = useMemo(
    () => ({
      flex: "none",
      position: "relative" as const,
      [sizeProperty]: end,
      ...styleProp,
    }),
    [styleProp, sizeProperty, end]
  );

  props = {
    id: baseId,
    ...props,
    style,
    ref: useMergeRefs(ref, props.ref),
  };

  return createElement("div", { ...props, children });
}

export interface CollectionItemsOptions<T extends Item = never> {
  /**
   * Object returned by the
   * [`useCollectionStore`](https://ariakit.org/reference/use-collection-store)
   * hook. If not provided, the parent
   * [Collection](https://ariakit.org/components/collection) component's
   * context will be used.
   *
   * The store
   * [`items`](https://ariakit.org/reference/use-collection-store#items) state
   * will be used to render the items if the
   * [`items`](https://ariakit.org/reference/collection-items#items) prop is not
   * provided.
   */
  store?: Store<T>;
  /**
   * All items to be rendered. This prop can be either a memoized array of items
   * or a number representing the total number of items to be rendered.
   *
   * When passing an array, each item can be either a primitive value or an
   * object. If it's a primitive value, an object with the `value` property will
   * be automatically created for each item and passed as an argument to the
   * function that renders the item. If it's an object, the entire object will
   * be passed.
   *
   * The item object can have any shape, but some **optional** properties are
   * special:
   * - `id`: The same as the HTML attribute. If not provided, one will be
   *   generated automatically.
   * - `style`: The same as the HTML attribute. This will be merged with the
   *   styles generated by the component for each item. If the `width` or
   *   `height` properties are explicitly provided here, they will be used to
   *   calculate the item's size.
   * - `items`: An array of items to be rendered as children of this item. This
   *   is useful when rendering nested items, though it's not required.
   *
   * @example
   * ```jsx
   * <CollectionItems items={1000}>
   *   {(item, index) => (
   *     <CollectionItem key={item.id} {...item}>
   *       Item {index}
   *     </CollectionItem>
   *   )}
   * </CollectionItems>
   * ```
   */
  items?: Items<T>;
  /**
   * The items to be rendered by default before the component is hydrated.
   * Similarly to the
   * [`items`](https://ariakit.org/reference/collection-items#items) prop, this
   * prop can be either a memoized array of items or a number representing the
   * number of items to be rendered.
   *
   * This prop will still accept a `number` value even if the `items` prop is an
   * array, in  which case the number will be used to slice the array of items.
   *
   * @example
   * ```jsx
   * <CollectionItems items={items} initialItems={8}>
   *   {(item) => <CollectionItem key={item.id} {...item} />}
   * </CollectionItems>
   * ```
   */
  initialItems?: Items<T>;
  /**
   * Whether the items should be rendered vertically or horizontally.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";
  /**
   * The fixed size of each item in pixels. If not provided, the size will be
   * automatically calculated.
   */
  itemSize?: number;
  /**
   * The estimated size of each item in pixels. This is used to calculate the
   * initial size of the items before they are rendered.
   * @default 40
   */
  estimatedItemSize?: number;
  /**
   * The gap between each item in pixels.
   * @default 0
   */
  gap?: number;
  /**
   * The number of items to render before and after the visible items.
   * @default 1
   */
  overscan?: number;
  /**
   * A function prop that should return an array of visible item IDs. This is
   * useful when you want to customize the way the visible items are calculated.
   * The function receives an array of all visible IDs that were calculated by
   * the component internally.
   * @param ids An array of all visible IDs that were calculated by the
   * component internally.
   * @returns An array of visible item IDs.
   */
  getVisibleIds?: (ids: string[]) => string[];
  /**
   * The `children` should be a function that receives an item and its index and
   * returns a React element.
   * @param item The item object to be spread on the item component.
   * @param index The index of the item.
   */
  children?: (item: ItemProps<T>, index: number) => ReactNode;
  render?: RenderProp | ReactElement;
}

export interface CollectionItemsProps<T extends Item = never>
  extends Omit<ComponentPropsWithRef<"div">, "children">,
    CollectionItemsOptions<T> {}
