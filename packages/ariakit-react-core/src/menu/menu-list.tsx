import { KeyboardEvent, useContext, useEffect, useState } from "react";
import { CompositeOptions, useComposite } from "../composite/composite";
import {
  CompositeTypeaheadOptions,
  useCompositeTypeahead,
} from "../composite/composite-typeahead";
import { useEvent, useForkRef, useId, useWrapElement } from "../utils/hooks";
import { useStoreState } from "../utils/store";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { MenuBarContext, MenuContext } from "./menu-context";
import { MenuStore } from "./menu-store";

type BasePlacement = "top" | "bottom" | "left" | "right";

function useAriaLabelledBy({ store, ...props }: MenuListProps) {
  const [id, setId] = useState<string | undefined>(undefined);
  const label = props["aria-label"];

  const disclosureElement = store.useState("disclosureElement");
  const contentElement = store.useState("contentElement");

  useEffect(() => {
    const disclosure = disclosureElement;
    if (!disclosure) return;
    const menu = contentElement;
    if (!menu) return;
    const menuLabel = label || menu.hasAttribute("aria-label");
    if (menuLabel) {
      setId(undefined);
    } else if (disclosure.id) {
      setId(disclosure.id);
    }
  }, [label, disclosureElement, contentElement]);

  return id;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a menu list element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuList({ store });
 * <MenuButton store={store}>Edit</MenuButton>
 * <Role {...props}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Role>
 * ```
 */
export const useMenuList = createHook<MenuListOptions>(
  ({ store, composite = true, ...props }) => {
    const parentMenu = useContext(MenuContext);
    const parentMenuBar = useContext(MenuBarContext);
    const hasParentMenu = !!parentMenu;
    const id = useId(props.id);

    const onKeyDownProp = props.onKeyDown;
    const dir = store.useState(
      (state) => state.placement.split("-")[0] as BasePlacement
    );
    const orientation = store.useState((state) =>
      state.orientation === "both" ? undefined : state.orientation
    );
    const isHorizontal = orientation !== "vertical";
    const isMenuBarHorizontal = !!useStoreState(
      parentMenuBar,
      (state) => state.orientation !== "vertical"
    );

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);
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
          return store.hide();
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
    });

    props = useWrapElement(
      props,
      (element) => (
        <MenuContext.Provider value={store}>{element}</MenuContext.Provider>
      ),
      [store]
    );

    const ariaLabelledBy = useAriaLabelledBy({ store, ...props });
    const mounted = store.useState("mounted");
    const style = mounted ? props.style : { ...props.style, display: "none" };

    props = {
      id,
      "aria-labelledby": ariaLabelledBy,
      hidden: !mounted,
      ...props,
      ref: useForkRef(id ? store.setContentElement : null, props.ref),
      style,
      onKeyDown,
    };

    if (composite) {
      props = {
        role: "menu",
        "aria-orientation": orientation,
        ...props,
      };
    }

    props = useComposite({ store, composite, ...props });
    props = useCompositeTypeahead({ store, ...props });

    return props;
  }
);

/**
 * A component that renders a menu list element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuStore();
 * <MenuButton store={menu}>Edit</MenuButton>
 * <MenuList store={menu}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </MenuList>
 * ```
 */
export const MenuList = createComponent<MenuListOptions>((props) => {
  const htmlProps = useMenuList(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuList.displayName = "MenuList";
}

export type MenuListOptions<T extends As = "div"> = Omit<
  CompositeOptions<T>,
  "store"
> &
  Omit<CompositeTypeaheadOptions<T>, "store"> & {
    /**
     * Object returned by the `useMenuStore` hook.
     */
    store: MenuStore;
  };

export type MenuListProps<T extends As = "div"> = Props<MenuListOptions<T>>;
