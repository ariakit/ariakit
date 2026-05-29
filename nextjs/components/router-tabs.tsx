"use client";
import * as ak from "@ariakit/react";
import type { Route } from "next";
import type { LinkProps } from "next/link";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type * as React from "react";
import { useOptimistic, useTransition } from "react";

function clsx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface TabsProps
  extends
    ak.RoleProps,
    Pick<
      ak.TabProviderProps,
      "selectedId" | "setSelectedId" | "defaultSelectedId"
    > {}

export function Tabs({
  selectedId,
  setSelectedId,
  defaultSelectedId,
  children,
  ...props
}: TabsProps) {
  // Use an explicit, stable store id. Without it the composite store falls back
  // to a `Math.random()`-based id, which Next.js forbids inside a Client
  // Component during prerender when `cacheComponents` is enabled.
  const store = ak.useTabStore({
    id: "tab-nextjs",
    selectedId,
    setSelectedId,
    defaultSelectedId,
  });
  return (
    <div
      {...props}
      className={clsx(
        "ak-tabs ak-layer-2 ak-frame-container/0 ak-border overflow-visible",
        props.className,
      )}
    >
      <ak.TabProvider store={store}>{children}</ak.TabProvider>
    </div>
  );
}

export interface TabListProps extends ak.TabListProps {}

export function TabList(props: TabListProps) {
  return (
    <ak.TabList {...props} className={clsx("ak-tab-list", props.className)} />
  );
}

export interface TabProps extends ak.TabProps {}

export function Tab(props: TabProps) {
  return (
    <ak.Tab
      {...props}
      className={clsx(
        "ak-tab-folder data-focus-visible:ak-tab-folder_focus",
        props.className,
      )}
    >
      <span>{props.children}</span>
    </ak.Tab>
  );
}

export interface TabPanelProps extends ak.TabPanelProps {}

export function TabPanel(props: TabPanelProps) {
  return (
    <ak.TabPanel {...props} className={clsx("ak-tab-panel", props.className)} />
  );
}

export interface RouterTabsProps extends Omit<
  TabsProps,
  "selectedId" | "setSelectedId" | "defaultSelectedId"
> {
  selectedId?: Route;
  setSelectedId?: (id: Route) => void;
}

export function RouterTabs({
  selectedId,
  setSelectedId,
  ...props
}: RouterTabsProps) {
  const router = useRouter();
  const _selectedId = usePathname() as Route;
  selectedId = selectedId ?? _selectedId;
  const [isPending, startTransition] = useTransition();
  const [optimisticId, setOptimisticId] = useOptimistic(selectedId);
  return (
    <Tabs
      {...props}
      data-pending={isPending || undefined}
      selectedId={optimisticId}
      setSelectedId={(id) => {
        const nextId = (id as Route) || selectedId;
        setSelectedId?.(nextId);
        startTransition(() => {
          router.push(nextId);
          setOptimisticId(nextId);
        });
      }}
    />
  );
}

export interface RouterTabProps extends Omit<LinkProps<Route>, "href"> {
  href: Route;
  children?: React.ReactNode;
}

export function RouterTab({ children, ...props }: RouterTabProps) {
  const id = props.href;
  return (
    <Tab id={id} render={<Link {...props} />}>
      {children}
    </Tab>
  );
}

export interface RouterTabPanelProps extends TabPanelProps {}

export function RouterTabPanel(props: RouterTabPanelProps) {
  const tab = ak.useTabContext();
  const tabId = ak.useStoreState(tab, "selectedId");
  return (
    <TabPanel tabId={tabId} {...props}>
      <div className="in-data-pending:opacity-50 transition-opacity">
        {props.children}
      </div>
    </TabPanel>
  );
}
