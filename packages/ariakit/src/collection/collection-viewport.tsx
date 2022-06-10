import {
  ComponentPropsWithRef,
  ForwardedRef,
  HTMLAttributes,
  ReactElement,
  RefObject,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { getWindow } from "ariakit-utils/dom";
import {
  useControlledState,
  useEvent,
  useForkRef,
  useSafeLayoutEffect,
} from "ariakit-utils/hooks";
import { useStore } from "ariakit-utils/store";
import { flushSync } from "react-dom";
import { CollectionContext, Item } from "./__utils";
import { CollectionItem } from "./collection-item";
import { CollectionState } from "./collection-state";

type ViewportItem = HTMLAttributes<HTMLElement> &
  Omit<Item, "ref"> & {
    ref?: RefObject<any>;
  };

type ItemData = {
  rendered: boolean;
  start: number;
  end: number;
};

type Data = Map<string, ItemData>;

function isWindow(element: Element | Window): element is Window {
  return element === getWindow(element);
}

function isHTMLElement(element?: Element | null): element is HTMLElement {
  return !!element && "offsetTop" in element;
}

function getViewport(element?: Element | null): Element | Window | null {
  if (!element) return null;
  const { overflowY, overflowX } = getComputedStyle(element);
  if (overflowY !== "visible" || overflowX !== "visible") {
    return element;
  }
  return getViewport(element.parentElement) || getWindow(element);
}

function getViewportElement(viewport: Element | Window) {
  return isWindow(viewport) ? viewport.document.documentElement : viewport;
}

function getScrollOffset(element: Element, horizontal?: boolean) {
  return horizontal ? element.scrollLeft : element.scrollTop;
}

function getSize(element: Element, horizontal?: boolean) {
  return horizontal ? element.clientWidth : element.clientHeight;
}

function getOffset(
  element: HTMLElement,
  viewport: Element | HTMLElement | Window,
  horizontal?: boolean
): number {
  if (isWindow(viewport)) {
    const { left, top } = element.getBoundingClientRect();
    const { scrollX, scrollY } = viewport;
    if (horizontal) return scrollX + left;
    return scrollY + top;
  }
  const { offsetLeft, offsetTop, offsetParent, parentElement } = element;
  let parent = parentElement;
  let offset = horizontal ? offsetLeft : offsetTop;
  while (offsetParent && parent !== offsetParent && isHTMLElement(parent)) {
    offset -= horizontal ? parent.offsetLeft : parent.offsetTop;
    parent = parent.parentElement;
  }
  return offset;
}

function findNearestBinarySearch<T extends ViewportItem = ViewportItem>(
  items: T[],
  value: number,
  getCurrentValue: (id: string) => number
) {
  let low = 0;
  let high = items.length - 1;
  while (low <= high) {
    const middle = ((low + high) / 2) | 0;
    const id = items[middle]!.id;
    const currentValue = getCurrentValue(id);
    if (currentValue < value) {
      low = middle + 1;
    } else if (currentValue > value) {
      high = middle - 1;
    } else {
      return middle;
    }
  }
  if (low > 0) {
    return low - 1;
  }
  return 0;
}

export function useCollectionViewport<T extends ViewportItem = ViewportItem>({
  state,
  items,
  itemSize = 40,
  overscan = 1,
  gap = 50,
  children: renderItem,
  horizontal,
  getVisibleItems,
  data: dataProp,
  setData: setDataProp,
  ...props
}: CollectionViewportProps<T> = {}) {
  state = useStore(state || (CollectionContext as any), ["items"]);
  items = items || state?.items;

  const ref = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<ViewportItem[]>([]);
  const [data, setData] = useControlledState(
    () => new Map(),
    dataProp,
    setDataProp
  );

  useSafeLayoutEffect(() => {
    setData((data) => {
      if (!items) return data;
      let nextData: Data | undefined;
      let start = 0;
      const length = items.length;
      for (let i = 0; i < length; i += 1) {
        const item = items[i]!;
        const prevData = data.get(item.id);
        const prevRendered = prevData?.rendered ?? false;

        const setSize = (size: number, rendered = prevRendered) => {
          start = start ? start + gap : start;
          const end = start + size;
          if (
            prevData?.start !== start ||
            prevData?.end !== end ||
            prevRendered !== rendered
          ) {
            if (nextData === undefined) {
              nextData = new Map(data);
            }
            nextData.set(item.id, { start, end, rendered });
          }
          start = end;
        };

        if (item.ref?.current) {
          const element = item.ref.current as HTMLElement;
          const { width, height } = element.getBoundingClientRect();
          setSize(horizontal ? width : height, true);
        } else if (prevData?.rendered) {
          setSize(prevData.end - prevData.start);
        } else if (horizontal && typeof item.style?.width === "number") {
          setSize(item.style.width);
        } else if (!horizontal && typeof item.style?.height === "number") {
          setSize(item.style.height);
        } else {
          setSize(itemSize);
        }
      }
      return nextData || data;
    });
  }, [items, itemSize, gap, horizontal]);

  const processVisibleItems = useEvent(
    (viewport: Element | Window, offset: number) => {
      if (!items?.length) return;
      const container = ref.current;
      if (!container) return;
      if (!data.size) return;
      const viewportElement = getViewportElement(viewport);
      const scrollOffset = getScrollOffset(viewportElement, horizontal);
      const size = getSize(viewportElement, horizontal);
      const initialStart = findNearestBinarySearch(
        items,
        scrollOffset - offset,
        (id) => data.get(id)?.start ?? 0
      );
      const length = items.length;
      let initialEnd = initialStart + 1;
      while (
        initialEnd < length &&
        data.get(items[initialEnd - 1]!.id)!.end < scrollOffset - offset + size
      ) {
        initialEnd += 1;
      }
      const start = Math.max(initialStart - overscan, 0);
      const end = Math.min(initialEnd + overscan, items.length);
      let visibleItems = items.slice(start, end);
      if (getVisibleItems) {
        visibleItems = getVisibleItems({ visibleItems, items, start, end });
      }
      setVisibleItems(visibleItems);
    }
  );

  const anotherEventRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const viewport = getViewport(element.parentElement);
    if (!viewport) return;
    const offset = getOffset(element, viewport, horizontal);
    const onScroll = () => {
      anotherEventRef.current = true;
      flushSync(() => processVisibleItems(viewport, offset));
      // processVisibleItems(viewport, offset);
    };
    viewport.addEventListener("scroll", onScroll, {
      capture: false,
      passive: true,
    });
    return () => viewport.removeEventListener("scroll", onScroll);
  }, [horizontal]);

  useSafeLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const viewport = getViewport(element.parentElement);
    if (!viewport) return;
    if (!data.size) return;
    // TODO: Not sure if we really need this
    if (anotherEventRef.current) {
      anotherEventRef.current = false;
      return;
    }
    const offset = getOffset(element, viewport, horizontal);
    processVisibleItems(viewport, offset);
  }, [data]);

  const children = visibleItems.map((item) => {
    const axis = horizontal ? "X" : "Y";
    const start = data.get(item.id)?.start ?? 0;
    const style: typeof item.style = {
      transform: `translate${axis}(${start}px)`,
      position: "absolute",
      left: 0,
      top: 0,
      ...item.style,
    };
    const props = { ...item, key: item.id, style };
    if (renderItem) {
      // @ts-expect-error
      return renderItem?.(props);
    }
    return <CollectionItem {...props} key={props.key} />;
  });

  const sizeProp = horizontal ? "width" : "height";
  const lastId = items![items!.length - 1]?.id;

  const nextProps = {
    ...props,
    ref: useForkRef(ref, props.ref),
    children,
    style: {
      flex: "none",
      position: "relative" as const,
      [sizeProp]: lastId && data.get(lastId)?.end,
      ...props.style,
    },
  };

  return nextProps;
}

function CollectionViewportImpl<T extends ViewportItem = ViewportItem>(
  props: CollectionViewportProps<T>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const htmlProps = useCollectionViewport({ ...props, ref });
  return <div {...htmlProps} />;
}

export const CollectionViewport = forwardRef(
  CollectionViewportImpl
) as unknown as typeof CollectionViewportImpl;

export type CollectionViewportOptions<T extends ViewportItem = ViewportItem> = {
  /**
   * Object returned by the `useCollectionState` hook. If not provided, the
   * parent `Collection` component's context will be used.
   */
  state?: CollectionState<T>;
  /**
   * An array with the items that will be used to generate the visible items. If
   * not provided, the `state.items` value will be used.
   */
  items?: T[];
  /**
   * Whether the items will be displayed in a horizontal or vertical layout. It
   * will be set to `true` by default if there's a parent `CollectionViewport`
   * component.
   */
  horizontal?: boolean;
  /**
   * The size of each item. It represents the item's height or width, depending
   * on the `horizontal` prop. Alternatively, items can contain a `style.height`
   * or `style.width` property for variable item sizes.
   * @default 40
   */
  itemSize?: number;
  /**
   * TODO: Comment
   */
  gap?: number;
  /**
   * The number of items that will be rendered before and after the viewport.
   * @default 1
   */
  overscan?: number;
  /**
   * The number of items that will be rendered on the server. If not provided,
   * the visible items will be rendered only on the client-side on mount.
   */
  initialCount?: number;
  /**
   * The children function will receive the item props and should return the
   * element that will be rendered for each item.
   */
  children?: (item: T & ViewportItem) => ReactElement;
  /**
   * A map of the item metadata. It will be used to calculate the item's
   * position and size.
   */
  data?: Data;
  /**
   * A function that will be called to set the `data` prop.
   */
  setData?: (data: Data) => void;
  /**
   * A function that can be used to customize the visible items.
   */
  getVisibleItems?: (props: {
    items: Array<T & ViewportItem>;
    visibleItems: Array<T & ViewportItem>;
    start: number;
    end: number;
  }) => Array<T & ViewportItem>;
};

export type CollectionViewportProps<T extends ViewportItem = ViewportItem> =
  CollectionViewportOptions<T> &
    Omit<ComponentPropsWithRef<"div">, keyof CollectionViewportOptions<T>>;
