import * as ak from "@ariakit/react";
import clsx from "clsx";
import type * as React from "react";
import { createRender } from "../react-utils/create-render.ts";

export interface TabsProps
  extends ak.RoleProps,
    Pick<
      TabProviderProps,
      "selectedId" | "setSelectedId" | "defaultSelectedId"
    > {}

/**
 * High-level tab that wires provider, button, label and popover.
 * @example
 * <Tab popover={{ portal: true }}>
 *   <TabItem value="apple" />
 *   <TabItem value="orange" />
 * </Tab>
 * @example
 * <Tab
 *   label="Fruit"
 *   items={[
 *     { value: "apple" },
 *     { value: "orange" },
 *   ]}
 * />
 */
export function Tabs({
  selectedId,
  setSelectedId,
  defaultSelectedId,
  ...props
}: TabsProps) {
  return (
    <div
      {...props}
      className={clsx(
        "ak-tabs ak-layer ak-frame-container/0 ak-border ak-tabs-lol border-0! overflow-visible",
        props.className,
      )}
    >
      <TabProvider
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        defaultSelectedId={defaultSelectedId}
        {...props}
      />
    </div>
  );
}

export interface TabProviderProps extends ak.TabProviderProps {}

export function TabProvider(props: TabProviderProps) {
  return <ak.TabProvider {...props} />;
}

export interface TabListProps extends ak.TabListProps {
  tabs?:
    | Array<React.ReactNode | TabProps>
    | Record<string, React.ReactNode | TabProps>;
}

export function TabList({ tabs, children, ...props }: TabListProps) {
  return (
    <ak.TabList {...props} className={clsx("ak-tab-list", props.className)}>
      {Array.isArray(tabs)
        ? tabs.map((tab) => createRender(Tab, tab))
        : Object.entries(tabs ?? {}).map(([id, tab]) =>
            createRender(Tab, tab, { id }),
          )}
      {children}
    </ak.TabList>
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
