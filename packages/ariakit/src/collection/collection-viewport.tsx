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
import { useEvent, useForkRef, useLazyValue } from "ariakit-utils/hooks";
import { useStore } from "ariakit-utils/store";
import { flushSync } from "react-dom";
import { CollectionContext } from "./__utils";
import { CollectionItem } from "./collection-item";
import { CollectionState } from "./collection-state";

type Item = HTMLAttributes<HTMLElement> & {
  id: string;
  ref?: RefObject<any>;
};

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

function findNearestBinarySearch<T extends Item = Item>(
  items: T[],
  value: number,
  getCurrentValue: (id: string, index: number) => number
) {
  let low = 0;
  let high = items.length - 1;
  while (low <= high) {
    const middle = ((low + high) / 2) | 0;
    const currentValue = getCurrentValue(items[middle]!.id, middle);
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

export function useCollectionViewport<T extends Item = Item>({
  state,
  getVisibleItems,
  items,
  itemSize = 40,
  overscan = 1,
  children: renderItem,
  horizontal,
  ...props
}: CollectionViewportProps<T> = {}) {
  state = useStore(state || (CollectionContext as any), ["items"]);
  items = items || state?.items;

  const ref = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<Item[]>([]);

  // useControlledState
  const [measurements, setMeasurements] = useState<
    Record<string, { start: number; end: number }>
  >({});

  const [dynamicItemSize, setDynamicItemSize] = useState(itemSize);

  const neverChange = useLazyValue(() => new Set<string>());

  useEffect(() => {
    let newSize = itemSize;
    for (const id of neverChange) {
      newSize += measurements[id]!.end - measurements[id]!.start;
    }
    newSize /= neverChange.size || 1;
    setDynamicItemSize(Math.round(newSize));
  }, [itemSize, measurements]);

  useEffect(() => {
    if (!items) return;
    setMeasurements((measurements) => {
      if (!items) return measurements;
      let hasChange = false;
      const nextMeasurements = { ...measurements };
      let totalSize = 0;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i]!;
        if (item.ref?.current) {
          neverChange.add(item.id);
          const { width, height } = (
            item.ref.current as HTMLElement
          ).getBoundingClientRect();
          const itemSize = horizontal ? width : height;
          if (
            !hasChange &&
            (measurements[item.id]?.start !== totalSize ||
              measurements[item.id]?.end !== totalSize + itemSize)
          ) {
            hasChange = true;
          }
          nextMeasurements[item.id] = {
            start: totalSize,
            end: totalSize + itemSize,
          };
          totalSize += itemSize;
        } else if (neverChange.has(item.id)) {
          const itemSize =
            measurements[item.id]!.end - measurements[item.id]!.start;
          if (
            !hasChange &&
            (measurements[item.id]?.start !== totalSize ||
              measurements[item.id]?.end !== totalSize + itemSize)
          ) {
            hasChange = true;
          }
          nextMeasurements[item.id] = {
            start: totalSize,
            end: totalSize + itemSize,
          };
          totalSize += itemSize;
        } else if (horizontal && typeof item.style?.width === "number") {
          const itemSize = item.style.width;
          if (
            !hasChange &&
            (measurements[item.id]?.start !== totalSize ||
              measurements[item.id]?.end !== totalSize + itemSize)
          ) {
            hasChange = true;
          }
          nextMeasurements[item.id] = {
            start: totalSize,
            end: totalSize + itemSize,
          };
          totalSize += itemSize;
        } else if (!horizontal && typeof item.style?.height === "number") {
          const itemSize = item.style.height;
          if (
            !hasChange &&
            (measurements[item.id]?.start !== totalSize ||
              measurements[item.id]?.end !== totalSize + itemSize)
          ) {
            hasChange = true;
          }
          nextMeasurements[item.id] = {
            start: totalSize,
            end: totalSize + itemSize,
          };
          totalSize += itemSize;
        } else {
          const itemSize = dynamicItemSize;
          if (
            !hasChange &&
            (measurements[item.id]?.start !== totalSize ||
              measurements[item.id]?.end !== totalSize + itemSize)
          ) {
            hasChange = true;
          }
          nextMeasurements[item.id] = {
            start: totalSize,
            end: totalSize + itemSize,
          };
          totalSize += itemSize;
        }
      }
      if (hasChange) {
        return nextMeasurements;
      }
      return measurements;
    });
  }, [dynamicItemSize, items, horizontal]);

  const processVisibleItems = useEvent(
    (viewport: Element | Window, offset: number) => {
      if (!items?.length) return;
      const container = ref.current;
      if (!container) return;
      if (!Object.keys(measurements).length) return;
      const viewportElement = getViewportElement(viewport);
      const scrollOffset = getScrollOffset(viewportElement, horizontal);
      const size = getSize(viewportElement, horizontal);
      const initialStart = findNearestBinarySearch(
        items,
        scrollOffset - offset,
        (id) => measurements[id]!.start
      );
      const length = items.length;
      let initialEnd = initialStart + 1;
      while (
        initialEnd < length &&
        measurements[items[initialEnd - 1]!.id]!.end <
          scrollOffset - offset + size
      ) {
        initialEnd += 1;
      }
      // const initialEnd = Math.ceil((scrollOffset - offset + size) / itemSize);
      const start = Math.max(initialStart - overscan, 0);
      const end = Math.min(initialEnd + overscan, items.length);
      let visibleItems = items.slice(start, end);
      if (getVisibleItems) {
        visibleItems = getVisibleItems({ visibleItems, items, start, end });
      }
      setVisibleItems(visibleItems);
    }
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const viewport = getViewport(element.parentElement);
    if (!viewport) return;
    if (Object.keys(measurements).length) {
      const offset = getOffset(element, viewport, horizontal);
      // processVisibleItems(viewport, offset);
    }
  }, [items, measurements]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const viewport = getViewport(element.parentElement);
    if (!viewport) return;
    const offset = getOffset(element, viewport, horizontal);
    const onScroll = () => {
      flushSync(() => processVisibleItems(viewport, offset));
    };
    // onScroll();
    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", onScroll);
  }, [horizontal]);

  const children = visibleItems!.map((item) => {
    if (!items?.length) return;
    const style: typeof item.style = {
      transform: `translate${horizontal ? "X" : "Y"}(${
        measurements[item.id]!.start
      }px)`,
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

  const prop = horizontal ? "width" : "height";

  const nextProps = {
    ...props,
    ref: useForkRef(ref, props.ref),
    children,
    style: {
      flex: "none",
      position: "relative" as const,
      [prop]: measurements[items![items!.length - 1]?.id || 0]?.end,
      ...props.style,
    },
  };

  return nextProps;
}

function CollectionViewportImpl<T extends Item = Item>(
  props: CollectionViewportProps<T>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const htmlProps = useCollectionViewport({ ...props, ref });
  return <div {...htmlProps} />;
}

export const CollectionViewport = forwardRef(
  CollectionViewportImpl
) as unknown as typeof CollectionViewportImpl;

export type CollectionViewportOptions<T extends Item = Item> = {
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
  children?: (item: T & Item) => ReactElement;
  /**
   * A function that can be used to customize the visible items.
   */
  getVisibleItems?: (options: {
    items: Array<T & Item>;
    visibleItems: Array<T & Item>;
    start: number;
    end: number;
  }) => Array<T & Item>;
};

export type CollectionViewportProps<T extends Item = Item> =
  CollectionViewportOptions<T> &
    Omit<ComponentPropsWithRef<"div">, keyof CollectionViewportOptions<T>>;
