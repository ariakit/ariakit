import * as Core from "@ariakit/core/combobox/combobox-store";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { useCompositeStoreProps } from "../composite/composite-store.js";
import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.js";
import { usePopoverStoreProps } from "../popover/popover-store.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useComboboxStoreProps<T extends Core.ComboboxStore>(
  store: T,
  update: () => void,
  props: ComboboxStoreProps,
) {
  store = usePopoverStoreProps(store, update, props);
  store = useCompositeStoreProps(store, update, props);
  useStoreProps(store, props, "value", "setValue");
  useStoreProps(store, props, "resetValueOnHide");
  return store;
}

/**
 * Creates a combobox store.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxStore();
 * <Combobox store={combobox} />
 * <ComboboxPopover store={combobox}>
 *   <ComboboxItem value="Apple" />
 *   <ComboboxItem value="Banana" />
 *   <ComboboxItem value="Orange" />
 * </ComboboxPopover>
 * ```
 */
export function useComboboxStore(
  props: ComboboxStoreProps = {},
): ComboboxStore {
  const [store, update] = useStore(Core.createComboboxStore, props);
  return useComboboxStoreProps(store, update, props);
}

export type ComboboxStoreItem = Core.ComboboxStoreItem;

export interface ComboboxStoreState
  extends Core.ComboboxStoreState,
    CompositeStoreState<ComboboxStoreItem>,
    PopoverStoreState {}

export interface ComboboxStoreFunctions
  extends Core.ComboboxStoreFunctions,
    CompositeStoreFunctions<ComboboxStoreItem>,
    PopoverStoreFunctions {}

export interface ComboboxStoreOptions
  extends Core.ComboboxStoreOptions,
    CompositeStoreOptions<ComboboxStoreItem>,
    PopoverStoreOptions {
  /**
   * A callback that gets called when the `value` state changes.
   *
   * Live examples:
   * - [Combobox filtering](https://ariakit.org/examples/combobox-filtering)
   * - [ComboboxGroup](https://ariakit.org/examples/combobox-group)
   * - [Combobox with links](https://ariakit.org/examples/combobox-links)
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   * - [Menu with Combobox](https://ariakit.org/examples/menu-combobox)
   * - [Select with Combobox](https://ariakit.org/examples/select-combobox)
   * @param value The new value.
   */
  setValue?: (value: ComboboxStoreState["value"]) => void;
}

export type ComboboxStoreProps = ComboboxStoreOptions & Core.ComboboxStoreProps;

export type ComboboxStore = ComboboxStoreFunctions & Store<Core.ComboboxStore>;
