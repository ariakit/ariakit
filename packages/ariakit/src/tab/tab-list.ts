import {
  createHook,
  createComponent,
  createElement,
} from "ariakit-utils/system";
import { useStoreProvider } from "ariakit-utils/store";
import { As, Props } from "ariakit-utils/types";
import { CompositeOptions, useComposite } from "../composite/composite";
import { TabState } from "./tab-state";
import { TabContext } from "./__utils";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a tab list element.
 * @see https://ariakit.org/docs/tab
 * @example
 * ```jsx
 * const state = useTabState();
 * const props = useTabList({ state });
 * <Role {...props}>
 *   <Tab>Tab 1</Tab>
 *   <Tab>Tab 2</Tab>
 * </Role>
 * <TabPanel state={state}>Panel 1</TabPanel>
 * <TabPanel state={state}>Panel 2</TabPanel>
 * ```
 */
export const useTabList = createHook<TabListOptions>(({ state, ...props }) => {
  const orientation =
    state.orientation === "both" ? undefined : state.orientation;

  props = {
    role: "tablist",
    "aria-orientation": orientation,
    ...props,
  };

  props = useStoreProvider({ state, ...props }, TabContext);
  props = useComposite({ state, ...props });

  return props;
});

/**
 * A component that renders a tab list element.
 * @see https://ariakit.org/docs/tab
 * @example
 * ```jsx
 * const tab = useTabState();
 * <TabList state={tab}>
 *   <Tab>Tab 1</Tab>
 *   <Tab>Tab 2</Tab>
 * </TabList>
 * <TabPanel state={tab}>Panel 1</TabPanel>
 * <TabPanel state={tab}>Panel 2</TabPanel>
 * ```
 */
export const TabList = createComponent<TabListOptions>((props) => {
  const htmlProps = useTabList(props);
  return createElement("div", htmlProps);
});

export type TabListOptions<T extends As = "div"> = Omit<
  CompositeOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useTabState` hook.
   */
  state: TabState;
};

export type TabListProps<T extends As = "div"> = Props<TabListOptions<T>>;
