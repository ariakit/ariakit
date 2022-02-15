import { useCallback, useMemo, useState } from "react";
import { useControlledState, useSafeLayoutEffect } from "ariakit-utils/hooks";
import { applyState } from "ariakit-utils/misc";
import { useStore, useStorePublisher } from "ariakit-utils/store";
import { SetState, SetStateAction } from "ariakit-utils/types";
import {
  CompositeState,
  CompositeStateProps,
  useCompositeState,
} from "../composite/composite-state";
import {
  HovercardState,
  HovercardStateProps,
  useHovercardState,
} from "../hovercard/hovercard-state";
import { MenuBarContext, useParentMenu } from "./__utils";

type Values = Record<
  string,
  string | boolean | number | Array<string | number>
>;

/**
 * Provides state for the `Menu` components.
 * @example
 * ```jsx
 * const menu = useMenuState({ placement: "top" });
 * <MenuButton state={menu}>Edit</MenuButton>
 * <Menu state={menu}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export function useMenuState<V extends Values = Values>({
  orientation = "vertical",
  timeout,
  hideTimeout = 0,
  ...props
}: MenuStateProps<V> = {}): MenuState<V> {
  const [initialFocus, setInitialFocus] =
    useState<MenuState["initialFocus"]>("container");
  const [values, setValues] = useControlledState(
    props.defaultValues || ({} as V),
    props.values,
    props.setValues
  );
  const parentMenu = useParentMenu(["orientation", "hideAll"]);
  const parentMenuBar = useStore(MenuBarContext, ["orientation"]);
  const contextOrientation =
    parentMenu?.orientation || parentMenuBar?.orientation;
  const parentIsMenuBar = !!parentMenuBar && !parentMenu;
  // Defines the placement of the menu popover based on the parent orientation.
  const placement =
    props.placement ||
    (contextOrientation === "vertical" ? "right-start" : "bottom-start");

  timeout = timeout ?? parentIsMenuBar ? 0 : 150;
  const composite = useCompositeState({ orientation, ...props });
  const hovercard = useHovercardState({
    timeout,
    hideTimeout,
    ...props,
    placement,
  });

  // TODO: Comment. Sometimes re-opening the menu in a menu bar will move focus.
  // Maybe should reset activeId as well. Needs to be layout effect because of
  // context menu subsequent clicks.
  useSafeLayoutEffect(() => {
    if (!hovercard.mounted) {
      composite.setMoves(0);
      composite.setActiveId(null);
    }
  }, [hovercard.mounted, composite.setMoves]);

  const setValue = useCallback(
    (name: string, value: SetStateAction<V[string]>) => {
      // Preventing prototype pollution.
      if (name === "__proto__" || name === "constructor") return;
      setValues((prevValues) => {
        const prevValue = prevValues[name];
        const nextValue = applyState(value, prevValue);
        if (nextValue === prevValue) {
          return prevValues;
        }
        return {
          ...prevValues,
          [name]: nextValue === undefined ? !!nextValue : nextValue,
        };
      });
    },
    [setValues]
  );

  const hideAll = useCallback(() => {
    hovercard.hide();
    parentMenu?.hideAll();
  }, [hovercard.hide, parentMenu?.hideAll]);

  const state = useMemo(
    () => ({
      ...composite,
      ...hovercard,
      initialFocus,
      setInitialFocus,
      values,
      setValues,
      setValue,
      hideAll,
    }),
    [
      composite,
      hovercard,
      initialFocus,
      setInitialFocus,
      values,
      setValues,
      setValue,
      hideAll,
    ]
  );

  return useStorePublisher(state);
}

export type MenuState<V extends Values = Values> = CompositeState &
  HovercardState & {
    /**
     * Determines the element that should be focused when the menu is opened.
     */
    initialFocus: "container" | "first" | "last";
    /**
     * Sets the `initialFocus` state.
     */
    setInitialFocus: SetState<MenuState["initialFocus"]>;
    /**
     * A map of names and values that will be used by the `MenuItemCheckbox` and
     * `MenuItemRadio` components.
     */
    values: V;
    /**
     * Sets the `values` state.
     */
    setValues: SetState<MenuState<V>["values"]>;
    /**
     * Sets a specific value.
     */
    setValue: (
      name: string,
      value: SetStateAction<MenuState<V>["values"][string]>
    ) => void;
    /**
     * Hides the menu and all the parent menus.
     */
    hideAll: () => void;
  };

export type MenuStateProps<V extends Values = Values> = CompositeStateProps &
  HovercardStateProps &
  Partial<Pick<MenuState<V>, "values">> & {
    /**
     * A default map of names and values that will be used by the
     * `MenuItemCheckbox` and `MenuItemRadio` components.
     */
    defaultValues?: MenuState<V>["values"];
    /**
     * Function that will be called when setting the menu `values` state.
     * @example
     * const [values, setValues] = useState({});
     * // Combining the values from two menus into a single state.
     * const menu = useMenuState({ values, setValues });
     * const submenu = useMenuState({ values, setValues });
     */
    setValues?: (values: MenuState<V>["values"]) => void;
  };
