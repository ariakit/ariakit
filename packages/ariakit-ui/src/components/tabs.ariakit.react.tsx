import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { Fragment } from "react";
import type { ComponentProps } from "react";
import {
  appendOptionalChild,
  createOptionalRender,
  createRender,
  getChildrenText,
  prependOptionalSeparator,
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
  /**
   * A separator before the tab, as `true`, an element, or `TabSeparator` props.
   * It renders as a sibling of the tab, hidden from assistive technologies.
   * Pass `!!index` when mapping tabs to separate each tab from the one before
   * it. Filter out the tabs that don't render first, so the first tab that
   * renders has index 0.
   */
  separator?: boolean | React.ReactElement | TabSeparatorProps;
}

/**
 * Renders a tab that selects its associated panel. Plain text and numbers go in
 * a `TabLabel` automatically, so the label turns heavier while the tab is
 * selected without moving the tabs after it.
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
 * @example
 * <TabList aria-label="Project">
 *   {pages.map((page, index) => (
 *     <Tab key={page.id} id={page.id} separator={!!index}>
 *       {page.label}
 *     </Tab>
 *   ))}
 * </TabList>
 */
export function Tab({ bar, separator, children, ...props }: TabProps) {
  const [variantProps, rest] = splitProps(props, tab);
  const barElement = createOptionalRender(TabBar, bar === true ? {} : bar);
  const text = getChildrenText(children);
  const label = text == null ? children : <TabLabel text={text} />;
  return prependOptionalSeparator(
    TabSeparator,
    separator,
    <ak.Tab {...tab.jsx(variantProps)} {...rest}>
      {appendOptionalChild(label, barElement)}
    </ak.Tab>,
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

/**
 * Renders one entry of the `tabs` prop. Text, alone or as the `children` of a
 * props object, goes in a `TabLabel` through `Tab`, like the text of a tab
 * written as JSX. Nullish and boolean entries, such as `canEdit && "Settings"`,
 * render no tab.
 */
function renderTab(tab: React.ReactNode | TabProps, props?: TabProps) {
  // createRender turns null into a default element, so empty entries must
  // return here. Otherwise they render unnamed tabs.
  if (tab == null) return null;
  if (typeof tab === "boolean") return null;
  return createRender(Tab, tab, props);
}

/**
 * Renders a named tab list from children, an array, or a record of tabs. With
 * `$kind="segmented"`, it stands on its own as a segmented control, outside
 * `Tabs`, and the tabs of the `tabs` prop take the same kind. Tabs written as
 * children need their own `$kind`.
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
  // The tabs of the shorthand have no props of their own to set the kind.
  const kindProps: TabProps | undefined =
    variantProps.$kind === "segmented" ? { $kind: "segmented" } : undefined;
  return (
    <ak.TabList {...tabList.jsx(variantProps)} {...rest}>
      {Array.isArray(tabs)
        ? tabs.map((tab, index) => {
            const element = renderTab(tab, kindProps);
            if (!element) return null;
            // Prefixes prevent key/index collisions. Children.toArray clones
            // still cause missing-key warnings in react-dom 19.
            const key =
              element.key == null ? `index:${index}` : `key:${element.key}`;
            return <Fragment key={key}>{element}</Fragment>;
          })
        : Object.entries(tabs ?? {}).map(([id, tab]) => (
            <Fragment key={id}>{renderTab(tab, { ...kindProps, id })}</Fragment>
          ))}
      {children}
    </ak.TabList>
  );
}

export interface TabSeparatorProps
  extends ComponentProps<"div">, VariantProps<typeof tabSeparator> {}

/**
 * Renders a visual divider between tabs. Pass it, or its props, to the
 * `separator` prop of `Tab` so it renders before the tab, hidden from assistive
 * technologies.
 * @example
 * <Tabs>
 *   <TabList aria-label="Project">
 *     <Tab id="overview">Overview</Tab>
 *     <Tab id="activity" separator>Activity</Tab>
 *     <Tab id="members" separator={<TabSeparator $kind="slash" />}>
 *       Members
 *     </Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *     <TabPanel tabId="members">Team members</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabSeparator(props: TabSeparatorProps) {
  const [variantProps, rest] = splitProps(props, tabSeparator);
  return <div {...tabSeparator.jsx(variantProps)} {...rest} />;
}

export interface TabLabelProps
  extends ComponentProps<"span">, VariantProps<typeof tabLabel> {
  /**
   * The label text, rendered when `children` is omitted. Defaults to the text
   * of `children` that are only text and numbers. A selected tab shows its
   * label in a heavier weight only when the label has this text, because the
   * text reserves the heavier width in advance and keeps the tab size. Keep it
   * equal to the visible text of custom `children`.
   */
  text?: string;
}

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
 * @example
 * <Tabs>
 *   <TabList aria-label="Repository">
 *     <Tab id="api">
 *       <TabLabel text="API">
 *         <abbr title="Application programming interface">API</abbr>
 *       </TabLabel>
 *     </Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="api">Endpoints and types</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabLabel({ text, children = text, ...props }: TabLabelProps) {
  const [variantProps, rest] = splitProps(props, tabLabel);
  return (
    <span
      data-text={text ?? getChildrenText(children)}
      {...tabLabel.jsx(variantProps)}
      {...rest}
    >
      {children}
    </span>
  );
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
