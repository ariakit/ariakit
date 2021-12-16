import { useCallback, useEffect, useRef, useState } from "react";
import { getAllTabbableIn } from "ariakit-utils/focus";
import { useForkRef, useId } from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CollectionItemOptions,
  useCollectionItem,
} from "../collection/collection-item";
import {
  DisclosureContentOptions,
  useDisclosureContent,
  useDisclosureState,
} from "../disclosure";
import { FocusableOptions, useFocusable } from "../focusable";
import { TabState } from "./tab-state";

function getTabId(panels: TabState["panels"], id?: string) {
  if (!id) return;
  return panels.items.find((panel) => panel.id === id)?.tabId;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a tab panel element.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx
 * const state = useTabState();
 * const props = useTabPanel({ state });
 * <TabList state={state}>
 *   <Tab>Tab 1</Tab>
 * </TabList>
 * <Role {...props}>Panel 1</Role>
 * ```
 */
export const useTabPanel = createHook<TabPanelOptions>(
  ({ state, tabId: tabIdProp, ...props }) => {
    const ref = useRef<HTMLDivElement>(null);
    const id = useId(props.id);

    const [hasTabbableChildren, setHasTabbableChildren] = useState(false);

    useEffect(() => {
      const element = ref.current;
      if (!element) return;
      const tabbable = getAllTabbableIn(element);
      setHasTabbableChildren(!!tabbable.length);
    }, []);

    const getItem = useCallback(
      (item) => {
        const nextItem = { ...item, id, tabId: tabIdProp };
        if (props.getItem) {
          return props.getItem(nextItem);
        }
        return nextItem;
      },
      [id, tabIdProp, props.getItem]
    );

    const tabId = tabIdProp || getTabId(state.panels, id);
    const visible = !!tabId && state.selectedId === tabId;

    props = {
      id,
      role: "tabpanel",
      "aria-labelledby": tabId || undefined,
      ...props,
      ref: useForkRef(ref, props.ref),
    };

    const disclosure = useDisclosureState({ visible });

    props = useFocusable({ focusable: !hasTabbableChildren, ...props });
    props = useDisclosureContent({ state: disclosure, ...props });
    props = useCollectionItem({
      state: state.panels,
      ...props,
      getItem,
      shouldRegisterItem: !!id ? props.shouldRegisterItem : false,
    });

    return props;
  }
);

/**
 * A component that renders a tab panel element.
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
export const TabPanel = createComponent<TabPanelOptions>((props) => {
  const htmlProps = useTabPanel(props);
  return createElement("div", htmlProps);
});

export type TabPanelOptions<T extends As = "div"> = FocusableOptions<T> &
  Omit<CollectionItemOptions, "state"> &
  Omit<DisclosureContentOptions<T>, "state"> & {
    /**
     * Object returned by the `useTabState` hook.
     */
    state: TabState;
    /**
     * The id of the tab that controls this panel. By default, this value will
     * be inferred based on the order of the tabs and the panels.
     */
    tabId?: string;
  };

export type TabPanelProps<T extends As = "div"> = Props<TabPanelOptions<T>>;
