import { useMemo } from "react";
import * as Core from "@ariakit/core/tab/tab-store";
import { useComboboxProviderContext } from "../combobox/combobox-context.js";
import type { ComboboxStore } from "../combobox/combobox-store.js";
import type {
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
  useUpdateEffect(update, [props.combobox]);

  store = useCompositeStoreProps(store, update, props);
  useStoreProps(store, props, "selectedId", "setSelectedId");
  useStoreProps(store, props, "selectOnMove");

  const [panels, updatePanels] = useStore(() => store.panels, {});
  useUpdateEffect(updatePanels, [store, updatePanels]);

  return Object.assign(
    useMemo(() => ({ ...store, panels }), [store, panels]),
    { combobox: props.combobox },
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
  const combobox = useComboboxProviderContext();
  props = {
    ...props,
    combobox: props.combobox !== undefined ? props.combobox : combobox,
  };
  const [store, update] = useStore(Core.createTabStore, props);
  return useTabStoreProps(store, update, props);
}

export interface TabStoreItem extends Core.TabStoreItem {}

export interface TabStoreState
  extends Core.TabStoreState,
    CompositeStoreState<TabStoreItem> {}

export interface TabStoreFunctions
  extends Pick<TabStoreOptions, "combobox">,
    Omit<Core.TabStoreFunctions, "panels" | "combobox">,
    CompositeStoreFunctions<TabStoreItem> {
  panels: Store<Core.TabStoreFunctions["panels"]>;
}

export interface TabStoreOptions
  extends Omit<Core.TabStoreOptions, "combobox">,
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
   * A reference to a [combobox
   * store](https://ariakit.org/reference/use-combobox-store). It's
   * automatically set when composing [Combobox with
   * Tab](https://ariakit.org/examples/combobox-tabs).
   */
  combobox?: ComboboxStore | null;
}

export interface TabStoreProps
  extends TabStoreOptions,
    Omit<Core.TabStoreProps, "combobox"> {}

export interface TabStore
  extends TabStoreFunctions,
    Omit<Store<Core.TabStore>, "panels" | "combobox"> {}
