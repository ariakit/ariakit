import type {
  CSSProperties,
  ComponentPropsWithRef,
  ReactElement,
  ReactNode,
  RefCallback,
} from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getScrollingElement, getWindow } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import type { AnyObject, EmptyObject } from "@ariakit/core/utils/types";
import { flushSync } from "react-dom";
import {
  useEvent,
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
} from "../utils/hooks.js";
import { createElement } from "../utils/system.js";
import type { RenderProp } from "../utils/types.js";
import type { CompositeStore } from "./composite-store.js";

interface BaseItemProps {
  id: string;
  ref: RefCallback<HTMLElement>;
  style: CSSProperties;
}

type ItemProps<T> = unknown extends T
  ? BaseItemProps
  : BaseItemProps & (T extends AnyObject ? T : { value: T });

type RawItem<T> = unknown extends T
  ? EmptyObject
  : T extends AnyObject
  ? T
  : { value: T };

interface ItemData {
  rendered: boolean;
  start: number;
  end: number;
}

type Data = Map<string, ItemData>;

function findNearestBinarySearch<T>(props: {
  id: string;
  items: number | readonly T[];
  value: number;
  getCurrentValue: (id: string, index: number) => number;
}) {
  const { id, items, value, getCurrentValue } = props;
  let low = 0;
  let high = getItemsLength(items) - 1;
  while (low <= high) {
    const middle = ((low + high) / 2) | 0;
    const itemId = getItemId(items, id, middle);
    const currentValue = getCurrentValue(itemId, middle);
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

function getItemsLength(items: number | readonly unknown[]) {
  return typeof items === "number" ? items : items.length;
}

function getItemId(item: unknown, baseId: string, index: number) {
  const defaultId = `${baseId}/${index}`;
  if (!item) return defaultId;
  if (typeof item !== "object") return defaultId;
  if (!("id" in item)) return defaultId;
  if (typeof item.id !== "string") return defaultId;
  return item.id;
}

function getItemElement(item: unknown) {
  if (!item) return;
  if (typeof item !== "object") return;
  if (!("element" in item)) return;
  if (!item.element) return;
  if (typeof item.element !== "object") return;
  if (!("getBoundingClientRect" in item.element)) return;
  return item.element as HTMLElement;
}

function getItemStyleProperty(item: unknown) {
  if (!item) return;
  if (typeof item !== "object") return;
  if (!("style" in item)) return;
  if (!item.style) return;
  if (typeof item.style !== "object") return;
  return item.style as CSSProperties;
}

function getItemsItem<T>(
  items: number | readonly T[],
  index: number
): RawItem<T> {
  if (typeof items === "number") return {} as RawItem<T>;
  const item = items[index];
  invariant(item, `Couldn't find item at index ${index}`);
  if (typeof item === "object") return item as RawItem<T>;
  return { value: item } as RawItem<T>;
}

function getItemSize(item: unknown, fallbackElement?: HTMLElement | null) {
  const element = getItemElement(item) || fallbackElement;
  if (element?.isConnected) {
    const { width, height } = element.getBoundingClientRect();
    return { width, height };
  }
  const style = getItemStyleProperty(item);
  if (style) {
    const { width, height } = style;
    const isValidWidth = width == null || typeof width === "number";
    const isValidHeight = height == null || typeof height === "number";
    if (isValidWidth && isValidHeight) {
      return { width: width || 0, height: height || 0 };
    }
  }
  return { width: 0, height: 0 };
}

function getAverageSize(props: {
  id: string;
  data: Data;
  horizontal: boolean;
  items: number | readonly unknown[];
  elements: Map<string, HTMLElement>;
  estimatedSize: number;
}) {
  const { id, data, horizontal, items, elements, estimatedSize } = props;
  const length = getItemsLength(items);
  let currentIndex = 0;
  let averageSize = estimatedSize;

  const setAverageSize = (size: number) => {
    const prevIndex = currentIndex;
    currentIndex = currentIndex + 1;
    averageSize = (averageSize * prevIndex + size) / currentIndex;
  };

  for (let i = 0; i < length; i += 1) {
    const item = getItemsItem(items, i);
    const itemId = getItemId(item, id, i);
    const itemData = data.get(itemId);
    const { width, height } = getItemSize(item, elements.get(itemId));
    if (width && horizontal) {
      setAverageSize(width);
    } else if (height && !horizontal) {
      setAverageSize(height);
    } else if (itemData?.rendered) {
      setAverageSize(itemData.end - itemData.start);
    }
  }

  return averageSize;
}

function isHTMLElement(element?: Element | null): element is HTMLElement {
  return !!element && "offsetTop" in element;
}

function getOffset(
  element: HTMLElement,
  scrollingElement: Element,
  horizontal?: boolean
): number {
  const win = getWindow(element);
  const htmlElement = win?.document.documentElement;
  if (scrollingElement === htmlElement) {
    const { left, top } = element.getBoundingClientRect();
    const { scrollX, scrollY } = win;
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

function getScrollOffset(element: Element, end: number, horizontal?: boolean) {
  let scrollOffset = horizontal ? element.scrollLeft : element.scrollTop;
  if (getComputedStyle(element).flexDirection.endsWith("-reverse")) {
    scrollOffset = end + scrollOffset;
  }
  return scrollOffset;
}

function getItemsEnd(props: {
  items: number | readonly unknown[];
  estimatedSize: number;
  data: Data;
  gap: number;
  id?: string;
  itemSize?: number;
}) {
  const { id, items, data, gap = 0, itemSize, estimatedSize } = props;
  const length = getItemsLength(items);
  if (!length) return 0;
  const lastIndex = length - 1;
  if (itemSize != null) {
    return length * itemSize + lastIndex * gap;
  }
  const defaultEnd = length * estimatedSize + lastIndex * gap;
  if (!id) return defaultEnd;
  const lastItemId = getItemId(getItemsItem(items, lastIndex), id, lastIndex);
  const lastItemData = data.get(lastItemId);
  if (!lastItemData?.end) return defaultEnd;
  return lastItemData.end;
}

export function CompositeItems<T>({
  store,
  items,
  children: renderItem,
  horizontal = false,
  itemSize,
  estimatedSize = 40,
  gap = 0,
  overscan = 1,
  ...props
}: CompositeItemsProps<T>) {
  invariant(items != null);

  const ref = useRef<HTMLDivElement>(null);
  const id = useId(props.id);
  const elements = useMemo(() => new Map<string, HTMLElement>(), []);
  const [data, setData] = useState<Data>(() => new Map());

  useSafeLayoutEffect(() => {
    if (!id) return;
    if (itemSize != null) return;
    setData((data) => {
      if (!items) return data;
      const length = getItemsLength(items);
      let nextData: Data | undefined;
      let start = 0;
      const avgSize = getAverageSize({
        id,
        data,
        horizontal,
        items,
        elements,
        estimatedSize,
      });

      for (let i = 0; i < length; i += 1) {
        const item = getItemsItem(items, i);
        const itemId = getItemId(item, id, i);
        const itemData = data.get(itemId);
        const prevRendered = itemData?.rendered ?? false;

        const setSize = (size: number, rendered = prevRendered) => {
          start = start ? start + gap : start;
          const end = start + size;
          if (
            itemData?.start !== start ||
            itemData.end !== end ||
            prevRendered !== rendered
          ) {
            if (!nextData) {
              nextData = new Map(data);
            }
            nextData.set(itemId, { rendered, start, end });
          }
          start = end;
        };

        const { width, height } = getItemSize(item, elements.get(itemId));

        if (width && horizontal) {
          setSize(width, true);
        } else if (height && !horizontal) {
          setSize(height, true);
        } else if (itemData?.rendered) {
          setSize(itemData.end - itemData.start, true);
        } else {
          setSize(avgSize);
        }
      }

      return nextData || data;
    });
  }, [itemSize, items, gap, estimatedSize, id, horizontal, elements]);

  const getEnd = useCallback(() => {
    return getItemsEnd({ items, estimatedSize, data, gap, id, itemSize });
  }, [items, estimatedSize, data, gap, id, itemSize]);

  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);

  const processVisibleItems = useEvent(
    (scrollingElement: Element, offset: number) => {
      if (!id) return;
      const container = ref.current;
      if (!container) return;
      const length = getItemsLength(items);
      const scrollOffset = getScrollOffset(
        scrollingElement,
        getEnd(),
        horizontal
      );
      const scrollingElementSize = horizontal
        ? scrollingElement.clientWidth
        : scrollingElement.clientHeight;
      const initialStart = findNearestBinarySearch({
        id,
        items,
        value: scrollOffset - offset,
        getCurrentValue: (id, index) =>
          data.get(id)?.start ??
          (itemSize ? itemSize * index + gap * index : 0),
      });
      let initialEnd = initialStart + 1;
      while (
        (initialEnd < length &&
          data.get(getItemId(getItemsItem(items, initialEnd), id, initialEnd))
            ?.end) ??
        (itemSize ? initialEnd * itemSize + gap * initialEnd : 0) <
          scrollOffset - offset + scrollingElementSize
      ) {
        initialEnd += 1;
      }
      const start = Math.max(initialStart - overscan, 0);
      const end = Math.min(initialEnd + overscan, length);
      const array: number[] = [];
      if (start > 0) {
        array.push(0);
      }
      for (let i = start; i < end; i++) {
        array.push(i);
      }
      if (end < length) {
        array.push(length - 1);
      }
      setVisibleIndexes(array);
    }
  );

  useEffect(() => {
    if (!id) return;
    const element = ref.current;
    if (!element) return;
    const scrollingElement = getScrollingElement(element);
    if (!scrollingElement) return;
    const offset = getOffset(element, scrollingElement, horizontal);
    const onScroll = () => {
      flushSync(() => {
        processVisibleItems(scrollingElement, offset);
      });
    };
    scrollingElement.addEventListener("scroll", onScroll, {
      capture: false,
      passive: true,
    });

    const observer = new ResizeObserver(() => {
      processVisibleItems(scrollingElement, offset);
    });

    observer.observe(scrollingElement);
    return () => {
      scrollingElement.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [id, getEnd, horizontal]);

  const itemRef = useCallback<RefCallback<HTMLElement>>((element) => {
    if (!element) return;
    elements.set(element.id, element);
  }, []);

  const createItem = useCallback(
    (item: T, index: number) => {
      if (!id) return;
      const itemId = getItemId(item, id, index);
      const axis = horizontal ? "X" : "Y";
      const start =
        data.get(itemId)?.start ??
        (itemSize ? index * itemSize + gap * index : 0);
      const baseItemProps: BaseItemProps = {
        id: itemId,
        ref: itemRef,
        style: {
          transform: `translate${axis}(${start}px)`,
          position: "absolute",
          left: 0,
          top: 0,
        },
      };
      if (item == null) return baseItemProps as ItemProps<T>;
      const itemProps = typeof item === "object" ? item : { value: item };
      return {
        ...baseItemProps,
        ...itemProps,
      } as ItemProps<T>;
    },
    [id, data, horizontal, itemSize, gap, itemRef]
  );

  const children = useMemo(() => {
    return visibleIndexes.map((index) => {
      const item = createItem(getItemsItem(items, index) as T, index);
      if (!item) return null;
      return renderItem?.(item, index);
    });
  }, [visibleIndexes, items, createItem]);

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
    id,
    ...props,
    style,
    ref: useMergeRefs(ref, props.ref),
  };

  return createElement("div", { ...props, children });
}

export interface CompositeItemsProps<T>
  extends Omit<ComponentPropsWithRef<"div">, "children"> {
  store?: CompositeStore;
  items?: number | readonly T[];
  gap?: number;
  render?: RenderProp | ReactElement;
  children?: (item: ItemProps<T>, index: number) => ReactNode;
  horizontal?: boolean;
  itemSize?: number;
  estimatedSize?: number;
  overscan?: number;
}
