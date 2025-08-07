import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import * as React from "react";
import type { LinkProps } from "react-router";
import { Link, useHref, useLocation } from "react-router";

export function Tabs(props: Ariakit.TabProviderProps) {
  const { pathname } = useLocation();
  return (
    <Ariakit.TabProvider
      selectOnMove={false}
      selectedId={pathname}
      {...props}
    />
  );
}

export const TabList = React.forwardRef<HTMLDivElement, Ariakit.TabListProps>(
  function TabList(props, ref) {
    return (
      <Ariakit.TabList
        ref={ref}
        {...props}
        className={clsx("tab-list", props.className)}
      />
    );
  },
);

export const Tab = React.forwardRef<HTMLButtonElement, LinkProps>(
  function Tab(props, ref) {
    const id = useHref(props.to);
    return (
      <Ariakit.Tab
        id={id}
        ref={ref}
        className="tab"
        render={<Link {...props} />}
      />
    );
  },
);

export const TabPanel = React.forwardRef<HTMLDivElement, Ariakit.TabPanelProps>(
  function TabPanel(props, ref) {
    const tab = Ariakit.useTabContext();
    const tabId = Ariakit.useStoreState(tab, "selectedId");
    return (
      <Ariakit.TabPanel
        ref={ref}
        tabId={tabId}
        {...props}
        className={clsx("tab-panel", props.className)}
      />
    );
  },
);
