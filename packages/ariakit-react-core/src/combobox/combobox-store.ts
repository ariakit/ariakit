import * as Core from "@ariakit/core/combobox/combobox-store";
import {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store";
import {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
  usePopoverStoreOptions,
  usePopoverStoreProps,
} from "../popover/popover-store";
import { Store, useStore, useStoreProps } from "../utils/store";

export function useComboboxStoreOptions(props: ComboboxStoreProps) {
  const state = props.store?.getState?.();
  return {
    ...useCompositeStoreOptions(props),
    ...usePopoverStoreOptions(props),
    value: props.value ?? state?.value ?? props.defaultValue,
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
  const store = useStore(() =>
    Core.createComboboxStore({ ...props, ...options })
  );
  return useComboboxStoreProps(store, props);
}

export type ComboboxStoreItem = Core.ComboboxStoreItem;

export type ComboboxStoreState = Core.ComboboxStoreState &
  CompositeStoreState &
  PopoverStoreState;

export type ComboboxStoreFunctions = Core.ComboboxStoreFunctions &
  CompositeStoreFunctions &
  PopoverStoreFunctions;

export type ComboboxStoreOptions = Core.ComboboxStoreOptions &
  CompositeStoreOptions &
  PopoverStoreOptions & {
    defaultValue?: ComboboxStoreState["value"];
    setValue?: (value: ComboboxStoreState["value"]) => void;
  };

export type ComboboxStoreProps = ComboboxStoreOptions & Core.ComboboxStoreProps;

export type ComboboxStore = ComboboxStoreFunctions & Store<Core.ComboboxStore>;
