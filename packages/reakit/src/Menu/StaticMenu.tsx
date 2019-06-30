import * as React from "react";
import { warning } from "reakit-utils/warning";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createHook } from "reakit-system/createHook";
import { usePipe } from "reakit-utils/usePipe";
import { mergeRefs } from "reakit-utils/mergeRefs";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { useShortcuts } from "./__utils/useShortcuts";
import { MenuContext } from "./__utils/MenuContext";
import { MenuStateReturn, useMenuState } from "./MenuState";

export type StaticMenuOptions = BoxOptions &
  Pick<Partial<MenuStateReturn>, "orientation"> &
  Pick<MenuStateReturn, "stops" | "move" | "next" | "previous">;

export type StaticMenuHTMLProps = BoxHTMLProps;

export type StaticMenuProps = StaticMenuOptions & StaticMenuHTMLProps;

export const useStaticMenu = createHook<StaticMenuOptions, StaticMenuHTMLProps>(
  {
    name: "StaticMenu",
    compose: useBox,
    useState: useMenuState,

    useProps(options, { ref: htmlRef, unstable_wrap: htmlWrap, ...htmlProps }) {
      const ref = React.useRef<HTMLElement>(null);
      const parent = React.useContext(MenuContext);

      const providerValue = React.useMemo(
        () => ({
          orientation: options.orientation,
          next: options.next,
          previous: options.previous,
          parent
        }),
        [options.orientation, options.next, options.previous, parent]
      );

      useShortcuts(ref, options);

      const wrap = React.useCallback(
        (children: React.ReactNode) => (
          <MenuContext.Provider value={providerValue}>
            {children}
          </MenuContext.Provider>
        ),
        [providerValue]
      );

      return {
        ref: mergeRefs(ref, htmlRef),
        role: options.orientation === "horizontal" ? "menubar" : "menu",
        "aria-orientation": options.orientation,
        unstable_wrap: usePipe(wrap, htmlWrap),
        ...htmlProps
      };
    }
  }
);

export const StaticMenu = createComponent({
  as: "div",
  useHook: useStaticMenu,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] &&
        !props["aria-labelledby"] &&
        props.role !== "menubar",
      "Menu",
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/menu"
    );

    return useCreateElement(type, props, children);
  }
});
