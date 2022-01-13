import { useMemo } from "react";
import { BasePlacement } from "@popperjs/core";
import { useStore } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { MenuContext } from "./__utils";
import { MenuState } from "./menu-state";

const pointsMap = {
  top: "4,10 8,6 12,10",
  right: "6,4 10,8 6,12",
  bottom: "4,6 8,10 12,6",
  left: "10,4 6,8 10,12",
};

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow pointing to the menu position, usually
 * inside a `MenuButton`.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const state = useMenuState();
 * const props = useMenuButtonArrow({ state });
 * <MenuButton state={state}>
 *   Edit
 *   <Role {...props} />
 * </MenuButton>
 * <Menu state={state}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export const useMenuButtonArrow = createHook<MenuButtonArrowOptions>(
  ({ state, ...props }) => {
    state = useStore(state || MenuContext, ["placement"]);
    const dir = state?.placement.split("-")[0] as BasePlacement;
    const points = pointsMap[dir];

    const children = useMemo(
      () => (
        <svg
          display="block"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5pt"
          viewBox="0 0 16 16"
          height="1em"
          width="1em"
        >
          <polyline points={points} />
        </svg>
      ),
      [points]
    );

    props = {
      children,
      "aria-hidden": true,
      ...props,
      style: {
        width: "1em",
        height: "1em",
        pointerEvents: "none",
        ...props.style,
      },
    };

    return props;
  }
);

/**
 * A component that renders an arrow pointing to the menu position, usually
 * inside a `MenuButton`.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuState();
 * <MenuButton state={menu}>
 *   Edit
 *   <MenuButtonArrow />
 * </MenuButton>
 * <Menu state={menu}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export const MenuButtonArrow = createComponent<MenuButtonArrowOptions>(
  (props) => {
    const htmlProps = useMenuButtonArrow(props);
    return createElement("span", htmlProps);
  }
);

export type MenuButtonArrowOptions<T extends As = "span"> = Options<T> & {
  /**
   * Object returned by the `useMenuState` hook. If not provided, the parent
   * `MenuButton` component's context will be used.
   */
  state?: MenuState;
};

export type MenuButtonArrowProps<T extends As = "span"> = Props<
  MenuButtonArrowOptions<T>
>;
