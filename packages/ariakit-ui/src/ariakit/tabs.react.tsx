import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { createRender } from "../react-utils/create-render.ts";
import {
  tab,
  tabGlider,
  tabLabel,
  tabList,
  tabPanel,
  tabSeparator,
  tabSlot,
  tabs,
} from "../styles/tabs.ts";

export interface TabsProps
  extends ak.RoleProps,
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
      <div {...tabs(variantProps)} {...rest} />
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
  return <ak.Tab {...tab(variantProps)} {...rest} />;
}

export interface TabListProps
  extends ak.TabListProps,
    VariantProps<typeof tabList> {
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
    <ak.TabList {...tabList(variantProps)} {...rest}>
      {Array.isArray(tabs)
        ? tabs.map((tab) => createRender(Tab, tab))
        : Object.entries(tabs ?? {}).map(([id, tab]) =>
            createRender(Tab, tab, { id }),
          )}
      {children}
    </ak.TabList>
  );
}

export interface TabSeparatorProps
  extends ComponentProps<"div">,
    VariantProps<typeof tabSeparator> {}

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 */
export function TabSeparator(props: TabSeparatorProps) {
  const [variantProps, rest] = splitProps(props, tabSeparator);
  return <div {...tabSeparator(variantProps)} {...rest} />;
}

export interface TabLabelProps
  extends ComponentProps<"div">,
    VariantProps<typeof tabLabel> {}

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 */
export function TabLabel(props: TabLabelProps) {
  const [variantProps, rest] = splitProps(props, tabLabel);
  return <div {...tabLabel(variantProps)} {...rest} />;
}

export interface TabSlotProps
  extends ComponentProps<"span">,
    VariantProps<typeof tabSlot> {}

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 */
export function TabSlot(props: TabSlotProps) {
  const [variantProps, rest] = splitProps(props, tabSlot);
  return <span {...tabSlot(variantProps)} {...rest} />;
}

export interface TabPanelProps
  extends ak.TabPanelProps,
    VariantProps<typeof tabPanel> {
  single?: boolean;
}

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 */
export function TabPanel({ single, ...props }: TabPanelProps) {
  const [variantProps, rest] = splitProps(props, tabPanel);
  const context = ak.useTabContext();
  const tabId = ak.useStoreState(context, "selectedId");
  return (
    <ak.TabPanel
      {...tabPanel(variantProps)}
      tabId={single ? tabId : undefined}
      {...rest}
    />
  );
}

export interface TabGliderProps
  extends ComponentProps<"div">,
    VariantProps<typeof tabGlider> {}

/**
 * @see https://ariakit.com/react/examples/tabs/ariakit-react/
 */
export function TabGlider(props: TabGliderProps) {
  const [variantProps, rest] = splitProps(props, tabGlider);
  return <div {...tabGlider(variantProps)} {...rest} />;
}
