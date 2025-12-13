"use client";
import * as ak from "@ariakit/react";
import type { Route } from "next";
import type { LinkProps } from "next/link";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import type { TabPanelProps, TabsProps } from "site/ariakit/tabs.react.tsx";
import { Tab, TabPanel, Tabs } from "site/ariakit/tabs.react.tsx";

export * from "site/ariakit/tabs.react.tsx";

export interface RouterTabsProps
  extends Omit<
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

export interface RouterTabProps extends LinkProps<Route> {}

export function RouterTab({ children, ...props }: RouterTabProps) {
  const id = props.href.toString();
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
