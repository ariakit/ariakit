/**
 * @license
 * This file is part of Ariakit Plus. For the full license, see
 * https://ariakit.org/plus/license
 */
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import type { ElementRef } from "react";
import { forwardRef, useEffect, useId, useRef } from "react";

export { TabProvider } from "@ariakit/react";

export const TabList = forwardRef<
  ElementRef<typeof Ariakit.TabList>,
  Ariakit.TabListProps
>(function TabList(props, ref) {
  return (
    <Ariakit.TabList
      {...props}
      ref={ref}
      className={clsx("tab-list", props.className)}
    />
  );
});

export const Tab = forwardRef<ElementRef<typeof Ariakit.Tab>, Ariakit.TabProps>(
  function Tab(props, ref) {
    return (
      <Ariakit.Tab
        {...props}
        ref={ref}
        className={clsx("tab", props.className)}
      />
    );
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
      className={clsx("tab-panel", props.className)}
    />
  );
});

function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
