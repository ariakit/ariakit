import * as React from "react";
import { warning } from "../__utils/warning";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";
import { useAllCallbacks } from "../__utils/useAllCallbacks";
import { usePipe } from "../__utils/usePipe";
import { useShortcuts } from "./__utils/useShortcuts";
import { MenuContext } from "./__utils/MenuContext";
import { MenuStateReturn, useMenuState } from "./MenuState";

export type StaticMenuOptions = BoxOptions &
  Pick<Partial<MenuStateReturn>, "orientation"> &
  Pick<MenuStateReturn, "stops" | "move" | "next" | "previous">;

export type StaticMenuHTMLProps = BoxHTMLProps;

export type StaticMenuProps = StaticMenuOptions & StaticMenuHTMLProps;

export const useStaticMenu = unstable_createHook<
  StaticMenuOptions,
  StaticMenuHTMLProps
>({
  name: "StaticMenu",
  compose: useBox,
  useState: useMenuState,

  useProps(
    options,
    { onKeyDown: htmlOnKeyDown, unstable_wrap: htmlWrap, ...htmlProps }
  ) {
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

    const onKeyDown = useShortcuts(options);

    const wrap = React.useCallback(
      (children: React.ReactNode) => (
        <MenuContext.Provider value={providerValue}>
          {children}
        </MenuContext.Provider>
      ),
      [providerValue]
    );

    return {
      role: options.orientation === "horizontal" ? "menubar" : "menu",
      "aria-orientation": options.orientation,
      onKeyDown: useAllCallbacks(onKeyDown, htmlOnKeyDown),
      unstable_wrap: usePipe(wrap, htmlWrap),
      ...htmlProps
    };
  }
});

export const StaticMenu = unstable_createComponent({
  as: "div",
  useHook: useStaticMenu,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] &&
        !props["aria-labelledby"] &&
        props.role !== "menubar",
      "You should provide either `aria-label` or `aria-labelledby` props. See https://reakit.io/docs/menu",
      "Menu"
    );

    return unstable_useCreateElement(type, props, children);
  }
});
