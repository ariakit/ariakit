import {
  ForwardedRef,
  HTMLAttributes,
  ReactElement,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { getScrollingElement, getWindow } from "ariakit-utils/dom";
import { useForkRef } from "ariakit-utils/hooks";
import { useStore } from "ariakit-utils/store";
import { HTMLProps, Options, Props } from "ariakit-utils/types";
import { flushSync } from "react-dom";
import { CollectionContext } from "./__utils";
import { CollectionState } from "./collection-state";

type Item = HTMLAttributes<HTMLElement> & { id: string };

function getContainer(
  element?: Element | null
): HTMLElement | Element | Window | null {
  if (!element) return null;
  const { overflowY, overflowX } = getComputedStyle(element);
  if (overflowY !== "visible" || overflowX !== "visible") {
    return element;
  }
  return getContainer(element.parentElement) || getWindow(element);
}

function isHTMLElement(element?: Element | null): element is HTMLElement {
  return !!element && "offsetTop" in element;
}

function getOffsetTop(element: HTMLElement): number {
  const { offsetTop, offsetParent, parentElement } = element;
  let parent = parentElement;
  let top = offsetTop;
  while (offsetParent && parent !== offsetParent && isHTMLElement(parent)) {
    top -= parent.offsetTop;
    parent = parent.parentElement;
  }
  return top;
}

export function useCollectionViewport<T extends Item = Item>({
  state,
  getVisibleItems,
  items,
  itemSize = 40,
  overscan = 1,
  children: renderItem,
  ...props
}: CollectionViewportProps<T> = {}) {
  state = useStore(state || (CollectionContext as any), ["items"]);
  items = items || state?.items;

  const ref = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<Item[]>([]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const container = getContainer(element.parentElement);
    if (!container) return;
    // virtualize items on scroll
    const onScroll = () => {
      const top =
        container instanceof Window
          ? element.getBoundingClientRect().top +
            (getScrollingElement(element)?.scrollTop || 0)
          : getOffsetTop(element);

      const { scrollTop, clientHeight } =
        container instanceof Window
          ? container.document.documentElement
          : container;
      const start = Math.floor((scrollTop - top) / itemSize);
      const end = Math.ceil((scrollTop + clientHeight - top) / itemSize);
      const newItems = items!.slice(
        Math.max(start - overscan, 0),
        Math.min(end + overscan, items!.length)
      );
      flushSync(() => {
        setVisibleItems(newItems);
      });
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
    };
  }, [itemSize, overscan]);

  const children = visibleItems!.map(({ index, ...item }) => {
    const style = {
      position: "absolute",
      left: 0,
      top: 0,
      height: itemSize,
      transform: `translateY(${index * itemSize}px)`,
    };
    return renderItem?.({ ...item, key: item.id, style });
  });

  const nextProps = {
    ...props,
    ref: useForkRef(ref, props.ref),
    style: {
      flex: "none",
      position: "relative" as const,
      height: (items!.length || 0) * itemSize,
      ...props.style,
    },
    children,
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
   * TODO: Comment
   */
  children?: (item: T & Item) => ReactElement;
  /**
   * TODO: Comment
   */
  items?: T[];
  /**
   * TODO: Comment
   * @default true
   */
  itemSize?: 40;
  /**
   * TODO: Comment
   * @default 1
   */
  overscan?: number;
  /**
   * TODO: Comment
   */
  getVisibleItems?: (options: {
    items: Array<T & Item>;
    start: number;
    end: number;
  }) => Array<T & Item>;
};

export type CollectionViewportProps<T extends Item = Item> =
  CollectionViewportOptions<T> &
    Omit<
      HTMLProps<CollectionViewportOptions<T> & { as?: "div" }>,
      keyof CollectionViewportOptions<T>
    >;
