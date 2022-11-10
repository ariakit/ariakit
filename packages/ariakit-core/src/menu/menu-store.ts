import { applyState, chain } from "ariakit-utils/misc";
import { Store, createStore } from "ariakit-utils/store";
import { SetState, SetStateAction } from "ariakit-utils/types";
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

type Values = Record<
  string,
  string | boolean | number | Array<string | number>
>;

export function createMenuStore<V extends Values = Values>({
  values = {} as V,
  placement = "bottom-start",
  orientation = "vertical",
  timeout,
  hideTimeout = 0,
  ...props
}: MenuStoreProps<V> = {}): MenuStore<V> {
  const hovercard = createHovercardStore({
    placement,
    timeout,
    hideTimeout,
    ...props,
  });
  const composite = createCompositeStore({ orientation, ...props }, hovercard);
  const store = createStore<MenuStoreState<V>>(
    {
      ...composite.getState(),
      ...hovercard.getState(),
      initialFocus: "container",
      values,
    },
    composite
  );

  const setup = () => {
    return chain(
      store.setup?.(),
      store.sync(
        (state) => {
          if (state.mounted) return;
          store.setState("activeId", null);
        },
        ["mounted"]
      )
    );
  };

  const setValue: MenuStore<V>["setValue"] = (name, value) => {
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
  };

  const setInitialFocus: MenuStore<V>["setInitialFocus"] = (value) => {
    store.setState("initialFocus", value);
  };

  const setValues: MenuStore<V>["setValues"] = (values) => {
    store.setState("values", values);
  };

  return {
    ...hovercard,
    ...composite,
    ...store,
    setup,
    setInitialFocus,
    setValues,
    setValue,
  };
}

export type MenuStoreState<V extends Values = Values> = CompositeStoreState &
  HovercardStoreState & {
    /**
     * Determines the element that should be focused when the menu is opened.
     */
    initialFocus: "container" | "first" | "last";
    /**
     * A map of names and values that will be used by the `MenuItemCheckbox` and
     * `MenuItemRadio` components.
     */
    values: V;
  };

export type MenuStore<V extends Values = Values> = Omit<
  CompositeStore,
  keyof Store
> &
  Omit<HovercardStore, keyof Store> &
  Store<MenuStoreState<V>> & {
    /**
     * Sets the `initialFocus` state.
     */
    setInitialFocus: SetState<MenuStoreState["initialFocus"]>;
    /**
     * Sets the `values` state.
     */
    setValues: SetState<MenuStoreState<V>["values"]>;
    /**
     * Sets a specific value.
     */
    setValue: (
      name: string,
      value: SetStateAction<MenuStoreState<V>["values"][string]>
    ) => void;
  };

export type MenuStoreProps<V extends Values = Values> = CompositeStoreProps &
  HovercardStoreProps &
  Partial<Pick<MenuStoreState<V>, "values">>;
