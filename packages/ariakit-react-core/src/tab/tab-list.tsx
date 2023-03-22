import { CompositeOptions, useComposite } from "../composite/composite.jsx";
import { useWrapElement } from "../utils/hooks.js";
import {
  createComponent,
  createElement,
  createHook,
} from "../utils/system.jsx";
import { As, Props } from "../utils/types.js";
import { TabContext } from "./tab-context.js";
import { TabStore } from "./tab-store.js";

/**
 * Returns props to create a `TabList` component.
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
 * Renders a tab list element.
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

export interface TabListOptions<T extends As = "div">
  extends CompositeOptions<T> {
  /**
   * Object returned by the `useTabStore` hook.
   */
  store: TabStore;
}

export type TabListProps<T extends As = "div"> = Props<TabListOptions<T>>;
