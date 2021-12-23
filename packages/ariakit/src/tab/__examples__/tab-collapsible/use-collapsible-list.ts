import { RefObject, useLayoutEffect, useState } from "react";
import { TabState } from "ariakit/tab";

type CollapsibleListProps = {
  ref: RefObject<HTMLElement>;
  state: TabState;
  list: string[];
  gap?: number;
  padding?: number;
  minVisibleItems?: number;
};

const useSafeLayoutEffect =
  typeof window === "undefined" ? () => {} : useLayoutEffect;

/**
 * Makes sure the selected tab is always visible.
 */
function useList({ state, list }: CollapsibleListProps) {
  const [limit, slice] = useState(Infinity);
  const [visible, setVisible] = useState(list);
  const [hidden, setHidden] = useState<string[]>([]);
  const { selectedId, move } = state;

  useSafeLayoutEffect(() => {
    const nextVisible = list.slice(0, limit);
    let nextHidden = list.slice(limit);
    if (selectedId && nextHidden.includes(selectedId)) {
      const lastVisibleId = nextVisible.pop();
      if (lastVisibleId) {
        nextHidden = nextHidden.filter((id) => id !== selectedId);
        nextHidden.unshift(lastVisibleId);
      }
      nextVisible.push(selectedId);
      move(selectedId);
    }
    setVisible(nextVisible);
    setHidden(nextHidden);
  }, [list, limit, selectedId, move]);

  return [visible, hidden, slice] as const;
}

/**
 * Observes the container's width and slices the list accordingly.
 */
export default function useCollapsibleList({
  ref,
  state,
  list,
  gap = 0,
  padding = 60,
  minVisibleItems = 1,
}: CollapsibleListProps) {
  const [visible, hidden, slice] = useList({ ref, state, list });

  useSafeLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const availableWidth = container.offsetWidth - padding;
      const elements = container.querySelectorAll<HTMLElement>("[role=tab]");
      let i = 0;
      let currentWidth = 0;
      while (i < elements.length) {
        const element = elements[i];
        if (element) {
          currentWidth += element.offsetWidth + gap;
          if (currentWidth > availableWidth) {
            break;
          }
        }
        i++;
      }
      slice(Math.max(minVisibleItems, i));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [padding, gap, minVisibleItems, slice]);

  return [visible, hidden] as const;
}
