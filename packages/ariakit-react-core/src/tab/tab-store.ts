import * as Core from "@ariakit/core/tab/tab-store";
import { useMemo } from "react";
import { useComboboxContext } from "../combobox/combobox-context.tsx";
import type { ComboboxStore } from "../combobox/combobox-store.ts";
import type {
  CompositeStore,
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.ts";
import { useCompositeStoreProps } from "../composite/composite-store.ts";
import { useSelectContext } from "../select/select-context.tsx";
import { useUpdateEffect } from "../utils/hooks.ts";
import type { Store } from "../utils/store.tsx";
import { useStore, useStoreProps } from "../utils/store.tsx";

export function useTabStoreProps<T extends Core.TabStore>(
  store: T,
  update: () => void,
  props: TabStoreProps,
) {
  useUpdateEffect(update, [props.composite, props.combobox]);

  store = useCompositeStoreProps(store, update, props);
  useStoreProps(store, props, "selectedId", "setSelectedId");
  useStoreProps(store, props, "selectOnMove");

  const [panels, updatePanels] = useStore(() => store.panels, {});
  useUpdateEffect(updatePanels, [store, updatePanels]);

  return Object.assign(
    useMemo(() => ({ ...store, panels }), [store, panels]),
    { composite: props.composite, combobox: props.combobox },
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
  const combobox = useComboboxContext();
  const composite = useSelectContext() || combobox;
  props = {
    ...props,
    composite: props.composite !== undefined ? props.composite : composite,
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
  extends Pick<TabStoreOptions, "composite" | "combobox">,
    Omit<Core.TabStoreFunctions, "panels" | "composite" | "combobox">,
    CompositeStoreFunctions<TabStoreItem> {
  panels: Store<Core.TabStoreFunctions["panels"]>;
}

export interface TabStoreOptions
  extends Omit<Core.TabStoreOptions, "composite" | "combobox">,
    CompositeStoreOptions<TabStoreItem> {
  /**
   * Function that will be called when the
   * [`selectedId`](https://ariakit.org/reference/tab-provider#selectedid) state
   * changes.
   *
   * Live examples:
   * - [Combobox with Tabs](https://ariakit.org/examples/combobox-tabs)
   * - [Select with Combobox and
   *   Tabs](https://ariakit.org/examples/select-combobox-tab)
   * - [Command Menu with
   *   Tabs](https://ariakit.org/examples/dialog-combobox-tab-command-menu)
   */
  setSelectedId?: (selectedId: TabStoreState["selectedId"]) => void;
  /**
   * A reference to another [composite
   * store](https://ariakit.org/reference/use-composite-store). This is
   * automatically set when rendering tabs as part of another composite widget,
   * such as [Combobox](https://ariakit.org/components/combobox) or
   * [Select](https://ariakit.org/components/select).
   *
   * Live examples:
   * - [Combobox with Tabs](https://ariakit.org/examples/combobox-tabs)
   */
  composite?: CompositeStore | null;
  /**
   * A reference to a [combobox
   * store](https://ariakit.org/reference/use-combobox-store). This is
   * automatically set when rendering tabs inside a
   * [Combobox](https://ariakit.org/components/combobox).
   *
   * Live examples:
   * - [Combobox with Tabs](https://ariakit.org/examples/combobox-tabs)
   */
  combobox?: ComboboxStore | null;
}

export interface TabStoreProps
  extends TabStoreOptions,
    Omit<Core.TabStoreProps, "composite" | "combobox"> {}

export interface TabStore
  extends TabStoreFunctions,
    Omit<Store<Core.TabStore>, "panels" | "composite" | "combobox"> {}
