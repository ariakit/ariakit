"use client";
import * as React from "react";
import * as Ariakit from "@ariakit/react";
import Link from "next/link.js";
import type { LinkProps } from "next/link.js";
import { usePathname, useRouter } from "next/navigation.js";

const TabContext = React.createContext<Ariakit.TabStore | null>(null);

interface TabsProps extends Ariakit.TabStoreProps {
  children: React.ReactNode;
}

export function Tabs({ children, ...props }: TabsProps) {
  const router = useRouter();
  const selectedId = usePathname();

  const tab = Ariakit.useTabStore({
    selectedId,
    setSelectedId: (id) => router.push(id || selectedId),
    ...props,
  });

  return <TabContext.Provider value={tab}>{children}</TabContext.Provider>;
}

type TabListProps = Omit<Ariakit.TabListProps, "store">;

export function TabList(props: TabListProps) {
  const tab = React.useContext(TabContext);
  if (!tab) throw new Error("TabList must be wrapped in a Tabs component");

  return <Ariakit.TabList className="tab-list" {...props} store={tab} />;
}

interface TabProps extends LinkProps {
  children?: React.ReactNode;
}

export function Tab(props: TabProps) {
  const id = props.href.toString();

  return <Ariakit.Tab id={id} className="tab" render={<Link {...props} />} />;
}

type TabPanelProps = Omit<Ariakit.TabPanelProps, "store">;

export function TabPanel(props: TabPanelProps) {
  const tab = React.useContext(TabContext);
  if (!tab) throw new Error("TabPanel must be wrapped in a Tabs component");

  const tabId = tab.useState("selectedId");

  return <Ariakit.TabPanel tabId={tabId} {...props} store={tab} />;
}
