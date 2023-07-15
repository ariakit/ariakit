import * as Core from "@ariakit/core/combobox/combobox-store";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import {
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store.js";
import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.js";
import {
  usePopoverStoreOptions,
  usePopoverStoreProps,
} from "../popover/popover-store.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useComboboxStoreOptions(props: ComboboxStoreProps) {
  return {
    ...useCompositeStoreOptions(props),
    ...usePopoverStoreOptions(props),
  };
}

export function useComboboxStoreProps<T extends ComboboxStore>(
  store: T,
  props: ComboboxStoreProps,
) {
  store = useCompositeStoreProps(store, props);
  store = usePopoverStoreProps(store, props);
  useStoreProps(store, props, "value", "setValue");
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
  const options = useComboboxStoreOptions(props);
  const store = useStore(() =>
    Core.createComboboxStore({ ...props, ...options }),
  );
  return useComboboxStoreProps(store, props);
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
   * @param value The new value.
   * @example
   * function MyCombobox({ value, onChange }) {
   *   const combobox = useComboboxStore({ value, setValue: onChange });
   * }
   */
  setValue?: (value: ComboboxStoreState["value"]) => void;
}

export type ComboboxStoreProps = ComboboxStoreOptions & Core.ComboboxStoreProps;

export type ComboboxStore = ComboboxStoreFunctions & Store<Core.ComboboxStore>;
