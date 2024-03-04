import type { ElementType, MouseEvent } from "react";
import { useCallback } from "react";
import { disabledFromProps, invariant } from "@ariakit/core/utils/misc";
import type { CompositeItemOptions } from "../composite/composite-item.jsx";
import {
  CompositeItem,
  useCompositeItem,
} from "../composite/composite-item.jsx";
import { useEvent, useId, useWrapElement } from "../utils/hooks.js";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.jsx";
import type { Props } from "../utils/types.js";
import { useTabScopedContext } from "./tab-context.jsx";
import type { TabStore } from "./tab-store.js";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

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
export const useTab = createHook<TagName, TabOptions>(function useTab({
  store,
  accessibleWhenDisabled = true,
  getItem: getItemProp,
  ...props
}) {
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

  const onClick = useEvent((event: MouseEvent<HTMLType>) => {
    onClickProp?.(event);
    if (event.defaultPrevented) return;
    store?.setSelectedId(id);
  });

  const panelId = store.panels.useState(
    (state) => state.items.find((item) => item.tabId === id)?.id,
  );
  const selected = store.useState((state) => !!id && state.selectedId === id);
  const shouldRegisterItem = !!defaultId ? props.shouldRegisterItem : false;

  props = useWrapElement(
    props,
    (element) => {
      if (!store?.composite) return element;
      // If the tab is rendered as part of another composite widget such as
      // combobox, we need to render it as a composite item. This ensures it's
      // recognized in the composite store and lets us manage arrow key
      // navigation to move focus to other composite items that might be
      // rendered in a tab panel. We only register the selected tab to maintain
      // a vertical list orientation.
      return (
        <CompositeItem
          id={id}
          render={element}
          store={store.composite}
          shouldRegisterItem={selected && shouldRegisterItem}
        />
      );
    },
    [store, id, selected, shouldRegisterItem],
  );

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
    shouldRegisterItem,
  });

  return props;
});

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
export const Tab = memo(
  forwardRef(function Tab(props: TabProps) {
    const htmlProps = useTab(props);
    return createElement(TagName, htmlProps);
  }),
);

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

export type TabProps<T extends ElementType = TagName> = Props<T, TabOptions<T>>;
