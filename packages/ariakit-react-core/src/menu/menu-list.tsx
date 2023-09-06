import type { KeyboardEvent } from "react";
import { useEffect, useState } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { CompositeTypeaheadOptions } from "../composite/composite-typeahead.js";
import { useCompositeTypeahead } from "../composite/composite-typeahead.js";
import type { CompositeOptions } from "../composite/composite.js";
import { useComposite } from "../composite/composite.js";
import { isHidden } from "../disclosure/disclosure-content.js";
import type { DisclosureContentOptions } from "../disclosure/disclosure-content.js";
import {
  useEvent,
  useId,
  useMergeRefs,
  useWrapElement,
} from "../utils/hooks.js";
import { useStoreState } from "../utils/store.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import {
  MenuScopedContextProvider,
  useMenuProviderContext,
} from "./menu-context.js";
import type { MenuStore } from "./menu-store.js";

type BasePlacement = "top" | "bottom" | "left" | "right";

function useAriaLabelledBy({ store, ...props }: MenuListProps) {
  const [id, setId] = useState<string | undefined>(undefined);
  const label = props["aria-label"];

  const disclosureElement = useStoreState(store, "disclosureElement");
  const contentElement = useStoreState(store, "contentElement");

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
 * Returns props to create a `MenuList` component.
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
  ({ store, alwaysVisible, composite, ...props }) => {
    const context = useMenuProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "MenuList must receive a `store` prop or be wrapped in a MenuProvider component.",
    );

    const parentMenu = store.parent;
    const parentMenuBar = store.menubar;
    const hasParentMenu = !!parentMenu;
    const id = useId(props.id);

    const onKeyDownProp = props.onKeyDown;
    const dir = store.useState(
      (state) => state.placement.split("-")[0] as BasePlacement,
    );
    const orientation = store.useState((state) =>
      state.orientation === "both" ? undefined : state.orientation,
    );
    const isHorizontal = orientation !== "vertical";
    const isMenuBarHorizontal = useStoreState(
      parentMenuBar,
      (state) => !!state && state.orientation !== "vertical",
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
          return store?.hide();
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
        <MenuScopedContextProvider value={store}>
          {element}
        </MenuScopedContextProvider>
      ),
      [store],
    );

    const ariaLabelledBy = useAriaLabelledBy({ store, ...props });
    const mounted = store.useState("mounted");
    const hidden = isHidden(mounted, props.hidden, alwaysVisible);
    const style = hidden ? { ...props.style, display: "none" } : props.style;

    props = {
      id,
      "aria-labelledby": ariaLabelledBy,
      hidden,
      ...props,
      ref: useMergeRefs(id ? store.setContentElement : null, props.ref),
      style,
      onKeyDown,
    };

    const hasCombobox = !!store.combobox;
    composite = composite ?? !hasCombobox;

    if (composite) {
      props = {
        role: "menu",
        "aria-orientation": orientation,
        ...props,
      };
    }

    props = useComposite({ store, composite, ...props });
    props = useCompositeTypeahead({ store, typeahead: !hasCombobox, ...props });

    return props;
  },
);

/**
 * Renders a menu list element.
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

export interface MenuListOptions<T extends As = "div">
  extends CompositeOptions<T>,
    CompositeTypeaheadOptions<T>,
    Pick<DisclosureContentOptions, "alwaysVisible"> {
  /**
   * Object returned by the `useMenuStore` hook.
   */
  store?: MenuStore;
}

export type MenuListProps<T extends As = "div"> = Props<MenuListOptions<T>>;
