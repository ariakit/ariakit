import { ComboboxStore } from "../combobox/combobox-store";
import {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";
import {
  HovercardStoreFunctions,
  HovercardStoreOptions,
  HovercardStoreState,
  createHovercardStore,
} from "../hovercard/hovercard-store";
import { applyState } from "../utils/misc";
import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";
import { BivariantCallback, SetState, SetStateAction } from "../utils/types";

type Values = Record<
  string,
  string | boolean | number | Array<string | number>
>;

function isComboboxStoreProps<T extends MenuStoreProps>(
  props: T
): props is T & Pick<ComboboxStore, "omit"> {
  if (!props.omit) return false;
  if (!props.getState) return false;
  const state = props.getState();
  return "value" in state && "activeValue" in state;
}

export function createMenuStore<T extends Values = Values>({
  orientation = "vertical",
  placement = "bottom-start",
  timeout,
  hideTimeout = 0,
  values = {} as T,
  ...props
}: MenuStoreProps<T> = {}): MenuStore<T> {
  if (isComboboxStoreProps(props)) {
    props = { ...props, ...props.omit("contentElement") };
  }
  const composite = createCompositeStore({ orientation, ...props });
  const hovercard = createHovercardStore({
    placement,
    timeout,
    hideTimeout,
    ...props,
  });
  const initialState: MenuStoreState<T> = {
    ...composite.getState(),
    ...hovercard.getState(),
    initialFocus: "container",
    values,
  };
  const store = createStore(initialState, composite, hovercard);

  store.setup(() =>
    store.sync(
      (state) => {
        if (state.mounted) return;
        store.setState("activeId", null);
      },
      ["mounted"]
    )
  );

  return {
    ...composite,
    ...hovercard,
    ...store,
    setInitialFocus: (value) => store.setState("initialFocus", value),
    setValues: (values) => store.setState("values", values),
    setValue: (name, value) => {
      // Avoid prototype pollution
      if (name === "__proto__") return;
      if (name === "constructor") return;
      if (Array.isArray(name)) return;
      store.setState("values", (values) => {
        const prevValue = values[name];
        const nextValue = applyState(value, prevValue);
        if (nextValue === prevValue) return values;
        return {
          ...values,
          [name]: nextValue !== undefined && nextValue,
        };
      });
    },
  };
}

export type MenuStoreValues = Record<
  string,
  string | boolean | number | Array<string | number>
>;

export type MenuStoreState<T extends Values = Values> = CompositeStoreState &
  HovercardStoreState & {
    /**
     * Determines the element that should be focused when the menu is opened.
     */
    initialFocus: "container" | "first" | "last";
    /**
     * A map of names and values that will be used by the `MenuItemCheckbox`
     * and `MenuItemRadio` components.
     */
    values: T;
  };

export type MenuStoreFunctions<T extends Values = Values> =
  CompositeStoreFunctions &
    HovercardStoreFunctions & {
      /**
       * Sets the `initialFocus` state.
       */
      setInitialFocus: SetState<MenuStoreState<T>["initialFocus"]>;
      /**
       * Sets the `values` state.
       */
      setValues: SetState<MenuStoreState<T>["values"]>;
      /**
       * Sets a specific value.
       */
      setValue: BivariantCallback<
        (
          name: string,
          value: SetStateAction<MenuStoreState<T>["values"][string]>
        ) => void
      >;
    };

export type MenuStoreOptions<T extends Values = Values> =
  CompositeStoreOptions &
    HovercardStoreOptions &
    StoreOptions<MenuStoreState<T>, "values">;

export type MenuStoreProps<T extends Values = Values> = MenuStoreOptions<T> &
  StoreProps<MenuStoreState<T>>;

export type MenuStore<T extends Values = Values> = MenuStoreFunctions<T> &
  Store<MenuStoreState<T>>;
