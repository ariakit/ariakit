import { useCallback, useEffect, useRef, useState } from "react";
import { getAllTabbableIn } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import type { CollectionItemOptions } from "../collection/collection-item.js";
import { useCollectionItem } from "../collection/collection-item.js";
import type { DisclosureContentOptions } from "../disclosure/disclosure-content.jsx";
import { useDisclosureContent } from "../disclosure/disclosure-content.jsx";
import { useDisclosureStore } from "../disclosure/disclosure-store.js";
import type { FocusableOptions } from "../focusable/focusable.js";
import { useFocusable } from "../focusable/focusable.js";
import { useId, useMergeRefs, useWrapElement } from "../utils/hooks.js";
import {
  createComponent,
  createElement,
  createHook,
} from "../utils/system.jsx";
import type { As, Props } from "../utils/types.js";
import {
  TabScopedContextProvider,
  useTabProviderContext,
} from "./tab-context.jsx";
import type { TabStore } from "./tab-store.js";

/**
 * Returns props to create a `TabPanel` component.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx
 * const store = useTabStore();
 * const props = useTabPanel({ store });
 * <TabList store={store}>
 *   <Tab>Tab 1</Tab>
 * </TabList>
 * <Role {...props}>Panel 1</Role>
 * ```
 */
export const useTabPanel = createHook<TabPanelOptions>(
  ({ store, tabId: tabIdProp, getItem: getItemProp, ...props }) => {
    const context = useTabProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "TabPanel must receive a `store` prop or be wrapped in a TabProvider component.",
    );

    const ref = useRef<HTMLDivElement>(null);
    const id = useId(props.id);

    const [hasTabbableChildren, setHasTabbableChildren] = useState(false);

    useEffect(() => {
      const element = ref.current;
      if (!element) return;
      const tabbable = getAllTabbableIn(element);
      setHasTabbableChildren(!!tabbable.length);
    }, []);

    const getItem = useCallback<NonNullable<CollectionItemOptions["getItem"]>>(
      (item) => {
        const nextItem = { ...item, id: id || item.id, tabId: tabIdProp };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, tabIdProp, getItemProp],
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

    const tabId = store.panels.useState(
      () => tabIdProp || store?.panels.item(id)?.tabId,
    );
    const open = store.useState(
      (state) => !!tabId && state.selectedId === tabId,
    );

    props = {
      id,
      role: "tabpanel",
      "aria-labelledby": tabId || undefined,
      ...props,
      ref: useMergeRefs(ref, props.ref),
    };

    const disclosure = useDisclosureStore({ open });

    props = useFocusable({ focusable: !hasTabbableChildren, ...props });
    props = useDisclosureContent({ store: disclosure, ...props });
    props = useCollectionItem({ store: store.panels, ...props, getItem });

    return props;
  },
);

/**
 * Renders a tab panel element.
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
export const TabPanel = createComponent<TabPanelOptions>((props) => {
  const htmlProps = useTabPanel(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  TabPanel.displayName = "TabPanel";
}

export interface TabPanelOptions<T extends As = "div">
  extends FocusableOptions<T>,
    CollectionItemOptions<T>,
    Omit<DisclosureContentOptions<T>, "store"> {
  /**
   * Object returned by the `useTabStore` hook.
   */
  store?: TabStore;
  /**
   * The id of the tab that controls this panel. By default, this value will
   * be inferred based on the order of the tabs and the panels.
   *
   * Live examples:
   * - [Tab with React Router](https://ariakit.org/examples/tab-react-router)
   */
  tabId?: string | null;
}

export type TabPanelProps<T extends As = "div"> = Props<TabPanelOptions<T>>;
