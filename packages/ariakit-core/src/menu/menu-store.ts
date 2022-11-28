import { ComboboxStore } from "../combobox/combobox-store";
import {
  CompositeStore,
  CompositeStoreProps,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";
import {
  HovercardStore,
  HovercardStoreProps,
  HovercardStoreState,
  createHovercardStore,
} from "../hovercard/hovercard-store";
import { applyState, chain } from "../utils/misc";
import { PartialStore, Store, createStore } from "../utils/store";
import { BivariantCallback, SetState, SetStateAction } from "../utils/types";

function isComboboxStoreProps<T extends MenuStoreProps>(
  props: T
): props is T & Pick<ComboboxStore, "omit"> {
  if (!props.omit) return false;
  if (!props.getState) return false;
  const state = props.getState();
  return "value" in state && "activeValue" in state;
}

export function createMenuStore<T extends MenuStoreValues = MenuStoreValues>({
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

  const setup = () => {
    return chain(
      store.setup(),
      store.sync(
        (state) => {
          if (state.mounted) return;
          store.setState("activeId", null);
        },
        ["mounted"]
      )
    );
  };

  return {
    ...hovercard,
    ...composite,
    ...store,
    setup,
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

export type MenuStoreState<V extends MenuStoreValues = MenuStoreValues> =
  CompositeStoreState &
    HovercardStoreState & {
      /**
       * Determines the element that should be focused when the menu is opened.
       */
      initialFocus: "container" | "first" | "last";
      /**
       * A map of names and values that will be used by the `MenuItemCheckbox`
       * and `MenuItemRadio` components.
       */
      values: V;
    };

export type MenuStore<T extends MenuStoreValues = MenuStoreValues> = Omit<
  CompositeStore,
  keyof Store
> &
  Omit<HovercardStore, keyof Store> &
  Store<MenuStoreState<T>> & {
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

export type MenuStoreProps<T extends MenuStoreValues = MenuStoreValues> = Omit<
  CompositeStoreProps,
  keyof MenuStore<T>
> &
  Omit<HovercardStoreProps, keyof MenuStore<T>> &
  PartialStore<MenuStoreState<T>> &
  Partial<Pick<MenuStoreState<T>, "values">>;
