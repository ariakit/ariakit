import { CompositeOptions, useComposite } from "../composite/composite";
import { useWrapElement } from "../utils/hooks";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { TabContext } from "./tab-context";
import { TabStore } from "./tab-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a tab list element.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx
 * const store = useTabStore();
 * const props = useTabList({ store });
 * <Role {...props}>
 *   <Tab>Tab 1</Tab>
 *   <Tab>Tab 2</Tab>
 * </Role>
 * <TabPanel store={store}>Panel 1</TabPanel>
 * <TabPanel store={store}>Panel 2</TabPanel>
 * ```
 */
export const useTabList = createHook<TabListOptions>(({ store, ...props }) => {
  const orientation = store.useState((state) =>
    state.orientation === "both" ? undefined : state.orientation
  );

  props = useWrapElement(
    props,
    (element) => (
      <TabContext.Provider value={store}>{element}</TabContext.Provider>
    ),
    [store]
  );

  props = {
    role: "tablist",
    "aria-orientation": orientation,
    ...props,
  };

  props = useComposite({ store, ...props });

  return props;
});

/**
 * A component that renders a tab list element.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx
 * const tab = useTabStore();
 * <TabList store={tab}>
 *   <Tab>Tab 1</Tab>
 *   <Tab>Tab 2</Tab>
 * </TabList>
 * <TabPanel store={tab}>Panel 1</TabPanel>
 * <TabPanel store={tab}>Panel 2</TabPanel>
 * ```
 */
export const TabList = createComponent<TabListOptions>((props) => {
  const htmlProps = useTabList(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  TabList.displayName = "TabList";
}

export type TabListOptions<T extends As = "div"> = Omit<
  CompositeOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useTabStore` hook.
   */
  store: TabStore;
};

export type TabListProps<T extends As = "div"> = Props<TabListOptions<T>>;
