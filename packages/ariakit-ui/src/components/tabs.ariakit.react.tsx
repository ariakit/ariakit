import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { Fragment, isValidElement } from "react";
import type { ComponentProps } from "react";
import {
  appendOptionalChild,
  createOptionalRender,
  createRender,
} from "../react-utils/create-render.react.ts";
import {
  tab,
  tabBar,
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
 * Use `Tabs` to include the styled parent for the tab list and panels.
 */
export function TabProvider(props: TabProviderProps) {
  return <ak.TabProvider {...props} />;
}

export interface TabProps extends ak.TabProps, VariantProps<typeof tab> {
  /**
   * A bar that marks the tab while selected, as `true`, an element, or `TabBar`
   * props. Rendered after the children. Use it with `flat` or `bevel` tabs.
   * Children of a `render` element replace it, so pass them to the tab instead.
   */
  bar?: boolean | React.ReactElement | TabBarProps;
}

/**
 * Renders a tab that selects its associated panel.
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
export function Tab({ bar, ...props }: TabProps) {
  const [variantProps, rest] = splitProps(props, tab);
  const barElement = createOptionalRender(TabBar, bar === true ? {} : bar);
  return (
    <ak.Tab {...tab.jsx(variantProps)} {...rest}>
      {appendOptionalChild(rest.children, barElement)}
    </ak.Tab>
  );
}

export interface TabListProps
  extends ak.TabListProps, VariantProps<typeof tabList> {
  /**
   * Tabs to render before `children`. Accepts content, `Tab` props, or elements
   * that replace tabs. Record keys supply default tab IDs. Text labels are
   * wrapped in `TabLabel`.
   */
  tabs?:
    | Array<React.ReactNode | TabProps>
    | Record<string, React.ReactNode | TabProps>;
}

interface TextTabProps extends TabProps {
  /** Text to wrap in a `TabLabel`. */
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
 * the label of a tab written as JSX. Nullish and boolean entries, such as
 * `canEdit && "Settings"`, render no tab.
 */
function renderTab(tab: React.ReactNode | TabProps, props?: TabProps) {
  // createRender turns null into a default element, so empty entries must
  // return here. Otherwise they render unnamed tabs.
  if (tab == null) return null;
  if (typeof tab === "boolean") return null;
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
            if (!element) return null;
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
 * @example
 * <Tabs>
 *   <TabList aria-label="Project">
 *     <Tab id="activity">
 *       <TabLabel>Activity</TabLabel>
 *       <TabSlot $kind="box">
 *         <Badge $kind="solid">3 new</Badge>
 *       </TabSlot>
 *     </Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="activity">Three recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabSlot(props: TabSlotProps) {
  const [variantProps, rest] = splitProps(props, tabSlot);
  return <span {...tabSlot.jsx(variantProps)} {...rest} />;
}

export interface TabPanelsProps
  extends ComponentProps<"div">, VariantProps<typeof tabPanels> {}

/**
 * Renders the shared surface around tab panels.
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
  /**
   * Associates one panel with the selected tab. Update its children to match
   * the selected tab. An explicit `tabId` takes precedence. Defaults to
   * `false`.
   */
  single?: boolean;
}

/**
 * Shows the content associated with a tab through its `tabId`.
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

export interface TabBarProps
  extends ComponentProps<"span">, VariantProps<typeof tabBar> {}

/**
 * A thin bar that marks the selected tab. Pass it, or its props, to the `bar`
 * prop of `Tab` so it renders as the last child.
 * @example
 * <Tabs>
 *   <TabList aria-label="Project">
 *     <Tab id="overview" $kind="flat" bar>Overview</Tab>
 *     <Tab id="activity" $kind="flat" bar>Activity</Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabBar(props: TabBarProps) {
  const [variantProps, rest] = splitProps(props, tabBar);
  return <span aria-hidden {...tabBar.jsx(variantProps)} {...rest} />;
}
