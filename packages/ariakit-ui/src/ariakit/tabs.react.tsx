import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { Fragment } from "react";
import type { ComponentProps } from "react";
import { createRender } from "../react-utils/create-render.ts";
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
      "selectedId" | "setSelectedId" | "defaultSelectedId"
    >,
    VariantProps<typeof tabs> {}

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 */
export function Tabs({
  selectedId,
  setSelectedId,
  defaultSelectedId,
  ...props
}: TabsProps) {
  const [variantProps, rest] = splitProps(props, tabs);
  return (
    <TabProvider
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      defaultSelectedId={defaultSelectedId}
    >
      <ak.Role {...tabs.jsx(variantProps)} {...rest} />
    </TabProvider>
  );
}

export interface TabProviderProps extends ak.TabProviderProps {}

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 */
export function TabProvider(props: TabProviderProps) {
  return <ak.TabProvider {...props} />;
}

export interface TabProps extends ak.TabProps, VariantProps<typeof tab> {}

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
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

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 */
export function TabList({ tabs, children, ...props }: TabListProps) {
  const [variantProps, rest] = splitProps(props, tabList);
  return (
    <ak.TabList {...tabList.jsx(variantProps)} {...rest}>
      {Array.isArray(tabs)
        ? tabs.map((tab, index) => {
            const element = createRender(Tab, tab);
            // A keyed element entry keeps its own key so reordering
            // reconciles by identity; unkeyed entries fall back to their
            // position. The prefixes keep the two key sources from
            // colliding (an explicit key "0" vs index 0). Children.toArray
            // would provide the same semantics, but react-dom 19 still
            // emits a missing-key warning for its cloned entries.
            const key =
              element.key == null ? `index:${index}` : `key:${element.key}`;
            return <Fragment key={key}>{element}</Fragment>;
          })
        : Object.entries(tabs ?? {}).map(([id, tab]) => (
            <Fragment key={id}>{createRender(Tab, tab, { id })}</Fragment>
          ))}
      {children}
    </ak.TabList>
  );
}

export interface TabSeparatorProps
  extends ComponentProps<"div">, VariantProps<typeof tabSeparator> {}

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 */
export function TabSeparator(props: TabSeparatorProps) {
  const [variantProps, rest] = splitProps(props, tabSeparator);
  return <div {...tabSeparator.jsx(variantProps)} {...rest} />;
}

export interface TabLabelProps
  extends ComponentProps<"div">, VariantProps<typeof tabLabel> {}

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 */
export function TabLabel(props: TabLabelProps) {
  const [variantProps, rest] = splitProps(props, tabLabel);
  return <div {...tabLabel.jsx(variantProps)} {...rest} />;
}

export interface TabSlotProps
  extends ComponentProps<"span">, VariantProps<typeof tabSlot> {}

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 */
export function TabSlot(props: TabSlotProps) {
  const [variantProps, rest] = splitProps(props, tabSlot);
  return <span {...tabSlot.jsx(variantProps)} {...rest} />;
}

export interface TabPanelsProps
  extends ComponentProps<"div">, VariantProps<typeof tabPanels> {}

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 */
export function TabPanels(props: TabPanelsProps) {
  const [variantProps, rest] = splitProps(props, tabPanels);
  return <div {...tabPanels.jsx(variantProps)} {...rest} />;
}

export interface TabPanelProps extends ak.TabPanelProps {
  single?: boolean;
}

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 */
export function TabPanel({ single, ...props }: TabPanelProps) {
  const context = ak.useTabContext();
  const tabId = ak.useStoreState(context, "selectedId");
  return <ak.TabPanel tabId={single ? tabId : undefined} {...props} />;
}

export interface TabGliderProps
  extends ComponentProps<"div">, VariantProps<typeof tabGlider> {}

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 */
export function TabGlider(props: TabGliderProps) {
  const [variantProps, rest] = splitProps(props, tabGlider);
  return <div {...tabGlider.jsx(variantProps)} {...rest} />;
}
