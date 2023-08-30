import * as Core from "@ariakit/core/combobox/combobox-store";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { useCompositeStoreProps } from "../composite/composite-store.js";
import type { MenuStore } from "../menu/menu-store.js";
import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.js";
import { usePopoverStoreProps } from "../popover/popover-store.js";
import type { SelectStore } from "../select/select-store.js";
import { useUpdateEffect } from "../utils/hooks.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useComboboxStoreProps<T extends Core.ComboboxStore>(
  store: T,
  update: () => void,
  props: ComboboxStoreProps,
) {
  useUpdateEffect(update, [props.menu, props.select]);
  store = usePopoverStoreProps(store, update, props);
  store = useCompositeStoreProps(store, update, props);
  useStoreProps(store, props, "value", "setValue");
  useStoreProps(store, props, "resetValueOnHide");
  return Object.assign(store, { menu: props.menu, select: props.select });
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
  extends Pick<ComboboxStoreOptions, "menu" | "select">,
    Omit<Core.ComboboxStoreFunctions, "menu" | "select">,
    CompositeStoreFunctions<ComboboxStoreItem>,
    PopoverStoreFunctions {}

export interface ComboboxStoreOptions
  extends Omit<Core.ComboboxStoreOptions, "menu" | "select">,
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
  /**
   * TODO: Comment
   */
  menu?: MenuStore;
  /**
   * TODO: Comment
   */
  select?: SelectStore;
}

export type ComboboxStoreProps = ComboboxStoreOptions & Core.ComboboxStoreProps;

export type ComboboxStore = ComboboxStoreFunctions & Store<Core.ComboboxStore>;
