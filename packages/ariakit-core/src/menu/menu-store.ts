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
import { applyState, defaultValue } from "../utils/misc";
import {
  Store,
  StoreOptions,
  StoreProps,
  createStore,
  mergeStore,
} from "../utils/store";
import { BivariantCallback, SetState, SetStateAction } from "../utils/types";
import { MenuBarStore } from "./menu-bar-store";

type Values = Record<
  string,
  string | boolean | number | Array<string | number>
>;

export function createMenuStore<T extends Values = Values>(
  props: MenuStoreProps<T> &
    (
      | Required<Pick<MenuStoreProps<T>, "values">>
      | Required<Pick<MenuStoreProps<T>, "defaultValues">>
    )
): MenuStore<T>;

export function createMenuStore(props?: MenuStoreProps): MenuStore;

export function createMenuStore({
  combobox,
  parent,
  ...props
}: MenuStoreProps = {}): MenuStore {
  const comboboxStore = combobox?.omit(
    "anchorElement",
    "baseElement",
    "contentElement",
    "popoverElement"
  );
  const store = mergeStore(props.store, comboboxStore);
  const syncState = store.getState();

  const composite = createCompositeStore({
    ...props,
    store,
    orientation: defaultValue(
      props.orientation,
      syncState.orientation,
      "vertical" as const
    ),
  });

  const hovercard = createHovercardStore({
    ...props,
    store,
    placement: defaultValue(
      props.placement,
      syncState.placement,
      "bottom-start" as const
    ),
    hideTimeout: defaultValue(props.hideTimeout, syncState.hideTimeout, 0),
  });

  const initialState: MenuStoreState = {
    ...composite.getState(),
    ...hovercard.getState(),
    initialFocus: defaultValue(syncState.initialFocus, "container" as const),
    values: defaultValue(
      props.values,
      syncState.values,
      props.defaultValues,
      {}
    ),
  };

  const menu = createStore(initialState, composite, hovercard);

  menu.setup(() =>
    menu.sync(
      (state) => {
        if (state.mounted) return;
        menu.setState("activeId", null);
      },
      ["mounted"]
    )
  );

  return {
    ...composite,
    ...hovercard,
    ...menu,
    setInitialFocus: (value) => menu.setState("initialFocus", value),
    setValues: (values) => menu.setState("values", values),
    setValue: (name, value) => {
      // Avoid prototype pollution
      if (name === "__proto__") return;
      if (name === "constructor") return;
      if (Array.isArray(name)) return;
      menu.setState("values", (values) => {
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
    StoreOptions<MenuStoreState<T>, "values"> & {
      combobox?: ComboboxStore;
      parent?: MenuStore | MenuBarStore;
    } & {
      defaultValues?: MenuStoreState<T>["values"];
    };

export type MenuStoreProps<T extends Values = Values> = MenuStoreOptions<T> &
  StoreProps<MenuStoreState<T>>;

export type MenuStore<T extends Values = Values> = MenuStoreFunctions<T> &
  Store<MenuStoreState<T>>;
