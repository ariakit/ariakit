import { MouseEvent, useCallback } from "react";
import { useEvent, useId } from "ariakit-utils/hooks";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CompositeItemOptions,
  useCompositeItem,
} from "../composite/composite-item";
import { TabContext } from "./__utils";
import { TabState } from "./tab-state";

function getPanelId(panels?: TabState["panels"], id?: string) {
  if (!id) return;
  return panels?.items.find((panel) => panel.tabId === id)?.id;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a tab element. The underlying element must be
 * wrapped in a `TabList` component or a component that implements the
 * `useTabList` props.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx
 * const state = useTabState();
 * const props = useTab({ state });
 * <TabList state={state}>
 *   <Role {...props}>Tab 1</Role>
 * </TabList>
 * <TabPanel state={state}>Panel 1</TabPanel>
 * ```
 */
export const useTab = createHook<TabOptions>(
  ({
    state,
    accessibleWhenDisabled = true,
    getItem: getItemProp,
    ...props
  }) => {
    // Keep a reference to the default id so we can wait before all tabs have
    // been assigned an id before registering them in the state. See
    // https://github.com/ariakit/ariakit/issues/1721
    const defaultId = useId();
    const id = props.id || defaultId;

    state = useStore(state || TabContext, [
      useCallback((s: TabState) => id && s.selectedId === id, [id]),
      "panels",
      "setSelectedId",
    ]);

    const dimmed = props.disabled;

    const getItem = useCallback<NonNullable<CompositeItemOptions["getItem"]>>(
      (item) => {
        const nextItem = { ...item, dimmed };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [dimmed, getItemProp]
    );

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      state?.setSelectedId(id);
    });

    const panelId = getPanelId(state?.panels, id);

    props = {
      id,
      role: "tab",
      "aria-selected": !!id && state?.selectedId === id,
      "aria-controls": panelId || undefined,
      ...props,
      onClick,
    };

    props = useCompositeItem({
      state,
      ...props,
      accessibleWhenDisabled,
      getItem,
      shouldRegisterItem: !!defaultId ? props.shouldRegisterItem : false,
    });

    return props;
  }
);

/**
 * A component that renders a tab element. The underlying element must be
 * wrapped in a `TabList` component.
 * @see https://ariakit.org/components/tab
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
export const Tab = createMemoComponent<TabOptions>((props) => {
  const htmlProps = useTab(props);
  return createElement("button", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Tab.displayName = "Tab";
}

export type TabOptions<T extends As = "button"> = Omit<
  CompositeItemOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useTabState` hook. If not provided, the parent
   * `TabList` component's context will be used.
   */
  state?: TabState;
};

export type TabProps<T extends As = "button"> = Props<TabOptions<T>>;
