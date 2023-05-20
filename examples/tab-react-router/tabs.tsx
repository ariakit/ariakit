import * as React from "react";
import * as Ariakit from "@ariakit/react";
import { Link, useHref, useLocation } from "react-router-dom";
import type { LinkProps } from "react-router-dom";

const TabsContext = React.createContext<Ariakit.TabStore | null>(null);

interface TabsProps extends Ariakit.TabStoreProps {
  children: React.ReactNode;
}

export function Tabs({ children, ...props }: TabsProps) {
  const { pathname: selectedId } = useLocation();

  const store = Ariakit.useTabStore({
    selectOnMove: false,
    selectedId,
    ...props,
  });

  return <TabsContext.Provider value={store}>{children}</TabsContext.Provider>;
}

type TabListProps = Omit<Ariakit.TabListProps, "store">;

export function TabList(props: TabListProps) {
  const tab = React.useContext(TabsContext);
  if (!tab) throw new Error("TabList must be wrapped in a Tabs component");

  return <Ariakit.TabList className="tab-list" {...props} store={tab} />;
}

type TabProps = LinkProps;

export function Tab(props: TabProps) {
  const id = useHref(props.to);

  return <Ariakit.Tab as={Link} id={id} className="tab" {...props} />;
}

type TabPanelProps = Omit<Ariakit.TabPanelProps, "store">;

export function TabPanel(props: TabPanelProps) {
  const tab = React.useContext(TabsContext);
  if (!tab) throw new Error("TabPanel must be wrapped in a Tabs component");

  const tabId = tab.useState("selectedId");

  return <Ariakit.TabPanel tabId={tabId} {...props} store={tab} />;
}
