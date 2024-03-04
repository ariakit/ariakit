import { useMemo } from "react";
import * as Core from "@ariakit/core/tab/tab-store";
import { useCompositeContext } from "../composite/composite-context.js";
import type {
  CompositeStore,
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { useCompositeStoreProps } from "../composite/composite-store.js";
import { useUpdateEffect } from "../utils/hooks.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useTabStoreProps<T extends Core.TabStore>(
  store: T,
  update: () => void,
  props: TabStoreProps,
) {
  useUpdateEffect(update, [props.composite]);

  store = useCompositeStoreProps(store, update, props);
  useStoreProps(store, props, "selectedId", "setSelectedId");
  useStoreProps(store, props, "selectOnMove");

  const [panels, updatePanels] = useStore(() => store.panels, {});
  useUpdateEffect(updatePanels, [store, updatePanels]);

  return Object.assign(
    useMemo(() => ({ ...store, panels }), [store, panels]),
    { composite: props.composite },
  );
}

/**
 * Creates a tab store to control the state of
 * [Tab](https://ariakit.org/components/tab) components.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx
 * const tab = useTabStore();
 *
 * <TabList store={tab}>
 *   <Tab>Tab 1</Tab>
 *   <Tab>Tab 2</Tab>
 * </TabList>
 * <TabPanel store={tab}>Panel 1</TabPanel>
 * <TabPanel store={tab}>Panel 2</TabPanel>
 * ```
 */
export function useTabStore(props: TabStoreProps = {}): TabStore {
  const composite = useCompositeContext();
  props = {
    ...props,
    composite: props.composite !== undefined ? props.composite : composite,
  };
  const [store, update] = useStore(Core.createTabStore, props);
  return useTabStoreProps(store, update, props);
}

export interface TabStoreItem extends Core.TabStoreItem {}

export interface TabStoreState
  extends Core.TabStoreState,
    CompositeStoreState<TabStoreItem> {}

export interface TabStoreFunctions
  extends Pick<TabStoreOptions, "composite">,
    Omit<Core.TabStoreFunctions, "panels" | "composite">,
    CompositeStoreFunctions<TabStoreItem> {
  panels: Store<Core.TabStoreFunctions["panels"]>;
}

export interface TabStoreOptions
  extends Omit<Core.TabStoreOptions, "composite">,
    CompositeStoreOptions<TabStoreItem> {
  /**
   * Function that will be called when the
   * [`selectedId`](https://ariakit.org/reference/tab-provider#selectedid) state
   * changes.
   *
   * Live examples:
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   */
  setSelectedId?: (selectedId: TabStoreState["selectedId"]) => void;
  /**
   * A reference to another [composite
   * store](https://ariakit.org/reference/use-composite-store). It's
   * automatically set when rendering tabs within another composite widget like
   * [Combobox](https://ariakit.org/components/combobox) or
   * [Select](https://ariakit.org/components/select).
   */
  composite?: CompositeStore | null;
}

export interface TabStoreProps
  extends TabStoreOptions,
    Omit<Core.TabStoreProps, "composite"> {}

export interface TabStore
  extends TabStoreFunctions,
    Omit<Store<Core.TabStore>, "panels" | "composite"> {}
