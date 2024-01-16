import type { MouseEvent } from "react";
import { useCallback } from "react";
import { disabledFromProps, invariant } from "@ariakit/core/utils/misc";
import type { CompositeItemOptions } from "../composite/composite-item.js";
import { useCompositeItem } from "../composite/composite-item.js";
import { useEvent, useId } from "../utils/hooks.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { Props2 } from "../utils/types.js";
import { useTabScopedContext } from "./tab-context.js";
import type { TabStore } from "./tab-store.js";

/**
 * Returns props to create a `Tab` component.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx
 * const store = useTabStore();
 * const props = useTab({ store });
 * <TabList store={store}>
 *   <Role {...props}>Tab 1</Role>
 * </TabList>
 * <TabPanel store={store}>Panel 1</TabPanel>
 * ```
 */
export const useTab = createHook2<TagName, TabOptions>(
  ({
    store,
    accessibleWhenDisabled = true,
    getItem: getItemProp,
    ...props
  }) => {
    const context = useTabScopedContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "Tab must be wrapped in a TabList component.",
    );

    // Keep a reference to the default id so we can wait before all tabs have
    // been assigned an id before registering them in the store. See
    // https://github.com/ariakit/ariakit/issues/1721
    const defaultId = useId();
    const id = props.id || defaultId;
    const dimmed = disabledFromProps(props);

    const getItem = useCallback<NonNullable<CompositeItemOptions["getItem"]>>(
      (item) => {
        const nextItem = { ...item, dimmed };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [dimmed, getItemProp],
    );

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      store?.setSelectedId(id);
    });

    const panelId = store.panels.useState(
      (state) => state.items.find((item) => item.tabId === id)?.id,
    );
    const selected = store.useState((state) => !!id && state.selectedId === id);

    props = {
      id,
      role: "tab",
      "aria-selected": selected,
      "aria-controls": panelId || undefined,
      ...props,
      onClick,
    };

    props = useCompositeItem({
      store,
      ...props,
      accessibleWhenDisabled,
      getItem,
      shouldRegisterItem: !!defaultId ? props.shouldRegisterItem : false,
    });

    return props;
  },
);

/**
 * Renders a tab element inside a
 * [`TabList`](https://ariakit.org/reference/tab-list) wrapper.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx {3,4}
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
export const Tab = createMemoComponent<TabOptions>((props) => {
  const htmlProps = useTab(props);
  return createElement(TagName, htmlProps);
});

export interface TabOptions<T extends ElementType = TagName>
  extends CompositeItemOptions<T> {
  /**
   * Object returned by the
   * [`useTabStore`](https://ariakit.org/reference/use-tab-store) hook. If not
   * provided, the closest [`TabList`](https://ariakit.org/reference/tab-list)
   * component's context will be used.
   */
  store?: TabStore;
  /**
   * @default true
   */
  accessibleWhenDisabled?: CompositeItemOptions["accessibleWhenDisabled"];
}

export type TabProps<T extends ElementType = TagName> = Props2<
  T,
  TabOptions<T>
>;
