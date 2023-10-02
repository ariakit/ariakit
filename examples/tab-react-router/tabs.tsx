import * as React from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import { Link, useHref, useLocation } from "react-router-dom";
import type { LinkProps } from "react-router-dom";

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
    if (!tab) throw new Error("TabPanel must be wrapped in a Tabs component");

    const tabId = tab.useState("selectedId");

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
