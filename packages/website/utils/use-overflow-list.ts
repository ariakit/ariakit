import { useEffect, useState } from "react";
import { useForceUpdate } from "ariakit-utils/hooks";

type OverflowListProps<T> = {
  list: T[];
  getContainer: () => HTMLElement | null;
  getElements: (container: HTMLElement) => Array<HTMLElement | null>;
  setList?: (list: [T[], T[]]) => [T[], T[]];
  gap?: number;
  disclosureWidth?: number;
  minVisibleItems?: number;
};

export default function useOverflowList<T>({
  list,
  getContainer,
  getElements,
  setList,
  gap = 8,
  disclosureWidth = 60,
  minVisibleItems = 1,
}: OverflowListProps<T>) {
  const [overflowList, setOverflowList] = useState<[T[], T[]]>([list, []]);
  const [updated, forceUpdate] = useForceUpdate();

  useEffect(() => {
    const container = getContainer();
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const elements = getElements(container);
      const availableWidth = container.offsetWidth - disclosureWidth;
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
        i += 1;
      }
      const limit = Math.max(minVisibleItems, i);
      const nextVisible = list.slice(0, limit);
      const nextHidden = list.slice(limit);
      setOverflowList(
        setList ? setList([nextVisible, nextHidden]) : [nextVisible, nextHidden]
      );
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [
    updated,
    getContainer,
    getElements,
    disclosureWidth,
    gap,
    minVisibleItems,
    list,
    setList,
  ]);

  useEffect(forceUpdate, [setList]);

  return overflowList;
}
