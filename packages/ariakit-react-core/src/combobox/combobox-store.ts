import {
  ComboboxStoreItem,
  ComboboxStoreState,
  ComboboxStore as CoreComboboxStore,
  ComboboxStoreProps as CoreComboboxStoreProps,
  createComboboxStore,
} from "@ariakit/core/combobox/combobox-store";
import { Store as CoreStore } from "@ariakit/core/utils/store";
import {
  CompositeStoreProps,
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store";
import {
  PopoverStoreProps,
  usePopoverStoreOptions,
  usePopoverStoreProps,
} from "../popover/popover-store";
import { Store, useStore, useStoreProps } from "../utils/store";

export function useComboboxStoreOptions(props: ComboboxStoreProps) {
  return {
    ...useCompositeStoreOptions(props),
    ...usePopoverStoreOptions(props),
    value: props.value ?? props.getState?.().value ?? props.defaultValue,
  };
}

export function useComboboxStoreProps<T extends ComboboxStore>(
  store: T,
  props: ComboboxStoreProps
) {
  store = useCompositeStoreProps(store, props);
  store = usePopoverStoreProps(store, props);
  useStoreProps(store, props, "value", "setValue");
  return store;
}

export function useComboboxStore(
  props: ComboboxStoreProps = {}
): ComboboxStore {
  const options = useComboboxStoreOptions(props);
  let store = useStore(() => createComboboxStore({ ...props, ...options }));
  store = useComboboxStoreProps(store, props);
  return store;
}

export type { ComboboxStoreState, ComboboxStoreItem };

export type ComboboxStore = Store<CoreComboboxStore>;

export type ComboboxStoreProps = Omit<
  CompositeStoreProps<ComboboxStoreItem>,
  keyof CoreStore
> &
  Omit<PopoverStoreProps, keyof CoreStore> &
  CoreComboboxStoreProps & {
    defaultValue?: ComboboxStoreState["value"];
    setValue?: (value: ComboboxStoreState["value"]) => void;
  };
