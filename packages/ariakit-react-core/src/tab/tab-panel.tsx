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
import type { Props2 } from "../utils/types.js";
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
export const useTabPanel = createHook2<TagName, TabPanelOptions>(
  function useTabPanel({
    store,
    tabId: tabIdProp,
    getItem: getItemProp,
    ...props
  }) {
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
 * Renders a tab panel element that's controlled by a
 * [`Tab`](https://ariakit.org/reference/tab) component.
 *
 * If the [`tabId`](https://ariakit.org/reference/tab-panel#tabid) prop isn't
 * provided, the tab panel will automatically associate with a
 * [`Tab`](https://ariakit.org/reference/tab) based on its position in the DOM.
 * Alternatively, you can render a single tab panel with a dynamic
 * [`tabId`](https://ariakit.org/reference/tab-panel#tabid) value pointing to
 * the selected tab.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx {6,7}
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
export const TabPanel = forwardRef(function TabPanel(props: TabPanelProps) {
  const htmlProps = useTabPanel(props);
  return createElement(TagName, htmlProps);
});

export interface TabPanelOptions<T extends ElementType = TagName>
  extends FocusableOptions<T>,
    CollectionItemOptions<T>,
    Omit<DisclosureContentOptions<T>, "store" | "unmountOnHide"> {
  /**
   * Object returned by the
   * [`useTabStore`](https://ariakit.org/reference/use-tab-store) hook. If not
   * provided, the closest
   * [`TabProvider`](https://ariakit.org/reference/tab-provider) component's
   * context will be used.
   */
  store?: TabStore;
  /**
   * The [`id`](https://ariakit.org/reference/tab#id) of the tab controlling
   * this panel. This connection is used to assign the `aria-labelledby`
   * attribute to the tab panel and to determine if the tab panel should be
   * visible.
   *
   * This link is automatically established by matching the order of
   * [`Tab`](https://ariakit.org/reference/tab) and
   * [`TabPanel`](https://ariakit.org/reference/tab-panel) elements in the DOM.
   * If you're rendering a single tab panel, this can be set to a dynamic value
   * that refers to the selected tab.
   *
   * Live examples:
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   * - [Tab with React Router](https://ariakit.org/examples/tab-react-router)
   */
  tabId?: string | null;
}

export type TabPanelProps<T extends ElementType = TagName> = Props2<
  T,
  TabPanelOptions<T>
>;
