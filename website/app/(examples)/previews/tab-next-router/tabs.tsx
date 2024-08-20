"use client";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import Link from "next/link.js";
import { usePathname, useRouter } from "next/navigation.js";
import * as React from "react";

export function Tabs(props: Ariakit.TabProviderProps) {
  const router = useRouter();
  const selectedId = usePathname();
  return (
    <Ariakit.TabProvider
      selectedId={selectedId}
      setSelectedId={(id) => router.push(id || selectedId)}
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

export const Tab = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof Link>
>(function Tab(props, ref) {
  const id = props.href.toString();
  return (
    <Ariakit.Tab
      id={id}
      className="tab"
      render={<Link ref={ref} {...props} />}
    />
  );
});

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
