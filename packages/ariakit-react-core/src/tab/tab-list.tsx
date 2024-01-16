import { invariant } from "@ariakit/core/utils/misc";
import type { CompositeOptions } from "../composite/composite.js";
import { useComposite } from "../composite/composite.js";
import { useWrapElement } from "../utils/hooks.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import {
  TabScopedContextProvider,
  useTabProviderContext,
} from "./tab-context.js";
import type { TabStore } from "./tab-store.js";

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
export const useTabList = createHook2<TagName, TabListOptions>(
  ({ store, ...props }) => {
    const context = useTabProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "TabList must receive a `store` prop or be wrapped in a TabProvider component.",
    );

    const orientation = store.useState((state) =>
      state.orientation === "both" ? undefined : state.orientation,
    );

    props = useWrapElement(
      props,
      (element) => (
        <TabScopedContextProvider value={store}>
          {element}
        </TabScopedContextProvider>
      ),
      [store],
    );

    props = {
      role: "tablist",
      "aria-orientation": orientation,
      ...props,
    };

    props = useComposite({ store, ...props });

    return props;
  },
);

/**
 * Renders a composite tab list wrapper for
 * [`Tab`](https://ariakit.org/reference/tab) elements.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx {2-5}
 * <TabProvider>
 *   <TabList>
 *     <Tab>Tab 1</Tab>
 *     <Tab>Tab 2</Tab>
 *   </TabList>
 *   <TabPanel>Panel 1</TabPanel>
 *   <TabPanel>Panel 2</TabPanel>
 * </TabProvider>
 * ```
 */
export const TabList = forwardRef(function TabList(props: TabListProps) {
  const htmlProps = useTabList(props);
  return createElement(TagName, htmlProps);
});

export interface TabListOptions<T extends ElementType = TagName>
  extends CompositeOptions<T> {
  /**
   * Object returned by the
   * [`useTabStore`](https://ariakit.org/reference/use-tab-store) hook. If not
   * provided, the closest
   * [`TabProvider`](https://ariakit.org/reference/tab-provider) component's
   * context will be used.
   */
  store?: TabStore;
}

export type TabListProps<T extends ElementType = TagName> = Props2<
  T,
  TabListOptions<T>
>;
