"use client";
import * as React from "react";
import * as Ariakit from "@ariakit/react";
import Link from "next/link.js";
import { usePathname, useRouter } from "next/navigation.js";

const TabContext = React.createContext<Ariakit.TabStore | null>(null);

interface TabsProps extends Ariakit.TabStoreProps {
  children: React.ReactNode;
}

export function Tabs({ children, ...props }: TabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const tab = Ariakit.useTabStore({
    ...props,
    selectOnMove: false,
    selectedId: pathname,
    setSelectedId: (id) => router.push(id || "/"),
  });

  return <TabContext.Provider value={tab}>{children}</TabContext.Provider>;
}

type TabListProps = Partial<Ariakit.TabListProps>;

export const TabList = React.forwardRef<HTMLDivElement, TabListProps>(
  (props, ref) => {
    const tab = React.useContext(TabContext);
    if (!tab) throw new Error("TabList must be wrapped in a Tabs component");
    return (
      <Ariakit.TabList className="tab-list" {...props} ref={ref} store={tab} />
    );
  }
);

type TabProps = Ariakit.TabProps<typeof Link>;

export const Tab = React.forwardRef<HTMLAnchorElement, TabProps>(
  (props, ref) => {
    const id = props.href.toString();
    return (
      <Ariakit.Tab className="tab" {...props} as={Link} id={id} ref={ref} />
    );
  }
);

type TabPanelProps = Partial<Ariakit.TabPanelProps>;

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  (props, ref) => {
    const tab = React.useContext(TabContext);
    if (!tab) throw new Error("TabPanel must be wrapped in a Tabs component");
    const selectedId = tab.useState("selectedId");
    return (
      <Ariakit.TabPanel {...props} ref={ref} store={tab} tabId={selectedId} />
    );
  }
);
