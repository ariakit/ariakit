import type {
  CSSProperties,
  ComponentPropsWithRef,
  ReactElement,
  ReactNode,
  RefCallback,
  RefObject,
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
import { invariant, shallowEqual } from "@ariakit/core/utils/misc";
import type {
  AnyObject,
  BooleanOrCallback,
  EmptyObject,
} from "@ariakit/core/utils/types";
import { flushSync } from "react-dom";
import {
  useBooleanEvent,
  useEvent,
  useForceUpdate,
  useId,
  useMergeRefs,
  useWrapElement,
} from "../utils/hooks.js";
import { useStoreState } from "../utils/store.jsx";
import { createElement, forwardRef } from "../utils/system.jsx";
import type { RenderProp } from "../utils/types.js";
import { useCollectionContext } from "./collection-context.js";
import type {
  CollectionStore,
  CollectionStoreItem,
} from "./collection-store.js";

type NestedRendererItemProps = Pick<
  CollectionRendererOptions,
  | "gap"
  | "orientation"
  | "itemSize"
  | "estimatedItemSize"
  | "padding"
  | "paddingStart"
  | "paddingEnd"
>;

interface ItemObject extends AnyObject, NestedRendererItemProps {
  /**
   * The item unique identifier. If not specified, an ID will be assigned based
   * on the item's index. If it's a nested item and the item is not included in
   * the `items` property of its parent, it must be composed by all the
   * ancestors' IDs and the item's ID, separated by slashes (e.g.,
   * `grand/parent/item`).
   */
  id?: string;
  /**
   * The item style object. If the `width` or `height` properties are
   * specificed, they will be used to calculate the item size.
   */
  style?: CSSProperties;
  /**
   * A list of nested items. Passing this property will help measure the item
   * size.
   */
  items?: Item[];
  /**
   * The rendered item element. This property is assigned to the `items` state
   * on the collection store and can be used to calculate the item size.
   */
  element?: HTMLElement | null;
}

type Item =
  | ItemObject
  | Omit<string, string>
  | Omit<number, string>
  | Omit<boolean, string>
  | null
  | undefined;

type Items<T extends Item> = number | readonly T[];

interface BaseItemProps {
  id: string;
  ref: RefCallback<HTMLElement>;
  style: CSSProperties;
  index: number;
}

type ItemProps<
  T extends Item,
  P extends BaseItemProps = BaseItemProps,
> = unknown extends T ? P : P & (T extends AnyObject ? T : { value: T });

type RawItemProps<T extends Item> = unknown extends T
  ? EmptyObject
  : T extends AnyObject
    ? T
    : { value: T };

type Data = Map<
  string,
  { index: number; rendered: boolean; start: number; end: number }
>;

interface CollectionRendererContextValue {
  store: CollectionRendererOptions["store"];
  orientation: CollectionRendererOptions["orientation"];
  overscan: CollectionRendererOptions["overscan"];
  childrenData: Map<string, Data>;
}

const CollectionRendererContext =
  createContext<CollectionRendererContextValue | null>(null);

function createTask() {
  let raf = 0;
  const run = (cb: () => void) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      cb();
    });
  };
  const cancel = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  return { run, cancel };
}

function findNearestIndex<T extends Item = any>(
  items: Items<T>,
  target: number,
  getValue: (index: number) => number,
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
  return 0;
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
  invariant(baseId, "CollectionRenderer must be given an `id` prop.");
  const defaultId = `${baseId}/${index}`;
  return getItemObject(item).id ?? defaultId;
}

function getItem<T extends Item = any>(
  items: Items<T>,
  index: number,
): RawItemProps<T> | null {
  if (typeof items === "number") {
    if (index >= items) return null;
    return {} as RawItemProps<T>;
  }
  const item = items[index];
  if (!item) return null;
  if (typeof item === "object") return item as RawItemProps<T>;
  return { value: item } as unknown as RawItemProps<T>;
}

function getItemSize(
  item: Item,
  horizontal: boolean,
  fallbackElement?: HTMLElement | null | false,
): number {
  const itemObject = getItemObject(item);
  horizontal = itemObject.orientation === "horizontal" ?? horizontal;
  const prop = horizontal ? "width" : "height";
  const style = itemObject.style;
  if (style) {
    const size = style[prop];
    if (typeof size === "number") return size;
  }
  const items = itemObject.items;
  if (items?.length) {
    const hasSameOrientation =
      !itemObject.orientation ||
      (horizontal && itemObject.orientation === "horizontal") ||
      (!horizontal && itemObject.orientation === "vertical");
    const paddingStart = itemObject.paddingStart ?? itemObject.padding ?? 0;
    const paddingEnd = itemObject.paddingEnd ?? itemObject.padding ?? 0;
    const padding = hasSameOrientation ? paddingStart + paddingEnd : 0;
    const initialSize = (itemObject.gap ?? 0) * (items.length - 1) + padding;
    if (hasSameOrientation && itemObject.itemSize) {
      return initialSize + itemObject.itemSize * items.length;
    }
    const totalSize = items.reduce<number>(
      (sum, item) => sum + getItemSize(item, horizontal),
      initialSize,
    );
    if (totalSize !== initialSize) return totalSize;
  }
  const element =
    fallbackElement !== false ? itemObject.element || fallbackElement : null;
  if (element?.isConnected) {
    return element.getBoundingClientRect()[prop];
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

function getScrollOffset(scroller: Element | Window, horizontal: boolean) {
  if ("scrollX" in scroller) {
    return horizontal ? scroller.scrollX : scroller.scrollY;
  }
  return horizontal ? scroller.scrollLeft : scroller.scrollTop;
}

function getViewport(scroller: Element) {
  const { defaultView, documentElement } = scroller.ownerDocument;
  if (scroller === documentElement) return defaultView;
  return scroller;
}

function useScroller(rendererRef: RefObject<HTMLElement> | null) {
  const [scroller, setScroller] = useState<Element | null>(null);
  useEffect(() => {
    const renderer = rendererRef?.current;
    if (!renderer) return;
    const scroller = getScrollingElement(renderer);
    if (!scroller) return;
    setScroller(scroller);
  }, [rendererRef]);
  return scroller;
}

function getRendererOffset(
  renderer: HTMLElement,
  scroller: Element,
  horizontal: boolean,
): number {
  const win = getWindow(renderer);
  const htmlElement = win?.document.documentElement;
  const rendererRect = renderer.getBoundingClientRect();
  const rendererOffset = horizontal ? rendererRect.left : rendererRect.top;
  if (scroller === htmlElement) {
    const scrollOffset = getScrollOffset(win, horizontal);
    return scrollOffset + rendererOffset;
  }
  const scrollerRect = scroller.getBoundingClientRect();
  const scrollerOffset = horizontal ? scrollerRect.left : scrollerRect.top;
  const scrollOffset = getScrollOffset(scroller, horizontal);
  return rendererOffset - scrollerOffset + scrollOffset;
}

function getOffsets(
  renderer: HTMLElement,
  scroller: Element,
  horizontal: boolean,
) {
  const scrollOffset = getScrollOffset(scroller, horizontal);
  const rendererOffset = getRendererOffset(renderer, scroller, horizontal);
  const scrollSize = horizontal ? scroller.clientWidth : scroller.clientHeight;
  const start = scrollOffset - rendererOffset;
  const end = start + scrollSize;
  return { start, end };
}

function getItemsEnd<T extends Item>(props: {
  baseId?: string;
  items: Items<T>;
  data: Data;
  gap: number;
  horizontal: boolean;
  itemSize?: number;
  estimatedItemSize: number;
  paddingStart: number;
  paddingEnd: number;
}) {
  const length = getItemsLength(props.items);
  const totalPadding = props.paddingStart + props.paddingEnd;
  if (!length) return totalPadding;
  const lastIndex = length - 1;
  const totalGap = lastIndex * props.gap;
  if (props.itemSize != null) {
    return length * props.itemSize + totalGap + totalPadding;
  }
  const defaultEnd = length * props.estimatedItemSize + totalGap + totalPadding;
  if (!props.baseId) return defaultEnd;
  const lastItem = getItem(props.items, lastIndex);
  const lastItemId = getItemId(lastItem, lastIndex, props.baseId);
  const lastItemData = props.data.get(lastItemId);
  if (lastItemData?.end) return lastItemData.end + props.paddingEnd;
  if (!Array.isArray(props.items)) return defaultEnd;
  const end = props.items.reduce<number>(
    (sum, item) => sum + getItemSize(item, props.horizontal, false),
    0,
  );
  if (!end) return defaultEnd;
  return end + totalGap + totalPadding;
}

function getData<T extends Item>(props: {
  baseId: string;
  items: Items<T>;
  data: Data;
  gap: number;
  horizontal: boolean;
  elements: Map<string, HTMLElement>;
  paddingStart: number;
  itemSize?: number;
  estimatedItemSize: number;
}) {
  const length = getItemsLength(props.items);
  let nextData: Data | undefined;
  let start = props.paddingStart;
  const avgSize = getAverageSize(props);

  for (let index = 0; index < length; index += 1) {
    const item = getItem(props.items, index);
    const itemId = getItemId(item, index, props.baseId);
    const itemData = props.data.get(itemId);
    const prevRendered = itemData?.rendered ?? false;

    const setSize = (size: number, rendered = prevRendered) => {
      start = start ? start + props.gap : start;
      const end = start + size;
      const nextItemData = { index, rendered, start, end };
      if (!shallowEqual(itemData, nextItemData)) {
        if (!nextData) {
          nextData = new Map(props.data);
        }
        nextData.set(itemId, { index, rendered, start, end });
      }
      start = end;
    };

    const size = getItemSize(
      item,
      props.horizontal,
      props.elements.get(itemId),
    );

    if (size) {
      setSize(size, true);
    } else if (itemData?.rendered) {
      setSize(itemData.end - itemData.start, true);
    } else {
      setSize(avgSize);
    }
  }

  return nextData;
}

export function useCollectionRenderer<T extends Item = any>({
  store,
  items: itemsProp,
  initialItems = 0,
  gap = 0,
  itemSize,
  estimatedItemSize = 40,
  overscan: overscanProp,
  orientation: orientationProp,
  padding = 0,
  paddingStart = padding,
  paddingEnd = padding,
  persistentIndices,
  renderOnScroll = true,
  renderOnResize = !!renderOnScroll,
  children: renderItem,
  ...props
}: CollectionRendererProps<T>) {
  const context = useCollectionContext();
  store = store || (context as typeof store);

  const items = useStoreState(
    store,
    (state) => itemsProp ?? (state?.items as T[]),
  );

  invariant(
    items != null,
    process.env.NODE_ENV !== "production" &&
      "CollectionRenderer must be either wrapped in a Collection component or be given an `items` prop.",
  );

  let parent = useContext(CollectionRendererContext);

  if (store && parent?.store !== store) {
    parent = null;
  }

  const parentData = parent?.childrenData;
  const orientation = orientationProp ?? parent?.orientation ?? "vertical";
  const overscan = overscanProp ?? parent?.overscan ?? 1;

  const ref = useRef<HTMLDivElement>(null);
  const baseId = useId(props.id);
  const horizontal = orientation === "horizontal";
  const elements = useMemo(() => new Map<string, HTMLElement>(), []);
  const [elementsUpdated, updateElements] = useForceUpdate();

  const [defaultVisibleIndices, setVisibleIndices] = useState<number[]>(() => {
    if (!initialItems) return [];
    const length = getItemsLength(items);
    const initialLength = Math.min(length, Math.abs(initialItems));
    return Array.from({ length: initialLength }, (_, index) => {
      if (initialItems < 0) return length - index - 1;
      return index;
    });
  });

  const visibleIndices = useMemo(() => {
    if (!persistentIndices) return defaultVisibleIndices;
    const nextIndices = defaultVisibleIndices.slice();
    persistentIndices.forEach((index) => {
      if (index < 0) return;
      if (nextIndices.includes(index)) return;
      nextIndices.push(index);
    });
    nextIndices.sort((a, b) => a - b);
    if (shallowEqual(defaultVisibleIndices, nextIndices)) {
      return defaultVisibleIndices;
    }
    return nextIndices;
  }, [defaultVisibleIndices, persistentIndices]);

  const [data, setData] = useState<Data>(() => {
    if (!baseId) return new Map();
    const data = parentData?.get(baseId) || new Map();
    if (itemSize != null) return data;
    if (!items) return data;
    const nextData = getData({
      baseId,
      items,
      data,
      gap,
      elements,
      horizontal,
      paddingStart,
      itemSize,
      estimatedItemSize,
    });
    return nextData || data;
  });

  const totalSize = useMemo(() => {
    return getItemsEnd({
      baseId,
      items,
      data,
      gap,
      horizontal,
      itemSize,
      estimatedItemSize,
      paddingStart,
      paddingEnd,
    });
  }, [
    baseId,
    items,
    data,
    gap,
    horizontal,
    itemSize,
    estimatedItemSize,
    paddingStart,
    paddingEnd,
  ]);

  // Back up the data to the parent so that it can be used later when this
  // renderer is re-mounted.
  useEffect(() => {
    if (!baseId) return;
    parentData?.set(baseId, data);
  }, [baseId, parentData, data]);

  useEffect(() => {
    if (itemSize != null) return;
    if (!baseId) return;
    if (!items) return;
    const nextData = getData({
      baseId,
      items,
      data,
      gap,
      elements,
      horizontal,
      paddingStart,
      itemSize,
      estimatedItemSize,
    });
    if (nextData) {
      setData(nextData);
    }
  }, [
    elementsUpdated,
    itemSize,
    baseId,
    items,
    data,
    gap,
    elements,
    horizontal,
    paddingStart,
    estimatedItemSize,
  ]);

  const scroller = useScroller(items ? ref : null);
  const offsetsRef = useRef({ start: 0, end: 0 });

  const processVisibleIndices = useCallback(() => {
    const offsets = offsetsRef.current;

    if (!items) return;
    if (!baseId) return;
    if (!offsets.end) return;
    if (!data.size && !itemSize) return;

    const length = getItemsLength(items);

    const getItemOffset = (index: number, prop: "start" | "end" = "start") => {
      if (itemSize) {
        const start = itemSize * index + gap * index + paddingStart;
        if (prop === "start") return start;
        return start + itemSize;
      }
      const item = getItem(items, index);
      const itemId = getItemId(item, index, baseId);
      const itemData = data.get(itemId);
      return itemData?.[prop] ?? 0;
    };

    const initialStart = findNearestIndex(items, offsets.start, getItemOffset);

    let initialEnd = initialStart;
    while (initialEnd < length && getItemOffset(initialEnd) < offsets.end) {
      initialEnd += 1;
    }

    const finalOverscan = initialEnd - initialStart ? overscan : 0;
    const start = Math.max(initialStart - finalOverscan, 0);
    const end = Math.min(initialEnd + finalOverscan, length);

    const indices = Array.from(
      { length: end - start },
      (_, index) => index + start,
    );

    setVisibleIndices((prevIndices) => {
      if (shallowEqual(prevIndices, indices)) return prevIndices;
      return indices;
    });
  }, [
    elementsUpdated,
    items,
    baseId,
    data,
    itemSize,
    gap,
    paddingStart,
    overscan,
  ]);

  useEffect(processVisibleIndices, [processVisibleIndices]);

  const processVisibleIndicesEvent = useEvent(processVisibleIndices);

  // Update the offsets when the items change.
  useEffect(() => {
    const renderer = ref.current;
    if (!renderer) return;
    if (!scroller) return;
    offsetsRef.current = getOffsets(renderer, scroller, horizontal);
    processVisibleIndicesEvent();
  }, [scroller, horizontal, processVisibleIndicesEvent]);

  const mayRenderOnScroll = !!renderOnScroll;
  const renderOnScrollProp = useBooleanEvent(renderOnScroll);

  // Render on scroll
  useEffect(() => {
    if (!mayRenderOnScroll) return;
    const renderer = ref.current;
    if (!renderer) return;
    if (!scroller) return;
    const viewport = getViewport(scroller);
    if (!viewport) return;
    const task = createTask();
    const onScroll = (event: Event) => {
      task.run(() => {
        if (!renderOnScrollProp(event)) return;
        offsetsRef.current = getOffsets(renderer, scroller, horizontal);
        processVisibleIndicesEvent();
      });
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      task.cancel();
      viewport.removeEventListener("scroll", onScroll);
    };
  }, [
    mayRenderOnScroll,
    scroller,
    renderOnScrollProp,
    horizontal,
    processVisibleIndicesEvent,
  ]);

  const mayRenderOnResize = !!renderOnResize;
  const renderOnResizeProp = useBooleanEvent(renderOnResize);

  // Render on resize
  useEffect(() => {
    if (!mayRenderOnResize) return;
    const renderer = ref.current;
    if (!renderer) return;
    if (!scroller) return;
    const viewport = getViewport(scroller);
    if (!viewport) return;
    const task = createTask();

    if (viewport === scroller) {
      if (typeof ResizeObserver !== "function") return;
      let firstRun = true;
      const observer = new ResizeObserver(() => {
        if (firstRun) {
          firstRun = false;
          return;
        }
        task.run(() => {
          if (!renderOnResizeProp(scroller)) return;
          offsetsRef.current = getOffsets(renderer, scroller, horizontal);
          processVisibleIndicesEvent();
        });
      });
      observer.observe(scroller);
      return () => {
        task.cancel();
        observer.disconnect();
      };
    }

    const onResize = () => {
      task.run(() => {
        if (!renderOnResizeProp(scroller)) return;
        offsetsRef.current = getOffsets(renderer, scroller, horizontal);
        processVisibleIndicesEvent();
      });
    };

    viewport.addEventListener("resize", onResize, { passive: true });
    return () => {
      task.cancel();
      viewport.removeEventListener("resize", onResize);
    };
  }, [
    mayRenderOnResize,
    scroller,
    renderOnResizeProp,
    horizontal,
    processVisibleIndicesEvent,
  ]);

  // Render on intersection
  useEffect(() => {
    if (typeof IntersectionObserver !== "function") return;
    const renderer = ref.current;
    if (!renderer) return;
    if (!scroller) return;
    const viewport = getViewport(scroller);
    if (!viewport) return;
    const observer = new IntersectionObserver(
      () => {
        offsetsRef.current = getOffsets(renderer, scroller, horizontal);
        processVisibleIndicesEvent();
      },
      { root: scroller === viewport ? scroller : null },
    );
    observer.observe(renderer);
    return () => {
      observer.disconnect();
    };
  }, [scroller, processVisibleIndicesEvent]);

  const elementObserver = useMemo(() => {
    if (typeof ResizeObserver !== "function") return;
    return new ResizeObserver(() => {
      flushSync(updateElements);
    });
  }, [updateElements]);

  const itemRef = useCallback<RefCallback<HTMLElement>>(
    (element) => {
      if (!element) return;
      if (itemSize) return;
      updateElements();
      elements.set(element.id, element);
      elementObserver?.observe(element);
    },
    [itemSize, elements, updateElements, elementObserver],
  );

  const getItemProps = useCallback(
    <Item extends T = T>(item: RawItemProps<Item>, index: number) => {
      const itemId = getItemId(item, index, baseId);
      const offset = itemSize
        ? paddingStart + itemSize * index + gap * index
        : data.get(itemId)?.start ?? 0;
      const baseItemProps: BaseItemProps = {
        id: itemId,
        ref: itemRef,
        index,
        style: {
          position: "absolute",
          left: horizontal ? offset : 0,
          top: horizontal ? 0 : offset,
        },
      };
      if (itemSize) {
        baseItemProps.style[horizontal ? "width" : "height"] = itemSize;
      }
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
    [baseId, data, itemSize, paddingStart, gap, horizontal, itemRef],
  );

  const itemsProps = useMemo(() => {
    return visibleIndices
      .map((index) => {
        if (index < 0) return;
        const item = getItem(items, index);
        if (!item) return;
        return getItemProps(item, index);
      })
      .filter((value): value is NonNullable<typeof value> => value != null);
  }, [items, visibleIndices, getItemProps]);

  const children = itemsProps?.map((itemProps) => {
    return renderItem?.(itemProps);
  });

  const styleProp = props.style;
  const sizeProperty = horizontal ? "width" : "height";

  const style = useMemo(
    () => ({
      flex: "none",
      position: "relative" as const,
      [sizeProperty]: totalSize,
      ...styleProp,
    }),
    [styleProp, sizeProperty, totalSize],
  );

  const childrenData = useMemo(() => new Map<string, Data>(), []);
  const providerValue: CollectionRendererContextValue = useMemo(
    () => ({ store, orientation, overscan, childrenData }),
    [store, orientation, overscan, childrenData],
  );

  props = useWrapElement(
    props,
    (element) => (
      <CollectionRendererContext.Provider value={providerValue}>
        {element}
      </CollectionRendererContext.Provider>
    ),
    [providerValue],
  );

  props = {
    id: baseId,
    ...props,
    style,
    ref: useMergeRefs(ref, props.ref),
  };

  return { ...props, children };
}

export const CollectionRenderer = forwardRef(function CollectionRenderer<
  T extends Item = any,
>(props: CollectionRendererProps<T>) {
  const htmlProps = useCollectionRenderer(props);
  return createElement("div", htmlProps);
});

export const getCollectionRendererItem = getItem;
export const getCollectionRendererItemId = getItemId;

export type CollectionRendererItemObject = ItemObject;
export type CollectionRendererItem = Item;
export type CollectionRendererBaseItemProps = BaseItemProps;
export type CollectionRendererItemProps<
  T extends Item,
  P extends BaseItemProps = BaseItemProps,
> = ItemProps<T, P>;

export interface CollectionRendererOptions<T extends Item = any> {
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
  store?: CollectionStore<
    T extends CollectionStoreItem ? T : CollectionStoreItem
  >;
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
   * The item object can have any shape, but some **optional** properties have
   * particular functions:
   * - `id`: The same as the HTML attribute. If not provided, one will be
   *   generated automatically.
   * - `style`: The same as the HTML attribute. This will be merged with the
   *   styles generated by the component for each item. If the `width` or
   *   `height` properties are explicitly provided here, they will be used to
   *   calculate the item's size. This is useful when rendering items with known
   *   variable sizes.
   * - `items`: An array of items to be rendered as children of this item. This
   *   is useful when rendering nested items. This property is recommended when
   *   rendering nested items because it will help the parent renderer calculate
   *   the size and position of the nested items.
   *
   * Also, When rendering nested renderers, you can optionally include props
   * like `gap`, `orientation`, `itemSize`, `estimatedItemSize`, `padding`,
   * `paddingStart`, and `paddingEnd`. These props will help the parent renderer
   * calculate the size and position of the nested renderers.
   */
  items?: Items<T>;
  /**
   * Whether the items should be rendered when the closest scrollable ancestor
   * is scrolled.
   * @default true
   */
  renderOnScroll?: BooleanOrCallback<Event>;
  /**
   * Whether the items should be rendered when the closest scrollable ancestor
   * is resized.
   * @default true
   */
  renderOnResize?: BooleanOrCallback<Element>;
  /**
   * The number of items to render initially. Can be set to a negative number to
   * render items from the end of the list.
   * @default 0
   */
  initialItems?: number;
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
   * The item indices that should always be rendered.
   */
  persistentIndices?: number[];
  /**
   * The padding between the items and the container in pixels. This value will
   * be used for both the `paddingStart` and `paddingEnd` props, if they are not
   * explicitly provided.
   * @default 0
   */
  padding?: number;
  /**
   * The padding between the items and the container's start edge in pixels.
   * This value will override the `padding` prop if it is explicitly provided.
   * @default 0
   */
  paddingStart?: number;
  /**
   * The padding between the items and the container's end edge in pixels. This
   * value will override the `padding` prop if it is explicitly provided.
   * @default 0
   */
  paddingEnd?: number;
  /**
   * The `children` should be a function that receives item props and returns a
   * React element. The item props should be spread onto the element that
   * renders the item.
   */
  children?: (item: ItemProps<T>) => ReactNode;
  render?: RenderProp | ReactElement;
}

export interface CollectionRendererProps<T extends Item = any>
  extends Omit<ComponentPropsWithRef<"div">, "children">,
    CollectionRendererOptions<T> {}
