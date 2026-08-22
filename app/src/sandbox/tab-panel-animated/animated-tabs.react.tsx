/**
 * @license
 * This file is part of Ariakit Plus. For the full license, see
 * https://ariakit.com/plus/license
 */
import * as Ariakit from "@ariakit/react";
import { clsx } from "clsx";
import type { ElementRef } from "react";
import { forwardRef, useEffect, useId, useRef } from "react";

export { TabProvider } from "@ariakit/react";

export const TabList = forwardRef<
  ElementRef<typeof Ariakit.TabList>,
  Ariakit.TabListProps
>(function TabList(props, ref) {
  return <Ariakit.TabList {...props} ref={ref} />;
});

export const Tab = forwardRef<ElementRef<typeof Ariakit.Tab>, Ariakit.TabProps>(
  function Tab(props, ref) {
    return <Ariakit.Tab {...props} ref={ref} />;
  },
);

export const TabPanel = forwardRef<
  ElementRef<typeof Ariakit.TabPanel>,
  Ariakit.TabPanelProps
>(function TabPanel(props, ref) {
  const tab = Ariakit.useTabContext();
  const defaultId = useId();
  const id = props.id ?? defaultId;
  const tabId = Ariakit.useStoreState(
    tab,
    () => props.tabId ?? tab?.panels.item(id)?.tabId,
  );
  const previousTabId = usePrevious(Ariakit.useStoreState(tab, "selectedId"));
  const wasOpen = tabId && previousTabId === tabId;
  return (
    <Ariakit.TabPanel
      ref={ref}
      id={id}
      tabId={tabId}
      {...props}
      data-was-open={wasOpen || undefined}
      className={clsx(
        "w-96 max-w-full p-4 transition-[opacity,translate] duration-300 motion-reduce:[transition:none] [:has(>[data-was-open])>&]:opacity-0 [:has(>[data-was-open])>&]:[translate:-100%] [:is([data-was-open],[data-open])~&]:[translate:100%] [&:not([data-open])]:absolute [&:not([data-open])]:top-0 data-[enter]:![translate:0] data-[enter]:!opacity-100",
        props.className,
      )}
    />
  );
});

function usePrevious<T>(value: T) {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  // The animation compares the current selection with the last committed one.
  // oxlint-disable-next-line react/refs
  return ref.current;
}
