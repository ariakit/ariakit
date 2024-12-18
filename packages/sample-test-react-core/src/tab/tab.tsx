import { disabledFromProps, invariant } from "@ariakit/core/utils/misc";
import type { ElementType, MouseEvent } from "react";
import { useCallback } from "react";
import type { CompositeItemOptions } from "../composite/composite-item.tsx";
import {
  CompositeItem,
  useCompositeItem,
} from "../composite/composite-item.tsx";
import { useEvent, useId } from "../utils/hooks.ts";
import { useStoreState } from "../utils/store.tsx";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useTabScopedContext } from "./tab-context.tsx";
import type { TabStore } from "./tab-store.ts";

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
  const shouldRegisterItem = defaultId ? props.shouldRegisterItem : false;

  const isActive = store.useState((state) => !!id && state.activeId === id);
  const selected = store.useState((state) => !!id && state.selectedId === id);
  const hasActiveItem = store.useState((state) => !!store.item(state.activeId));
  const canRegisterComposedItem = isActive || (selected && !hasActiveItem);
  const accessibleWhenDisabled =
    selected || (props.accessibleWhenDisabled ?? true);

  // If the tab is rendered within another composite widget with virtual focus,
  // such as combobox, it shouldn't be tabbable even if the tab store uses
  // roving tabindex. Otherwise, the focus will be trapped within the composite
  // widget.
  const isWithinVirtualFocusComposite = useStoreState(
    store.combobox || store.composite,
    "virtualFocus",
  );

  if (isWithinVirtualFocusComposite) {
    props = {
      ...props,
      tabIndex: -1,
    };
  }

  props = {
    id,
    role: "tab",
    "aria-selected": selected,
    "aria-controls": panelId || undefined,
    ...props,
    onClick,
  };

  // If the tab is rendered as part of another composite widget such as
  // combobox, we need to render it as a composite item. This ensures it's
  // recognized in the composite store and lets us manage arrow key navigation
  // to move focus to other composite items that might be rendered in a tab
  // panel. We only register the selected tab to maintain a vertical list
  // orientation.
  if (store.composite) {
    const defaultProps = {
      id,
      accessibleWhenDisabled,
      store: store.composite,
      shouldRegisterItem: canRegisterComposedItem && shouldRegisterItem,
      rowId: props.rowId,
      render: props.render,
    } satisfies CompositeItemOptions;
    props = {
      ...props,
      render: (
        <CompositeItem
          {...defaultProps}
          render={
            store.combobox && store.composite !== store.combobox ? (
              <CompositeItem {...defaultProps} store={store.combobox} />
            ) : (
              defaultProps.render
            )
          }
        />
      ),
    };
  }

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
