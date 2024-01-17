import type { ElementType, KeyboardEvent } from "react";
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
import { createElement, createHook2, forwardRef } from "../utils/system.js";
import type { Props2 } from "../utils/types.js";
import {
  MenuScopedContextProvider,
  useMenuProviderContext,
} from "./menu-context.js";
import type { MenuStore } from "./menu-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];
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
export const useMenuList = createHook2<TagName, MenuListOptions>(
  function useMenuList({ store, alwaysVisible, composite, ...props }) {
    const context = useMenuProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "MenuList must receive a `store` prop or be wrapped in a MenuProvider component.",
    );

    const parentMenu = store.parent;
    const parentMenubar = store.menubar;
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
    const isMenubarHorizontal = useStoreState(
      parentMenubar,
      (state) => !!state && state.orientation !== "vertical",
    );

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (hasParentMenu || (parentMenubar && !isHorizontal)) {
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
      if (parentMenubar) {
        const keyMap = {
          ArrowRight: () => {
            if (!isMenubarHorizontal) return;
            return parentMenubar.next();
          },
          ArrowLeft: () => {
            if (!isMenubarHorizontal) return;
            return parentMenubar.previous();
          },
          ArrowDown: () => {
            if (isMenubarHorizontal) return;
            return parentMenubar.next();
          },
          ArrowUp: () => {
            if (isMenubarHorizontal) return;
            return parentMenubar.previous();
          },
        };
        const action = keyMap[event.key as keyof typeof keyMap];
        const id = action?.();
        if (id !== undefined) {
          event.stopPropagation();
          event.preventDefault();
          parentMenubar.move(id);
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
 * Renders a menu list element. This is the primitive component used by the
 * [`Menu`](https://ariakit.org/reference/menu) component.
 *
 * Unlike [`Menu`](https://ariakit.org/reference/menu), this component doesn't
 * render a popover and therefore doesn't automatically focus on items when
 * opened.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {3-6}
 * <MenuProvider>
 *   <MenuButton>Edit</MenuButton>
 *   <MenuList>
 *     <MenuItem>Undo</MenuItem>
 *     <MenuItem>Redo</MenuItem>
 *   </MenuList>
 * </MenuProvider>
 * ```
 */
export const MenuList = forwardRef(function MenuList(props: MenuListProps) {
  const htmlProps = useMenuList(props);
  return createElement(TagName, htmlProps);
});

export interface MenuListOptions<T extends ElementType = TagName>
  extends CompositeOptions<T>,
    CompositeTypeaheadOptions<T>,
    Pick<DisclosureContentOptions, "alwaysVisible"> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
   * provided, the closest
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider) component's
   * context will be used.
   */
  store?: MenuStore;
}

export type MenuListProps<T extends ElementType = TagName> = Props2<
  T,
  MenuListOptions<T>
>;
