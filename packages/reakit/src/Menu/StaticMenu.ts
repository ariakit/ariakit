import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { Keys } from "../__utils/types";
import { useShortcuts } from "./__utils/useShortcuts";
import {
  unstable_StaticMenuStateReturn,
  unstable_useStaticMenuState
} from "./StaticMenuState";

export type unstable_StaticMenuOptions = unstable_BoxOptions &
  Partial<unstable_StaticMenuStateReturn> &
  Pick<unstable_StaticMenuStateReturn, "unstable_stops" | "unstable_move">;

export type unstable_StaticMenuProps = unstable_BoxProps;

export function unstable_useStaticMenu(
  options: unstable_StaticMenuOptions,
  htmlProps: unstable_StaticMenuProps = {}
) {
  const onKeyDown = useShortcuts(options);

  const ariaOwns = options.unstable_stops
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

const keys: Keys<unstable_StaticMenuOptions> = [
  ...useBox.__keys,
  ...unstable_useStaticMenuState.__keys
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
      "StaticMenu"
    );

    return unstable_useCreateElement(type, props, children);
  }
});
