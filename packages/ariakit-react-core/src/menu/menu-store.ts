import * as Core from "@ariakit/core/menu/menu-store";
import type {
  BivariantCallback,
  PickRequired,
} from "@ariakit/core/utils/types";
import type { ComboboxStore } from "../combobox/combobox-store.js";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { useCompositeStoreProps } from "../composite/composite-store.js";
import { useDialogContext } from "../dialog/dialog-context.js";
import type {
  HovercardStoreFunctions,
  HovercardStoreOptions,
  HovercardStoreState,
} from "../hovercard/hovercard-store.js";
import { useHovercardStoreProps } from "../hovercard/hovercard-store.js";
import { useUpdateEffect } from "../utils/hooks.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";
import type { MenuBarStore } from "./menu-bar-store.js";
import { useMenuBarContext, useMenuContext } from "./menu-context.js";

type Values = Core.MenuStoreValues;

export function useMenuStoreProps<T extends Core.MenuStore>(
  store: T,
  update: () => void,
  props: MenuStoreProps,
) {
  useUpdateEffect(update, [props.combobox, props.parent, props.menubar]);

  store = useCompositeStoreProps(store, update, props);
  store = useHovercardStoreProps(store, update, props);

  useStoreProps(store, props, "values", "setValues");

  return Object.assign(store, {
    combobox: props.combobox,
    parent: props.parent,
    menubar: props.menubar,
  });
}

/**
 * Creates a menu store.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuStore({ placement: "top" });
 * <MenuButton store={menu}>Edit</MenuButton>
 * <Menu store={menu}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export function useMenuStore<T extends Values = Values>(
  props: PickRequired<MenuStoreProps<T>, "values" | "defaultValues">,
): MenuStore<T>;

export function useMenuStore(props?: MenuStoreProps): MenuStore;

export function useMenuStore(props: MenuStoreProps = {}): MenuStore {
  // Obtain the dialog context and compare it to the parent menu. If they
  // differ, it implies an intermediate dialog, which is not a menu, exists
  // between the parent menu and this menu, indicating they're not directly
  // nested.
  const dialog = useDialogContext();
  const parent = useMenuContext();
  const menubar = useMenuBarContext();
  props = {
    ...props,
    parent:
      props.parent !== undefined || dialog !== parent ? props.parent : parent,
    menubar: props.menubar !== undefined ? props.menubar : menubar,
  };
  const [store, update] = useStore(Core.createMenuStore, props);
  return useMenuStoreProps(store, update, props);
}

export type MenuStoreValues = Core.MenuStoreValues;

export interface MenuStoreState<T extends Values = Values>
  extends Core.MenuStoreState<T>,
    CompositeStoreState,
    HovercardStoreState {}

export interface MenuStoreFunctions<T extends Values = Values>
  extends Pick<MenuStoreOptions, "combobox" | "parent" | "menubar">,
    Omit<Core.MenuStoreFunctions<T>, "combobox" | "parent" | "menubar">,
    CompositeStoreFunctions,
    HovercardStoreFunctions {}

export interface MenuStoreOptions<T extends Values = Values>
  extends Core.MenuStoreOptions<T>,
    CompositeStoreOptions,
    HovercardStoreOptions {
  /**
   * A callback that gets called when the `values` state changes.
   * @param values The new values.
   * @example
   * const [values, setValues] = useState({});
   * const menu = useMenuStore({ values, setValues });
   */
  setValues?: BivariantCallback<(values: MenuStoreState<T>["values"]) => void>;
  /**
   * A reference to a combobox store. This is used when combining the combobox
   * with a menu (e.g., dropdown menu with a search input). The stores will
   * share the same state.
   *
   * Live examples:
   * - [Menu with Combobox](https://ariakit.org/examples/menu-combobox)
   */
  combobox?: ComboboxStore;
  /**
   * A reference to a parent menu store. It's automatically set when nesting
   * menus in the React tree. You should manually set this if menus aren't nested
   * in the React tree.
   */
  parent?: MenuStore;
  /**
   * A reference to a menu bar store. It's automatically set when rendering
   * menus inside a menu bar in the React tree.
   */
  menubar?: MenuBarStore;
}

export type MenuStoreProps<T extends Values = Values> = MenuStoreOptions<T> &
  Core.MenuStoreProps<T>;

export type MenuStore<T extends Values = Values> = MenuStoreFunctions<T> &
  Store<Core.MenuStore<T>>;
