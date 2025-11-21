import { getAllTabbableIn } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import type { ElementType, KeyboardEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CollectionItemOptions } from "../collection/collection-item.tsx";
import { useCollectionItem } from "../collection/collection-item.tsx";
import type { DisclosureContentOptions } from "../disclosure/disclosure-content.tsx";
import { useDisclosureContent } from "../disclosure/disclosure-content.tsx";
import { useDisclosureStore } from "../disclosure/disclosure-store.ts";
import type { FocusableOptions } from "../focusable/focusable.tsx";
import { useFocusable } from "../focusable/focusable.tsx";
import {
  useEvent,
  useId,
  useMergeRefs,
  useWrapElement,
} from "../utils/hooks.ts";
import { useStoreState } from "../utils/store.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import {
  TabScopedContextProvider,
  useTabProviderContext,
} from "./tab-context.tsx";
import type { TabStore } from "./tab-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

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
export const useTabPanel = createHook<TagName, TabPanelOptions>(
  function useTabPanel({
    store,
    unmountOnHide,
    tabId: tabIdProp,
    getItem: getItemProp,
    scrollRestoration,
    scrollElement,
    ...props
  }) {
    const context = useTabProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "TabPanel must receive a `store` prop or be wrapped in a TabProvider component.",
    );

    const ref = useRef<HTMLType>(null);
    const id = useId(props.id);

    const tabId = useStoreState(
      store.panels,
      () => tabIdProp || store?.panels.item(id)?.tabId,
    );
    const open = useStoreState(
      store,
      (state) => !!tabId && state.selectedId === tabId,
    );

    const disclosure = useDisclosureStore({ open });
    const mounted = useStoreState(disclosure, "mounted");

    // Store the scroll position for each tabId. The component may receive
    // different tab ids if it's a single tab panel with dynamic tab id and
    // content.
    const scrollPositionRef = useRef<Map<string, { x: number; y: number }>>(
      new Map(),
    );

    const getScrollElement = useEvent(() => {
      const panelElement = ref.current;
      if (!panelElement) return null;
      if (!scrollElement) return panelElement;
      if (typeof scrollElement === "function") {
        return scrollElement(panelElement);
      }
      if ("current" in scrollElement) {
        return scrollElement.current;
      }
      return scrollElement;
    });

    // Adds scroll restoration behavior to the tab panel.
    useEffect(() => {
      if (!scrollRestoration) return;
      if (!mounted) return;
      const element = getScrollElement();
      if (!element) return;
      // If scrollRestoration is set to "reset", scroll to the top of the
      // element and return early.
      if (scrollRestoration === "reset") {
        element.scroll(0, 0);
        return;
      }
      if (!tabId) return;
      const position = scrollPositionRef.current.get(tabId);
      element.scroll(position?.x ?? 0, position?.y ?? 0);
      // On scroll, save the scroll position for the current tab id.
      const onScroll = () => {
        scrollPositionRef.current.set(tabId, {
          x: element.scrollLeft,
          y: element.scrollTop,
        });
      };
      element.addEventListener("scroll", onScroll);
      return () => {
        element.removeEventListener("scroll", onScroll);
      };
    }, [scrollRestoration, mounted, tabId, getScrollElement, store]);

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

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (!store?.composite) return;
      const keyMap = {
        ArrowLeft: store.previous,
        ArrowRight: store.next,
        Home: store.first,
        End: store.last,
      };
      const action = keyMap[event.key as keyof typeof keyMap];
      if (!action) return;
      const { selectedId } = store.getState();
      const nextId = action({ activeId: selectedId });
      if (!nextId) return;
      event.preventDefault();
      store.move(nextId);
    });

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
      id,
      role: "tabpanel",
      "aria-labelledby": tabId || undefined,
      ...props,
      children: unmountOnHide && !mounted ? null : props.children,
      ref: useMergeRefs(ref, props.ref),
      onKeyDown,
    };

    props = useFocusable({
      // If the tab panel is rendered as part of another composite widget such
      // as combobox, it should not be focusable.
      focusable: !store.composite && !hasTabbableChildren,
      ...props,
    });
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
    Omit<DisclosureContentOptions<T>, "store"> {
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
   * - [Combobox with Tabs](https://ariakit.org/examples/combobox-tabs)
   * - [Tab with React Router](https://ariakit.org/examples/tab-react-router)
   * - [Animated TabPanel](https://ariakit.org/examples/tab-panel-animated)
   * - [Select with Combobox and
   *   Tabs](https://ariakit.org/examples/select-combobox-tab)
   * - [Command Menu with
   *   Tabs](https://ariakit.org/examples/dialog-combobox-tab-command-menu)
   */
  tabId?: string | null;
  /**
   * Manages the scrolling behavior of the tab panel when it is hidden and then
   * shown again.
   *
   * This is especially useful when using a single tab panel for multiple tabs,
   * where you dynamically change the
   * [`tabId`](https://ariakit.org/reference/tab-panel#tabid) prop and the
   * panel's children, which would otherwise retain the current scroll position
   * when switching tabs.
   *
   * When set to `true`, the component will save the scroll position and restore
   * it when the panel is shown again. When set to `"reset"`, the scroll
   * position will reset to the top when the panel is displayed again.
   *
   * The default scroll element is the tab panel itself. To scroll a different
   * element, use the
   * [`scrollElement`](https://ariakit.org/reference/tab-panel#scrollelement)
   * prop.
   * @default false
   */
  scrollRestoration?: boolean | "reset";
  /**
   * When using the
   * [`scrollRestoration`](https://ariakit.org/reference/tab-panel#scrollrestoration)
   * prop, the tab panel element serves as the default scroll element. You can
   * use this prop to designate a different element for scrolling.
   *
   * If a function is provided, it will be called with the tab panel element as
   * an argument. The function should return the element to scroll.
   * @example
   * ```jsx
   * <TabPanel
   *   scrollRestoration
   *   scrollElement={(panel) => panel.querySelector(".scrollable")}
   * />
   * ```
   */
  scrollElement?:
    | HTMLElement
    | RefObject<HTMLElement | null>
    | ((panel: HTMLElement) => HTMLElement | null);
}

export type TabPanelProps<T extends ElementType = TagName> = Props<
  T,
  TabPanelOptions<T>
>;
