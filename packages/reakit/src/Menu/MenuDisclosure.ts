import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  PopoverDisclosureOptions,
  PopoverDisclosureProps,
  usePopoverDisclosure
} from "../Popover/PopoverDisclosure";
import { Keys } from "../__utils/types";
import { createOnKeyDown } from "../__utils/createOnKeyDown";
import { warning } from "../__utils/warning";
import { useMenuState, MenuStateReturn } from "./MenuState";
import { MenuContext } from "./__utils/MenuContext";

export type MenuDisclosureOptions = PopoverDisclosureOptions &
  Pick<Partial<MenuStateReturn>, "hide" | "first" | "last"> &
  Pick<MenuStateReturn, "show" | "placement">;

export type MenuDisclosureProps = PopoverDisclosureProps;

export function useMenuDisclosure(
  options: MenuDisclosureOptions,
  htmlProps: MenuDisclosureProps = {}
) {
  const parent = React.useContext(MenuContext);
  const ref = React.useRef<HTMLElement>(null);
  // This avoids race condition between focus and click.
  // On some browsers, focus is triggered right before click.
  // So we use it to disable toggling.
  const [hasShownOnFocus, setHasShownOnFocus] = React.useState(false);

  options = unstable_useOptions("MenuDisclosure", options, htmlProps);

  const [dir] = options.placement.split("-");

  // Restores hasShownOnFocus
  React.useEffect(() => {
    if (hasShownOnFocus) {
      setTimeout(() => setHasShownOnFocus(false), 200);
    }
  }, [hasShownOnFocus]);

  const onKeyDown = createOnKeyDown({
    stopPropagation: event => event.key !== "Escape",
    onKey: options.show,
    keyMap: {
      Escape: options.hide,
      Enter: parent && options.first,
      " ": parent && options.first,
      ArrowUp: dir === "top" || dir === "bottom" ? options.last : false,
      ArrowRight: dir === "right" && options.first,
      ArrowDown: dir === "bottom" || dir === "top" ? options.first : false,
      ArrowLeft: dir === "left" && options.first
    }
  });

  htmlProps = mergeProps(
    {
      ref,
      "aria-haspopup": "menu",
      onFocus: () => {
        if (parent && parent.orientation === "horizontal") {
          setHasShownOnFocus(true);
          options.show();
        }
      },
      onMouseOver: () => {
        if (!parent) return;

        if (!ref.current) {
          warning(
            true,
            "Can't respond to mouse over on `MenuDisclosure` because `ref` wasn't passed to component. See https://reakit.io/docs/menu",
            "MenuDisclosure"
          );
          return;
        }

        const parentIsHorizontal = parent.orientation === "horizontal";

        if (!parentIsHorizontal) {
          setTimeout(() => {
            if (ref.current && ref.current.contains(document.activeElement)) {
              options.show();
              ref.current.focus();
            }
          }, 200);
        } else {
          const parentMenu = ref.current.closest("[role=menu],[role=menubar]");
          const subjacentOpenMenu =
            parentMenu &&
            parentMenu.querySelector("[role=menu][aria-hidden=false]");
          if (subjacentOpenMenu) {
            ref.current.focus();
          }
        }
      },
      onKeyDown
    } as MenuDisclosureProps,
    htmlProps
  );

  htmlProps = unstable_useProps("MenuDisclosure", options, htmlProps);
  htmlProps = usePopoverDisclosure(
    {
      ...options,
      toggle:
        parent && (parent.orientation !== "horizontal" || hasShownOnFocus)
          ? options.show
          : options.toggle
    },
    htmlProps
  );
  return htmlProps;
}

const keys: Keys<MenuStateReturn & MenuDisclosureOptions> = [
  ...usePopoverDisclosure.__keys,
  ...useMenuState.__keys
];

useMenuDisclosure.__keys = keys;

export const MenuDisclosure = unstable_createComponent({
  as: "button",
  useHook: useMenuDisclosure
});
