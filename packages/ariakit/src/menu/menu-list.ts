import { KeyboardEvent, useCallback, useEffect, useState } from "react";
import { useEvent, useForkRef, useId } from "ariakit-utils/hooks";
import { isMac, isSafari } from "ariakit-utils/platform";
import { useStore, useStoreProvider } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { CompositeOptions, useComposite } from "../composite/composite";
import {
  CompositeTypeaheadOptions,
  useCompositeTypeahead,
} from "../composite/composite-typeahead";
import { MenuBarContext, MenuContext } from "./__utils";
import { MenuState } from "./menu-state";

type BasePlacement = "top" | "bottom" | "left" | "right";

const isSafariOnMac = isMac() && isSafari();

function useAriaLabelledBy({ state, ...props }: MenuListProps) {
  const [id, setId] = useState<string | undefined>(undefined);
  const label = props["aria-label"];

  useEffect(() => {
    const disclosure = state.disclosureRef.current;
    if (!disclosure) return;
    const menu = state.contentElement;
    if (!menu) return;
    const menuLabel = label || menu.hasAttribute("aria-label");
    if (menuLabel) {
      setId(undefined);
    } else if (disclosure.id) {
      setId(disclosure.id);
    }
  }, [label, state.disclosureRef, state.contentElement]);

  return id;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a menu list element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const state = useMenuState();
 * const props = useMenuList({ state });
 * <MenuButton state={state}>Edit</MenuButton>
 * <Role {...props}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Role>
 * ```
 */
export const useMenuList = createHook<MenuListOptions>(
  ({ state, composite = true, ...props }) => {
    const parentMenu = useStore(MenuContext, []);
    const parentMenuBar = useStore(MenuBarContext, [
      "items",
      "move",
      "next",
      "previous",
      "orientation",
    ]);
    const hasParentMenu = !!parentMenu;
    const id = useId(props.id);

    const onKeyDownProp = useEvent(props.onKeyDown);
    const dir = state.placement.split("-")[0] as BasePlacement;
    const orientation =
      state.orientation === "both" ? undefined : state.orientation;
    const isHorizontal = orientation !== "vertical";
    const isMenuBarHorizontal =
      !!parentMenuBar && parentMenuBar?.orientation !== "vertical";

    const onKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDownProp(event);
        if (event.defaultPrevented) return;
        if (hasParentMenu || (parentMenuBar && !isHorizontal)) {
          const hideMap = {
            ArrowRight: () => dir === "left" && !isHorizontal,
            ArrowLeft: () => dir === "right" && !isHorizontal,
            ArrowUp: () => dir === "bottom" && isHorizontal,
            ArrowDown: () => dir === "top" && isHorizontal,
          };
          const action = hideMap[event.key as keyof typeof hideMap];
          if (action?.()) {
            event.stopPropagation();
            event.preventDefault();
            return state.hide();
          }
        }
        if (parentMenuBar) {
          const keyMap = {
            ArrowRight: () => {
              if (!isMenuBarHorizontal) return;
              return parentMenuBar.next();
            },
            ArrowLeft: () => {
              if (!isMenuBarHorizontal) return;
              return parentMenuBar.previous();
            },
            ArrowDown: () => {
              if (isMenuBarHorizontal) return;
              return parentMenuBar.next();
            },
            ArrowUp: () => {
              if (isMenuBarHorizontal) return;
              return parentMenuBar.previous();
            },
          };
          const action = keyMap[event.key as keyof typeof keyMap];
          const id = action?.();
          if (id !== undefined) {
            event.stopPropagation();
            event.preventDefault();
            parentMenuBar.move(id);
          }
        }
      },
      [
        onKeyDownProp,
        hasParentMenu,
        parentMenuBar,
        isHorizontal,
        state.hide,
        dir,
      ]
    );

    props = useStoreProvider({ state, ...props }, MenuContext);

    const ariaLabelledBy = useAriaLabelledBy({ state, ...props });

    const style = state.mounted
      ? props.style
      : { ...props.style, display: "none" };

    props = {
      id,
      "aria-labelledby": ariaLabelledBy,
      hidden: !state.mounted,
      ...props,
      ref: useForkRef(id ? state.setContentElement : null, props.ref),
      style,
      onKeyDown,
    };

    if (composite) {
      props = {
        // Safari/VoiceOver doesn't work well when role="menu" elements are
        // hidden. So we have to use role="menubar" in this case. This may be a
        // problem for developers targeting [role="menu"] on CSS. We should
        // explicitly state that in the docs and remove this workaround as soon
        // as Safari/VoiceOver is fixed.
        role: isSafariOnMac ? "menubar" : "menu",
        "aria-orientation": orientation,
        ...props,
      };
    }

    props = useComposite({ state, composite, ...props });
    props = useCompositeTypeahead({ state, ...props });

    return props;
  }
);

/**
 * A component that renders a menu list element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuState();
 * <MenuButton state={menu}>Edit</MenuButton>
 * <MenuList state={menu}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </MenuList>
 * ```
 */
export const MenuList = createComponent<MenuListOptions>((props) => {
  const htmlProps = useMenuList(props);
  return createElement("div", htmlProps);
});

export type MenuListOptions<T extends As = "div"> = Omit<
  CompositeOptions<T>,
  "state"
> &
  Omit<CompositeTypeaheadOptions<T>, "state"> & {
    /**
     * Object returned by the `useMenuListState` hook.
     */
    state: MenuState;
  };

export type MenuListProps<T extends As = "div"> = Props<MenuListOptions<T>>;
