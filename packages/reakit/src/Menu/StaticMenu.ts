import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { Keys } from "../__utils/types";
import { useShortcuts } from "./__utils/useShortcuts";
import { unstable_MenuStateReturn, useMenuState } from "./MenuState";

export type unstable_StaticMenuOptions = unstable_BoxOptions &
  Partial<unstable_MenuStateReturn> &
  Pick<unstable_MenuStateReturn, "unstable_stops" | "unstable_move">;

export type unstable_StaticMenuProps = unstable_BoxProps;

export function unstable_useStaticMenu(
  options: unstable_StaticMenuOptions,
  htmlProps: unstable_StaticMenuProps = {}
) {
  options = unstable_useOptions("useStaticMenu", options, htmlProps);

  const onKeyDown = useShortcuts(options);

  htmlProps = mergeProps(
    {
      role: options.orientation === "horizontal" ? "menubar" : "menu",
      "aria-orientation": options.orientation,
      onKeyDown
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useProps("useStaticMenu", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_StaticMenuOptions> = [
  ...useBox.__keys,
  ...useMenuState.__keys
];

unstable_useStaticMenu.__keys = keys;

export const unstable_StaticMenu = unstable_createComponent({
  as: "div",
  useHook: unstable_useStaticMenu,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] &&
        !props["aria-labelledby"] &&
        props.role !== "menubar",
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#wai-aria-roles-states-and-properties-13`,
      "Menu"
    );

    return unstable_useCreateElement(type, props, children);
  }
});
