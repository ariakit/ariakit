import { SetStateAction, useCallback, useMemo, useState } from "react";
import { useControlledState, useSafeLayoutEffect } from "ariakit-utils/hooks";
import { applyState } from "ariakit-utils/misc";
import { useStore, useStorePublisher } from "ariakit-utils/store";
import { SetState } from "ariakit-utils/types";
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

function useParentOrientation(parentMenu?: MenuState) {
  const parentMenuBar = useStore(MenuBarContext, ["orientation"]);
  if (parentMenu) {
    return parentMenu.orientation;
  }
  return parentMenuBar?.orientation;
}

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
export function useMenuState({
  orientation = "vertical",
  timeout = 150,
  hideTimeout = 0,
  ...props
}: MenuStateProps = {}): MenuState {
  const [initialFocus, setInitialFocus] =
    useState<MenuState["initialFocus"]>("container");
  const [values, setValues] = useControlledState(
    props.defaultValues || {},
    props.values,
    props.setValues
  );
  const parentMenu = useParentMenu(["orientation", "hideAll"]);
  const contextOrientation = useParentOrientation(parentMenu);
  // Defines the placement of the menu popover based on the parent orientation.
  const placement =
    props.placement ||
    (contextOrientation === "vertical" ? "right-start" : "bottom-start");

  const composite = useCompositeState({ orientation, ...props });
  const hoverCard = useHovercardState({
    timeout,
    hideTimeout,
    ...props,
    placement,
  });

  // TODO: Comment. Sometimes re-opening the menu in a menu bar will move focus.
  // Maybe should reset activeId as well. Needs to be layout effect because of
  // context menu subsequent clicks.
  useSafeLayoutEffect(() => {
    if (!hoverCard.visible) {
      composite.setMoves(0);
    }
  }, [hoverCard.visible, composite.setMoves]);

  const setValue = useCallback(
    (name: string, value: SetStateAction<typeof values[string]>) => {
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
    hoverCard.hide();
    parentMenu?.hideAll();
  }, [hoverCard.hide, parentMenu?.hideAll]);

  const state = useMemo(
    () => ({
      ...composite,
      ...hoverCard,
      initialFocus,
      setInitialFocus,
      values,
      setValues,
      setValue,
      hideAll,
    }),
    [
      composite,
      hoverCard,
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

export type MenuState = CompositeState &
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
    values: Record<string, string | boolean | number | Array<string | number>>;
    /**
     * Sets the `values` state.
     */
    setValues: SetState<MenuState["values"]>;
    /**
     * Sets a specific value.
     */
    setValue: (
      name: string,
      value: SetStateAction<MenuState["values"][string]>
    ) => void;
    /**
     * Hides the menu and all the parent menus.
     */
    hideAll: () => void;
  };

export type MenuStateProps = CompositeStateProps &
  HovercardStateProps &
  Partial<Pick<MenuState, "values">> & {
    /**
     * A default map of names and values that will be used by the
     * `MenuItemCheckbox` and `MenuItemRadio` components.
     */
    defaultValues?: MenuState["values"];
    /**
     * Function that will be called when setting the menu `values` state.
     * @example
     * const [values, setValues] = useState({});
     * // Combining the values from two menus into a single state.
     * const menu = useMenuState({ values, setValues });
     * const submenu = useMenuState({ values, setValues });
     */
    setValues?: (values: MenuState["values"]) => void;
  };
