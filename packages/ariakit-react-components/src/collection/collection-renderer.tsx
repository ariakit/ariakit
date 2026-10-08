import { useStoreState } from "@ariakit/react-store";
import {
  useBooleanEvent,
  useEvent,
  useForceUpdate,
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
  useWrapElement,
  createElement,
  forwardRef,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import {
  getScrollingElement,
  getWindow,
  invariant,
  isElement,
  shallowEqual,
} from "@ariakit/utils";
import type { AnyObject, BooleanOrCallback, EmptyObject } from "@ariakit/utils";
import type {
  CSSProperties,
  ElementType,
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
import { flushSync } from "react-dom";
import { useCollectionContext } from "./collection-context.tsx";
import type {
  CollectionStore,
  CollectionStoreItem,
} from "./collection-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

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

type Item = ItemObject | string | number | boolean | null | undefined;

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
  { index: number; rendered: boolean; start: number; end: number; size: number }
>;

interface CollectionRendererContextValue {
  store: CollectionRendererOptions["store"];
  orientation: CollectionRendererOptions["orientation"];
  overscan: CollectionRendererOptions["overscan"];
  scroller?: Element | null;
  scrollerRef?: RefObject<Element | null>;
  scrollerController?: ScrollerController;
  childrenData: Map<string, Data>;
}

const CollectionRendererContext =
  createContext<CollectionRendererContextValue | null>(null);
const nullScrollerRef: RefObject<Element | null> = { current: null };

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
  if (item && typeof item === "object") {
    const itemObject = getItemObject(item);
    if (itemObject.id != null) return itemObject.id;
  }
  return `${baseId}/${index}`;
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
  const prop = horizontal ? "width" : "height";
  const style = itemObject.style;
  if (style) {
    const size = style[prop];
    if (typeof size === "number") return size;
  }
  const items = itemObject.items;
  const hasSameOrientation =
    !itemObject.orientation ||
    (horizontal && itemObject.orientation === "horizontal") ||
    (!horizontal && itemObject.orientation === "vertical");
  // When the nested items run along the axis being measured, the item's size is
  // the sum of its children's sizes. When they run along the cross axis (e.g. a
  // horizontal group inside a vertical list), summing would measure the wrong
  // axis, so we fall through to the element/max-child measurement below
  // instead.
  if (items?.length && hasSameOrientation) {
    const paddingStart = itemObject.paddingStart ?? itemObject.padding ?? 0;
    const paddingEnd = itemObject.paddingEnd ?? itemObject.padding ?? 0;
    const padding = paddingStart + paddingEnd;
    const initialSize = (itemObject.gap ?? 0) * (items.length - 1) + padding;
    if (itemObject.itemSize) {
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
  // The nested items run along the cross axis, so the item's extent along the
  // measured axis is the largest child extent rather than the sum.
  if (items?.length && !hasSameOrientation) {
    const maxSize = items.reduce<number>(
      (max, item) => Math.max(max, getItemSize(item, horizontal)),
      0,
    );
    if (maxSize) return maxSize;
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
      setAverageSize(itemData.size);
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

function getScrollElement(
  renderer: HTMLElement,
  scrollElement: CollectionRendererOptions["scrollElement"],
): Element | null {
  if (scrollElement === undefined) {
    return getScrollingElement(renderer);
  }
  if (typeof scrollElement === "function") {
    return scrollElement(renderer);
  }
  const element = scrollElement as HTMLElement | null | undefined;
  if (isElement(element)) {
    return element;
  }
  if (scrollElement && "current" in scrollElement) {
    return scrollElement.current;
  }
  return scrollElement;
}

function resolveNullScroller() {
  return null;
}

interface ScrollerController {
  disable: () => void;
  invalidate: () => void;
  revalidate: () => void;
  setResolve: (resolve: () => Element | null) => void;
}

interface ScrollerControllerState {
  revalidated: boolean;
  resolve: () => Element | null;
}

function useScroller(
  rendererRef: RefObject<HTMLElement | null> | null,
  scrollElement: CollectionRendererOptions["scrollElement"],
  inheritedController?: ScrollerController,
) {
  const [scroller, setScroller] = useState<Element | null>(null);
  const scrollerRef = useRef<Element | null>(null);
  const publishedScrollerRef = useRef<Element | null>(null);
  const autoResolved = useRef(false);
  const previousRendererRef = useRef(rendererRef);
  const controllerStateRef = useRef<ScrollerControllerState>({
    revalidated: false,
    resolve: resolveNullScroller,
  });
  const controller = useMemo<ScrollerController>(() => {
    return {
      disable: () => {
        controllerStateRef.current = {
          revalidated: true,
          resolve: resolveNullScroller,
        };
      },
      invalidate: () => {
        controllerStateRef.current = {
          ...controllerStateRef.current,
          revalidated: false,
        };
      },
      revalidate: () => {
        const { revalidated, resolve } = controllerStateRef.current;
        if (revalidated) return;
        controllerStateRef.current = { revalidated: true, resolve };
        const nextScroller = resolve();
        scrollerRef.current = nextScroller;
        if (nextScroller === publishedScrollerRef.current) return;
        publishedScrollerRef.current = nextScroller;
        setScroller(nextScroller);
      },
      setResolve: (nextResolve) => {
        controllerStateRef.current = {
          revalidated: false,
          resolve: nextResolve,
        };
      },
    };
  }, []);
  const resolveScroller = () => {
    const renderer = rendererRef?.current;
    if (!renderer) return null;
    return getScrollElement(renderer, scrollElement);
  };
  // Explicit refs and resolvers can change without their prop identity
  // changing, so resolve them during each committed layout.
  useSafeLayoutEffect(() => {
    inheritedController?.invalidate();
    if (scrollElement === undefined) {
      controller.disable();
      publishedScrollerRef.current = null;
      return;
    }
    publishedScrollerRef.current = scroller;
    controller.setResolve(resolveScroller);
    scrollerRef.current = resolveScroller();
  });
  // Keep state synchronization and automatic ancestor detection off the
  // layout path.
  // oxlint-disable-next-line exhaustive-deps
  useEffect(() => {
    if (scrollElement === undefined) {
      inheritedController?.revalidate();
      if (previousRendererRef.current !== rendererRef) {
        previousRendererRef.current = rendererRef;
        autoResolved.current = false;
      }
      const renderer = rendererRef?.current;
      if (!renderer) {
        autoResolved.current = false;
        scrollerRef.current = null;
      } else if (!autoResolved.current) {
        scrollerRef.current = getScrollElement(renderer, scrollElement);
        autoResolved.current = true;
      }
    } else {
      autoResolved.current = false;
      // Ancestor refs attach after descendant layout effects, so resolve the
      // explicit target again once the entire layout phase has completed.
      controller.revalidate();
      return;
    }
    const nextScroller = scrollerRef.current;
    if (nextScroller === scroller) return;
    setScroller(nextScroller);
  });
  return [scroller, scrollerRef, controller] as const;
}

/**
 * Returns the offset of the element from the start of the scroller's scrollable
 * content.
 */
function getElementOffset(
  element: HTMLElement,
  scroller: Element,
  horizontal: boolean,
): number {
  const win = getWindow(element);
  const htmlElement = win?.document.documentElement;
  const elementRect = element.getBoundingClientRect();
  const elementOffset = horizontal ? elementRect.left : elementRect.top;
  if (scroller === htmlElement) {
    const scrollOffset = getScrollOffset(win, horizontal);
    return scrollOffset + elementOffset;
  }
  const scrollerRect = scroller.getBoundingClientRect();
  const scrollerOffset = horizontal ? scrollerRect.left : scrollerRect.top;
  const scrollOffset = getScrollOffset(scroller, horizontal);
  return elementOffset - scrollerOffset + scrollOffset;
}

function getOffsets(
  renderer: HTMLElement,
  scroller: Element,
  horizontal: boolean,
) {
  const scrollOffset = getScrollOffset(scroller, horizontal);
  const rendererOffset = getElementOffset(renderer, scroller, horizontal);
  const scrollSize = horizontal ? scroller.clientWidth : scroller.clientHeight;
  const start = scrollOffset - rendererOffset;
  const end = start + scrollSize;
  return { start, end };
}

interface AnchorPosition {
  start: number;
  end: number;
}

// How many times a renderer gave the item around each anchor element its first
// layout. Nested renderers have the same anchor element, and each one records
// its own position, because they can have different scroll elements and
// orientations. A record is valid only while this number does not change.
const anchorFirstLayouts = new WeakMap<HTMLElement, number>();

function getAnchorPosition(
  anchor: HTMLElement,
  scroller: Element,
  horizontal: boolean,
): AnchorPosition {
  const rect = anchor.getBoundingClientRect();
  const size = horizontal ? rect.width : rect.height;
  const offset = getElementOffset(anchor, scroller, horizontal);
  // The offset starts at the border edge of the scroller, and the scroll range
  // of the scroller starts at its padding edge. The offset in the document
  // starts at the viewport, which has no border.
  const isDocument = getViewport(scroller) !== scroller;
  const border = horizontal ? scroller.clientLeft : scroller.clientTop;
  const start = isDocument ? offset : offset - border;
  return { start, end: start + size };
}

function hasOffsetSize(element: Element): element is HTMLElement {
  return "offsetHeight" in element;
}

/**
 * Returns the distance to scroll the scroller so that the anchor is at the
 * nearest edge of its view. Returns 0 when the anchor is in view.
 */
function getRevealDistance(
  anchor: HTMLElement,
  scroller: Element,
  horizontal: boolean,
) {
  const rect = anchor.getBoundingClientRect();
  const start = horizontal ? rect.left : rect.top;
  const end = horizontal ? rect.right : rect.bottom;
  const clientSize = horizontal ? scroller.clientWidth : scroller.clientHeight;
  let viewStart = 0;
  let scale = 1;
  // The view of the document is the viewport. The view of an element starts
  // inside its border, and a CSS transform can scale its rectangle, as the
  // scale transition of a popup does.
  if (getViewport(scroller) === scroller) {
    const scrollerRect = scroller.getBoundingClientRect();
    const rectSize = horizontal ? scrollerRect.width : scrollerRect.height;
    let offsetSize = 0;
    if (hasOffsetSize(scroller)) {
      offsetSize = horizontal ? scroller.offsetWidth : scroller.offsetHeight;
    }
    scale = (offsetSize && rectSize / offsetSize) || 1;
    const border = horizontal ? scroller.clientLeft : scroller.clientTop;
    const rectStart = horizontal ? scrollerRect.left : scrollerRect.top;
    viewStart = rectStart + border * scale;
  }
  const viewEnd = viewStart + clientSize * scale;
  const startDistance = start - viewStart;
  const endDistance = end - viewEnd;
  // Rectangles are fractional, so the edges of the view have a tolerance of one
  // pixel.
  if (startDistance >= -1 && endDistance <= 1) return 0;
  // The rectangles are scaled, and the scroll distance is not. An anchor that
  // is larger than the view stops where it fills the view.
  if (startDistance < 0 && endDistance < 0) {
    return Math.max(startDistance, endDistance) / scale;
  }
  if (startDistance > 0 && endDistance > 0) {
    return Math.min(startDistance, endDistance) / scale;
  }
  return 0;
}

interface PendingAnchor {
  data: Data;
  element: HTMLElement;
  scroller: Element;
  scrollOffset: number;
  position: AnchorPosition;
  firstLayouts: number;
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
      if (index > 0) {
        start += props.gap;
      }
      const end = start + size;
      const nextItemData = { index, rendered, start, end, size };
      if (!shallowEqual(itemData, nextItemData)) {
        if (!nextData) {
          nextData = new Map(props.data);
        }
        nextData.set(itemId, { index, rendered, start, end, size });
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
      // Reuse the measured size of an item that has no element now. The
      // difference `end - start` can have a rounding error, which would change
      // the average size and the offsets again on each pass.
      // https://github.com/ariakit/ariakit/issues/7792
      setSize(itemData.size, true);
    } else {
      setSize(avgSize);
    }
  }

  return nextData;
}

export function useCollectionRenderer<T extends Item = any>({
  store: storeProp,
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
  scrollElement: scrollElementProp,
  renderOnScroll = true,
  renderOnResize = !!renderOnScroll,
  unstable_anchorId: anchorId,
  children: renderItem,
  ...props
}: CollectionRendererProps<T>) {
  const context = useCollectionContext();
  const store = storeProp || (context as typeof storeProp);

  const items = useStoreState(
    store,
    ["items"],
    (state) => itemsProp ?? (state?.items as T[]),
  );

  invariant(
    items != null,
    process.env.NODE_ENV !== "production" &&
      "CollectionRenderer must be either wrapped in a Collection component or be given an `items` prop.",
  );

  const contextParent = useContext(CollectionRendererContext);
  const parent = store && contextParent?.store !== store ? null : contextParent;

  const parentData = parent?.childrenData;
  const orientation = orientationProp ?? parent?.orientation ?? "vertical";
  const overscan = overscanProp ?? parent?.overscan ?? 1;
  const inheritedScroller =
    scrollElementProp === undefined ? parent?.scroller : undefined;
  const inheritedScrollerRef =
    scrollElementProp === undefined ? parent?.scrollerRef : undefined;
  const inheritedScrollerController =
    scrollElementProp === undefined ? parent?.scrollerController : undefined;

  const ref = useRef<HTMLType>(null);
  const baseId = useId(props.id);
  const horizontal = orientation === "horizontal";
  const elements = useMemo(() => new Map<string, HTMLElement>(), []);
  const [elementsUpdated, updateElements] = useForceUpdate();
  const computeData = useCallback(
    (currentData: Data, currentBaseId: string, currentItems: Items<T>) => {
      return getData({
        baseId: currentBaseId,
        items: currentItems,
        data: currentData,
        gap,
        elements,
        horizontal,
        paddingStart,
        estimatedItemSize,
      });
    },
    [gap, elements, horizontal, paddingStart, estimatedItemSize],
  );

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
    for (const index of persistentIndices) {
      if (index < 0) continue;
      if (nextIndices.includes(index)) continue;
      nextIndices.push(index);
    }
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
    const nextData = computeData(data, baseId, items);
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

  const [ownScroller, ownScrollerRef, ownScrollerController] = useScroller(
    items && inheritedScroller === undefined ? ref : null,
    scrollElementProp,
    inheritedScrollerController,
  );
  const scroller =
    scrollElementProp === null
      ? null
      : inheritedScroller === undefined
        ? ownScroller
        : inheritedScroller;
  const scrollerRef =
    scrollElementProp === null
      ? nullScrollerRef
      : inheritedScrollerRef === undefined
        ? ownScrollerRef
        : inheritedScrollerRef;
  const scrollerController =
    scrollElementProp === undefined
      ? inheritedScrollerController
      : scrollElementProp === null
        ? undefined
        : ownScrollerController;
  const offsetsRef = useRef({ start: 0, end: 0 });
  const pendingAnchorRef = useRef<PendingAnchor | null>(null);
  const anchorReleasedRef = useRef(false);

  const getAnchorElement = useEvent(() => {
    if (anchorReleasedRef.current) return null;
    const anchor = store?.item(anchorId)?.element;
    if (!anchor) return null;
    for (const [id, element] of elements) {
      if (!element.contains(anchor)) continue;
      if (!data.has(id)) {
        // An item without data renders at the start of the renderer until its
        // first layout, so that first layout is not a move. A nested renderer
        // can record the anchor in the same pass before this renderer runs, so
        // its record is not valid either.
        const firstLayouts = anchorFirstLayouts.get(anchor) ?? 0;
        anchorFirstLayouts.set(anchor, firstLayouts + 1);
        return null;
      }
      return anchor;
    }
    // A nested renderer that does not contain the anchor cannot move it.
    return null;
  });

  // The anchor holds from the moment an item becomes the anchor until the user
  // scrolls. A scroll adjustment during the user's own scroll gesture would
  // compete with that gesture.
  useEffect(() => {
    // A renderer with a fixed item size does not measure, so it never anchors.
    if (itemSize != null) return;
    if (anchorId == null) return;
    if (!scroller) return;
    const viewport = getViewport(scroller);
    if (!viewport) return;
    anchorReleasedRef.current = false;
    const release = () => {
      anchorReleasedRef.current = true;
    };
    viewport.addEventListener("wheel", release, { passive: true });
    viewport.addEventListener("touchmove", release, { passive: true });
    return () => {
      viewport.removeEventListener("wheel", release);
      viewport.removeEventListener("touchmove", release);
    };
  }, [itemSize, anchorId, scroller]);

  useEffect(() => {
    if (itemSize != null) return;
    if (!baseId) return;
    if (!items) return;
    const nextData = computeData(data, baseId, items);
    if (!nextData) return;
    // Record where the anchor is before the new sizes move it, so the layout
    // effect below can tell if it was in view. A nested renderer measures its
    // items before its scroller reaches state, so this reads the ref.
    const anchor = getAnchorElement();
    const anchorScroller = scrollerRef.current;
    if (anchor && anchorScroller) {
      pendingAnchorRef.current = {
        data: nextData,
        element: anchor,
        scroller: anchorScroller,
        scrollOffset: getScrollOffset(anchorScroller, horizontal),
        position: getAnchorPosition(anchor, anchorScroller, horizontal),
        firstLayouts: anchorFirstLayouts.get(anchor) ?? 0,
      };
    }
    // Measurement data changes only after rendered elements are measured.
    // oxlint-disable-next-line react/set-state-in-effect
    setData(nextData);
  }, [
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- element registration signal
    elementsUpdated,
    itemSize,
    baseId,
    items,
    data,
    computeData,
    getAnchorElement,
    scrollerRef,
    horizontal,
  ]);

  // Keep the anchor in view when the measured sizes of other items move it. A
  // move to a far item scrolls to an estimated offset. The renderer measures
  // the items around that offset only afterwards, which would otherwise push
  // the anchor out of view.
  // https://github.com/ariakit/ariakit/issues/7628
  useSafeLayoutEffect(() => {
    const pendingAnchor = pendingAnchorRef.current;
    if (pendingAnchor?.data !== data) return;
    pendingAnchorRef.current = null;
    const renderer = ref.current;
    if (!renderer) return;
    const {
      element,
      scroller: anchorScroller,
      position: previous,
    } = pendingAnchor;
    if (!element.isConnected) return;
    const firstLayouts = anchorFirstLayouts.get(element) ?? 0;
    if (firstLayouts !== pendingAnchor.firstLayouts) return;
    const scrollStart = getScrollOffset(anchorScroller, horizontal);
    const scrollSize = horizontal
      ? anchorScroller.clientWidth
      : anchorScroller.clientHeight;
    // Positions and scroll positions are fractional, so the edges of the scroll
    // element have a tolerance of one pixel.
    const wasInViewAt = (scrollOffset: number) => {
      return (
        previous.start >= scrollOffset - 1 &&
        previous.end <= scrollOffset + scrollSize + 1
      );
    };
    // Only an anchor that was fully in view stays in view. A scroll to an
    // anchor that was out of view, or that the user left partly in view, would
    // move the items that the user is looking at. The scroll position from the
    // measurement counts too, because the browser moves the scroll position
    // back when the new sizes make the content end before it.
    const wasInView =
      wasInViewAt(pendingAnchor.scrollOffset) || wasInViewAt(scrollStart);
    if (wasInView) {
      const distance = getRevealDistance(element, anchorScroller, horizontal);
      // The renderer finds its scroll element one time. A nearer ancestor can
      // start to scroll later, for example a popup that the measured items no
      // longer fit in. That ancestor then clips the anchor, and a scroll of the
      // scroll element of this renderer would not show it.
      if (distance && getScrollingElement(element) === anchorScroller) {
        // Scroll only the scroll element of this renderer. A native
        // `scrollIntoView` would also scroll the ancestors, such as a page that
        // the user scrolled away from this list. The target is a position,
        // because Safari adds up the fractions of relative scroll distances
        // that it gets before it renders the next frame.
        anchorScroller.scrollTo({
          [horizontal ? "left" : "top"]: scrollStart + distance,
          behavior: "instant",
        });
      }
    }
    // The scroll event arrives on a later frame. Until then, the visible items
    // would be calculated from the new sizes and the previous scroll position.
    const scrollOffset = getScrollOffset(anchorScroller, horizontal);
    if (scrollOffset === pendingAnchor.scrollOffset) return;
    offsetsRef.current = getOffsets(renderer, anchorScroller, horizontal);
  }, [data, horizontal]);

  const processVisibleIndices = useCallback(() => {
    const offsets = offsetsRef.current;

    // Ref and resolver targets can change during commit. Skip passive work from
    // the previous scroller until the resolved value reaches context.
    scrollerController?.revalidate();
    if (scrollerRef.current !== scroller) return;
    if (!scroller) return;
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
    // oxlint-disable-next-line exhaustive-deps
  }, [
    // oxlint-disable-next-line react/memo-dependencies -- element registration signal
    elementsUpdated,
    scroller,
    scrollerRef,
    scrollerController,
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
  }, [scroller, horizontal, processVisibleIndicesEvent]);

  const elementObserver = useMemo(() => {
    if (typeof ResizeObserver !== "function") return;
    return new ResizeObserver(() => {
      flushSync(updateElements);
    });
  }, [updateElements]);

  // Disconnect the observer when the renderer unmounts so it doesn't retain the
  // measured item nodes or keep firing resize callbacks. Re-observe the tracked
  // elements on setup so observation survives a simulated unmount/remount
  // (e.g., React StrictMode), which runs this cleanup but doesn't necessarily
  // re-run the item ref callbacks.
  useEffect(() => {
    for (const element of elements.values()) {
      elementObserver?.observe(element);
    }
    return () => elementObserver?.disconnect();
  }, [elementObserver, elements]);

  const itemRef = useCallback<RefCallback<HTMLElement>>(
    (element) => {
      if (!element) return;
      if (itemSize) return;
      // If an id is reassigned to a different node, stop observing the previous
      // node so its detached element isn't retained.
      const prevElement = elements.get(element.id);
      if (prevElement && prevElement !== element) {
        elementObserver?.unobserve(prevElement);
      }
      updateElements();
      // Item refs are an imperative DOM registry coordinated by updateElements.
      // oxlint-disable-next-line react/immutability
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
        : (data.get(itemId)?.start ?? 0);
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

  // Stop observing and forget item nodes that are no longer rendered (for
  // example, dropped from the virtualized window), so neither the observer nor
  // the `elements` map retains their detached nodes.
  useEffect(() => {
    // When `itemSize` is set the renderer doesn't measure items, so nothing
    // should stay observed; otherwise keep the items that are still rendered.
    // The empty set also cleans up if `itemSize` switches from unset to a fixed
    // size at runtime, which would otherwise leave already-measured nodes
    // behind.
    const renderedIds = itemSize
      ? new Set<string>()
      : new Set(itemsProps.map((itemProps) => itemProps.id));
    for (const [id, element] of elements) {
      if (renderedIds.has(id)) continue;
      elementObserver?.unobserve(element);
      // Item cleanup mutates the same imperative DOM registry after commit.
      // oxlint-disable-next-line react/immutability
      elements.delete(id);
    }
  }, [itemsProps, itemSize, elements, elementObserver]);

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
  const contextScroller =
    scrollElementProp === undefined ? inheritedScroller : scroller;
  const contextScrollerRef =
    scrollElementProp === undefined ? inheritedScrollerRef : scrollerRef;
  const providerValue: CollectionRendererContextValue = useMemo(
    () => ({
      store,
      orientation,
      overscan,
      scroller: contextScroller,
      scrollerRef: contextScrollerRef,
      scrollerController,
      childrenData,
    }),
    [
      store,
      orientation,
      overscan,
      contextScroller,
      contextScrollerRef,
      scrollerController,
      childrenData,
    ],
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
  return createElement(TagName, htmlProps);
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

export interface CollectionRendererOptions<
  T extends Item = any,
> extends Options {
  /**
   * Object returned by the
   * [`useCollectionStore`](https://ariakit.com/reference/use-collection-store)
   * hook. If not provided, the closest
   * [Collection](https://ariakit.com/components/collection) component's context
   * will be used.
   *
   * The store
   * [`items`](https://ariakit.com/reference/use-collection-store#items) state
   * will be used to render the items if the
   * [`items`](https://ariakit.com/reference/collection-items#items) prop is not
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
   * The element whose viewport determines which items are rendered. By default,
   * the closest scrolling ancestor is used.
   *
   * The element must be a scrolling ancestor in the same document. If a
   * function is provided, it will be called with the renderer element as an
   * argument. Explicit values are inherited by nested renderers using the same
   * store unless they provide their own. If neither this renderer nor a
   * same-store ancestor provides a value, the renderer detects its closest
   * scrolling ancestor.
   *
   * Viewport-driven rendering is disabled while this value resolves to `null`.
   */
  scrollElement?:
    | HTMLElement
    | RefObject<HTMLElement | null>
    | ((renderer: HTMLElement) => HTMLElement | null)
    | null;
  /**
   * Whether the items should be rendered when the scroll element is scrolled.
   * @default true
   */
  renderOnScroll?: BooleanOrCallback<Event>;
  /**
   * Whether the items should be rendered when the scroll element is resized.
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
   * The id of the item that stays in view in the scroll element when the
   * measured sizes of other items move it.
   * @deprecated
   * @private
   */
  unstable_anchorId?: string | null;
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
}

export interface CollectionRendererProps<T extends Item = any> extends Props<
  TagName,
  CollectionRendererOptions<T>
> {}
