import type { ComboboxStore } from "../combobox/combobox-store.js";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { createCompositeStore } from "../composite/composite-store.js";
import type {
  HovercardStoreFunctions,
  HovercardStoreOptions,
  HovercardStoreState,
} from "../hovercard/hovercard-store.js";
import { createHovercardStore } from "../hovercard/hovercard-store.js";
import { applyState, defaultValue } from "../utils/misc.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import { createStore, mergeStore } from "../utils/store.js";
import type {
  BivariantCallback,
  PickRequired,
  SetState,
  SetStateAction,
} from "../utils/types.js";

type Values = Record<
  string,
  string | boolean | number | Array<string | number>
>;

export function createMenuStore<T extends Values = Values>(
  props: PickRequired<MenuStoreProps<T>, "values" | "defaultValues">
): MenuStore<T>;

export function createMenuStore(props?: MenuStoreProps): MenuStore;

export function createMenuStore({
  combobox,
  ...props
}: MenuStoreProps = {}): MenuStore {
  const store = mergeStore(
    props.store,
    combobox?.omit(
      "arrowElement",
      "anchorElement",
      "contentElement",
      "popoverElement",
      "disclosureElement"
    )
  );
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

  const menu = createStore(initialState, composite, hovercard, store);

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

export interface MenuStoreState<T extends Values = Values>
  extends CompositeStoreState,
    HovercardStoreState {
  /**
   * Determines the element that should be focused when the menu is opened.
   */
  initialFocus: "container" | "first" | "last";
  /**
   * A map of names and values that will be used by the `MenuItemCheckbox` and
   * `MenuItemRadio` components.
   */
  values: T;
  /** @default "vertical" */
  orientation: CompositeStoreState["orientation"];
  /** @default "bottom-start" */
  placement: HovercardStoreState["placement"];
  /** @default 0 */
  hideTimeout?: HovercardStoreState["hideTimeout"];
}

export interface MenuStoreFunctions<T extends Values = Values>
  extends CompositeStoreFunctions,
    HovercardStoreFunctions {
  /**
   * Sets the `initialFocus` state.
   */
  setInitialFocus: SetState<MenuStoreState<T>["initialFocus"]>;
  /**
   * Sets the `values` state.
   * @example
   * store.setValues({ watching: ["issues"] });
   * store.setValues((values) => ({ ...values, watching: ["issues"] }));
   */
  setValues: SetState<MenuStoreState<T>["values"]>;
  /**
   * Sets a specific menu value.
   * @param name The name.
   * @param value The value.
   * @example
   * store.setValue("watching", ["issues"]);
   * store.setValue("watching", (value) => [...value, "issues"]);
   */
  setValue: BivariantCallback<
    (
      name: string,
      value: SetStateAction<MenuStoreState<T>["values"][string]>
    ) => void
  >;
}

export interface MenuStoreOptions<T extends Values = Values>
  extends StoreOptions<
      MenuStoreState<T>,
      "orientation" | "placement" | "hideTimeout" | "values"
    >,
    CompositeStoreOptions,
    HovercardStoreOptions {
  /**
   * A reference to a combobox store. This is used when combining the combobox
   * with a menu (e.g., dropdown menu with a search input). The stores will
   * share the same state.
   */
  combobox?: ComboboxStore;
  /**
   * The default values for the `values` state.
   * @default {}
   */
  defaultValues?: MenuStoreState<T>["values"];
}

export type MenuStoreProps<T extends Values = Values> = MenuStoreOptions<T> &
  StoreProps<MenuStoreState<T>>;

export type MenuStore<T extends Values = Values> = MenuStoreFunctions<T> &
  Store<MenuStoreState<T>>;
