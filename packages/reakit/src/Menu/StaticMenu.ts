import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";

import { useShortcuts } from "./__utils/useShortcuts";
import { useMenuState, unstable_MenuStateReturn } from "./MenuState";

export type unstable_StaticMenuOptions = unstable_BoxOptions &
  Partial<unstable_MenuStateReturn> &
  Pick<unstable_MenuStateReturn, "stops" | "move">;

export type unstable_StaticMenuProps = unstable_BoxProps;

export function useStaticMenu(
  options: unstable_StaticMenuOptions,
  htmlProps: unstable_StaticMenuProps = {}
) {
  const onKeyDown = useShortcuts(options);

  const ariaOwns = options.stops
    .map(stop => {
      const ariaControls = stop.ref.current!.getAttribute("aria-controls");
      if (ariaControls) return `${stop.id} ${ariaControls}`;
      return stop.id;
    })
    .join(" ");

  htmlProps = mergeProps(
    {
      role: options.orientation === "horizontal" ? "menubar" : "menu",
      "aria-orientation": options.orientation,
      "aria-owns": ariaOwns,
      onKeyDown
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = useHook("useStaticMenu", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_StaticMenuOptions> = [
  ...useBox.keys,
  ...useMenuState.keys
];

useStaticMenu.keys = keys;

export const StaticMenu = unstable_createComponent(
  "div",
  useStaticMenu,
  (type, props, children) => {
    warning(
      props["aria-label"] ||
        props["aria-labelledby"] ||
        props.role === "menubar",
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#wai-aria-roles-states-and-properties-13`,
      "StaticMenu"
    );

    return unstable_useCreateElement(type, props, children);
  }
);
