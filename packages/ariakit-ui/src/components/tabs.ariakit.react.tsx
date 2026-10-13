import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { Fragment, isValidElement } from "react";
import type { ComponentProps } from "react";
import { createRender } from "../react-utils/create-render.react.ts";
import { wrapsSlotChildren } from "../styles/control.ts";
import {
  tab,
  tabGlider,
  tabLabel,
  tabList,
  tabPanels,
  tabSeparator,
  tabSlot,
  tabs,
} from "../styles/tabs.ts";

export interface TabsProps
  extends
    ak.RoleProps,
    Pick<
      TabProviderProps,
      | "rtl"
      | "selectedId"
      | "setSelectedId"
      | "defaultSelectedId"
      | "selectOnMove"
    >,
    VariantProps<typeof tabs> {}

/**
 * Shares tab state and renders a frame for the tab list and panels.
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 *
 * @example
 * <Tabs>
 *   <TabList
 *     aria-label="Project"
 *     tabs={{ overview: "Overview", activity: "Activity" }}
 *   />
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 *
 * @example
 * <Tabs>
 *   <TabList aria-label="Project">
 *     <Tab id="overview">Overview</Tab>
 *     <Tab id="activity">Activity</Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function Tabs({
  rtl,
  selectedId,
  setSelectedId,
  defaultSelectedId,
  selectOnMove,
  ...props
}: TabsProps) {
  const [variantProps, rest] = splitProps(props, tabs);
  return (
    <TabProvider
      rtl={rtl}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      defaultSelectedId={defaultSelectedId}
      selectOnMove={selectOnMove}
    >
      <ak.Role {...tabs.jsx(variantProps)} {...rest} />
    </TabProvider>
  );
}

export interface TabProviderProps extends ak.TabProviderProps {}

/**
 * Shares tab selection and keyboard navigation state without a wrapper element.
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 *
 * @example
 * import { tabs } from "@ariakit/ui/styles/tabs";
 *
 * <TabProvider>
 *   <section {...tabs.jsx()}>
 *     <TabList aria-label="Project">
 *       <Tab id="overview">Overview</Tab>
 *       <Tab id="activity">Activity</Tab>
 *     </TabList>
 *     <TabPanels>
 *       <TabPanel tabId="overview">Project details</TabPanel>
 *       <TabPanel tabId="activity">Recent changes</TabPanel>
 *     </TabPanels>
 *   </section>
 * </TabProvider>
 */
export function TabProvider(props: TabProviderProps) {
  return <ak.TabProvider {...props} />;
}

export interface TabProps extends ak.TabProps, VariantProps<typeof tab> {}

/**
 * Renders a tab that selects its associated panel.
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 *
 * @example
 * <Tabs>
 *   <TabList aria-label="Project">
 *     <Tab id="overview">Overview</Tab>
 *     <Tab id="activity">Activity</Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function Tab(props: TabProps) {
  const [variantProps, rest] = splitProps(props, tab);
  return <ak.Tab {...tab.jsx(variantProps)} {...rest} />;
}

export interface TabListProps
  extends ak.TabListProps, VariantProps<typeof tabList> {
  tabs?:
    | Array<React.ReactNode | TabProps>
    | Record<string, React.ReactNode | TabProps>;
}

interface TextTabProps extends TabProps {
  children: string | number;
}

function isText(value: unknown): value is string | number {
  return typeof value === "string" || typeof value === "number";
}

function hasTextChildren(tab: React.ReactNode | TabProps): tab is TextTabProps {
  if (!tab || typeof tab !== "object") return false;
  if (isValidElement(tab)) return false;
  if (!("children" in tab)) return false;
  return isText(tab.children);
}

/**
 * Renders one entry of the `tabs` prop. Text, alone or as the `children` of a
 * props object, is a label, so it goes in a `TabLabel` and holds one line like
 * the label of a tab written as JSX.
 */
function renderTab(tab: React.ReactNode | TabProps, props?: TabProps) {
  if (isText(tab)) {
    return createRender(Tab, { children: <TabLabel>{tab}</TabLabel> }, props);
  }
  if (hasTextChildren(tab)) {
    const children = <TabLabel>{tab.children}</TabLabel>;
    return createRender(Tab, { ...tab, children }, props);
  }
  return createRender(Tab, tab, props);
}

/**
 * Renders a named tab list from children, an array, or a record of tabs.
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 *
 * @example
 * <Tabs>
 *   <TabList
 *     aria-label="Project"
 *     tabs={{ overview: "Overview", activity: "Activity" }}
 *   />
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 *
 * @example
 * <Tabs>
 *   <TabList
 *     aria-label="Project"
 *     tabs={[
 *       { id: "overview", children: "Overview" },
 *       { id: "activity", children: "Activity" },
 *     ]}
 *   />
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabList({ tabs, children, ...props }: TabListProps) {
  const [variantProps, rest] = splitProps(props, tabList);
  return (
    <ak.TabList {...tabList.jsx(variantProps)} {...rest}>
      {Array.isArray(tabs)
        ? tabs.map((tab, index) => {
            const element = renderTab(tab);
            // Prefixes prevent key/index collisions. Children.toArray clones
            // still cause missing-key warnings in react-dom 19.
            const key =
              element.key == null ? `index:${index}` : `key:${element.key}`;
            return <Fragment key={key}>{element}</Fragment>;
          })
        : Object.entries(tabs ?? {}).map(([id, tab]) => (
            <Fragment key={id}>{renderTab(tab, { id })}</Fragment>
          ))}
      {children}
    </ak.TabList>
  );
}

export interface TabSeparatorProps
  extends ComponentProps<"div">, VariantProps<typeof tabSeparator> {}

/**
 * Renders a visual divider between tabs.
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 *
 * @example
 * <Tabs>
 *   <TabList aria-label="Project">
 *     <Tab id="overview">Overview</Tab>
 *     <TabSeparator aria-hidden />
 *     <Tab id="activity">Activity</Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabSeparator(props: TabSeparatorProps) {
  const [variantProps, rest] = splitProps(props, tabSeparator);
  return <div {...tabSeparator.jsx(variantProps)} {...rest} />;
}

export interface TabLabelProps
  extends ComponentProps<"span">, VariantProps<typeof tabLabel> {}

/**
 * Renders tab label text with optional truncation.
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 *
 * @example
 * <Tabs>
 *   <TabList aria-label="Project">
 *     <Tab id="overview"><TabLabel>Overview</TabLabel></Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabLabel(props: TabLabelProps) {
  const [variantProps, rest] = splitProps(props, tabLabel);
  return <span {...tabLabel.jsx(variantProps)} {...rest} />;
}

export interface TabSlotProps
  extends ComponentProps<"span">, VariantProps<typeof tabSlot> {}

/**
 * Renders an icon, badge, or shortcut next to a tab label.
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 *
 * @example
 * <Tabs>
 *   <TabList aria-label="Project">
 *     <Tab id="activity">
 *       <TabLabel>Activity</TabLabel>
 *       <TabSlot $kind="badge">3 new</TabSlot>
 *     </Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="activity">Three recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabSlot(props: TabSlotProps) {
  const [variantProps, rest] = splitProps(props, tabSlot);
  const variants = tabSlot.getVariants(variantProps);
  return (
    <span {...tabSlot.jsx(variantProps)} {...rest}>
      {wrapsSlotChildren(variants.$kind) ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </span>
  );
}

export interface TabPanelsProps
  extends ComponentProps<"div">, VariantProps<typeof tabPanels> {}

/**
 * Renders the shared surface around tab panels.
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 *
 * @example
 * <Tabs>
 *   <TabList
 *     aria-label="Project"
 *     tabs={{ overview: "Overview", activity: "Activity" }}
 *   />
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabPanels(props: TabPanelsProps) {
  const [variantProps, rest] = splitProps(props, tabPanels);
  return <div {...tabPanels.jsx(variantProps)} {...rest} />;
}

export interface TabPanelProps extends ak.TabPanelProps {
  single?: boolean;
}

/**
 * Shows the content associated with a tab through its `tabId`.
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 *
 * @example
 * <Tabs>
 *   <TabList
 *     aria-label="Project"
 *     tabs={{ overview: "Overview", activity: "Activity" }}
 *   />
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabPanel({ single, ...props }: TabPanelProps) {
  const context = ak.useTabContext();
  const tabId = ak.useStoreState(props.store ?? context, "selectedId");
  return <ak.TabPanel tabId={single ? tabId : undefined} {...props} />;
}

export interface TabGliderProps
  extends ComponentProps<"div">, VariantProps<typeof tabGlider> {}

/**
 * Renders a moving selection indicator after the tabs in a tab list.
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 *
 * @example
 * <Tabs>
 *   <TabList
 *     aria-label="Project"
 *     tabs={{ overview: "Overview", activity: "Activity" }}
 *   >
 *     <TabGlider aria-hidden />
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabGlider(props: TabGliderProps) {
  const [variantProps, rest] = splitProps(props, tabGlider);
  return <div {...tabGlider.jsx(variantProps)} {...rest} />;
}
