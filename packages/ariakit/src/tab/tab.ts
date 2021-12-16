import { MouseEvent, useCallback, useEffect } from "react";
import { useEventCallback, useId, useLiveRef } from "ariakit-utils/hooks";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CompositeItemOptions,
  useCompositeItem,
} from "../composite/composite-item";
import { TabContext } from "./__utils";
import { TabState } from "./tab-state";

function getPanelId(tabs?: TabState["items"], id?: string) {
  if (!id) return;
  return tabs?.find((tab) => tab.id === id)?.panelId;
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
    panelId: panelIdProp,
    manual,
    accessibleWhenDisabled = true,
    ...props
  }) => {
    const id = useId(props.id);

    state = useStore(state || TabContext, [
      "items",
      "setSelectedId",
      "moves",
      "activeId",
      "selectedId",
    ]);

    const dimmed = props.disabled;

    const getItem = useCallback(
      (item) => {
        const nextItem = { ...item, panelId: panelIdProp, dimmed };
        if (props.getItem) {
          return props.getItem(nextItem);
        }
        return nextItem;
      },
      [panelIdProp, dimmed, props.getItem]
    );

    const isActiveItem = state?.activeId === id;
    const isActiveItemRef = useLiveRef(isActiveItem);

    useEffect(() => {
      if (dimmed) return;
      if (manual) return;
      // The tab should be selected only when moves is incremented. That is, by
      // calling state.move(), and not just state.setActiveId(). This prevents
      // screen reader users from getting trapped in the tab list.
      if (state?.moves && isActiveItemRef.current) {
        state.setSelectedId(id);
      }
    }, [dimmed, manual, state?.moves, state?.setSelectedId, id]);

    const onClickProp = useEventCallback(props.onClick);

    const onClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        state?.setSelectedId(id);
      },
      [onClickProp, state?.setSelectedId, id]
    );

    const panelId = panelIdProp || getPanelId(state?.items, id);

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
      accessibleWhenDisabled: accessibleWhenDisabled,
      getItem,
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

export type TabOptions<T extends As = "button"> = Omit<
  CompositeItemOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useTabState` hook. If not provided, the parent
   * `TabList` component's context will be used.
   */
  state?: TabState;
  /**
   * The id of the tab panel that is controlled by this tab. By default, this
   * value will be inferred based on the order of the tabs and the panels.
   */
  panelId?: string;
  /**
   * Whether the tab should be automatically selected when focused.
   * @default true
   */
  manual?: boolean;
};

export type TabProps<T extends As = "button"> = Props<TabOptions<T>>;
