import * as React from "react";
import { warning } from "reakit-utils/warning";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createHook } from "reakit-system/createHook";
import { usePipe } from "reakit-utils/usePipe";
import { mergeRefs } from "reakit-utils/mergeRefs";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { useShortcuts } from "./__utils/useShortcuts";
import { useMenuContext } from "./__utils/MenuContext";
import { MenuStateReturn, useMenuState } from "./MenuState";

export type MenuBarOptions = BoxOptions &
  Pick<Partial<MenuStateReturn>, "orientation"> &
  Pick<MenuStateReturn, "stops" | "move" | "next" | "previous">;

export type MenuBarHTMLProps = BoxHTMLProps;

export type MenuBarProps = MenuBarOptions & MenuBarHTMLProps;

export const useMenuBar = createHook<MenuBarOptions, MenuBarHTMLProps>({
  name: "MenuBar",
  compose: useBox,
  useState: useMenuState,

  useProps(
    options,
    {
      ref: htmlRef,
      wrapElement: htmlWrapElement,
      role = "menubar",
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLElement>(null);
    const wrapElement = useMenuContext(ref, role, options);

    useShortcuts(ref, options);

    return {
      ref: mergeRefs(ref, htmlRef),
      role,
      "aria-orientation": options.orientation,
      wrapElement: usePipe(wrapElement, htmlWrapElement),
      ...htmlProps
    };
  }
});

export const MenuBar = createComponent({
  as: "div",
  useHook: useMenuBar,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] &&
        !props["aria-labelledby"] &&
        props.role !== "menubar",
      "[reakit/Menu]",
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/menu"
    );

    return useCreateElement(type, props, children);
  }
});
