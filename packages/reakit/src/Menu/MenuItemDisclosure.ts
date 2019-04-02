import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { Keys } from "../__utils/types";
import { useMenuItem } from "./MenuItem";
import {
  unstable_MenuDisclosureOptions,
  unstable_MenuDisclosureProps,
  useMenuDisclosure
} from "./MenuDisclosure";
import { useMenuState, unstable_MenuStateReturn } from "./MenuState";
import { useKeyboardFocus } from "./__utils/useKeyboardFocus";

export type unstable_MenuItemDisclosureOptions = unstable_MenuDisclosureOptions &
  Partial<unstable_MenuStateReturn> &
  Pick<unstable_MenuStateReturn, "show" | "hide"> & {
    /** TODO: Description */
    stopId?: string;
  };

export type unstable_MenuItemDisclosureProps = unstable_MenuDisclosureProps;

export function unstable_useMenuItemDisclosure(
  { unstable_focusable = true, ...options }: unstable_MenuItemDisclosureOptions,
  htmlProps: unstable_MenuItemDisclosureProps = {}
) {
  let _options: unstable_MenuItemDisclosureOptions = {
    unstable_focusable,
    ...options
  };
  _options = unstable_useOptions("useMenuItemDisclosure", _options, htmlProps);

  const ref = React.useRef<HTMLElement>(null);
  const { unstable_parent: parent } = _options;

  if (!parent) {
    // TODO: Better error
    throw new Error("Missing parent prop");
  }

  useKeyboardFocus(
    ref,
    _options.show,
    parent.orientation === "horizontal" && !_options.disabled
  );

  React.useEffect(() => {
    if (parent.orientation !== "horizontal") return;
    const thisStop = parent.unstable_stops.find(
      stop => stop.ref.current === ref.current
    );
    const thisIsCurrent = thisStop && thisStop.id === parent.unstable_currentId;
    if (!thisIsCurrent && _options.visible) {
      _options.hide();
    }
  }, [
    parent.orientation,
    parent.unstable_currentId,
    parent.unstable_stops,
    _options.hide
  ]);

  htmlProps = mergeProps(
    {
      ref,
      onKeyDown: event => {
        if (event.key === "Escape") {
          event.preventDefault();
          _options.hide();
        }
      }
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useMenuItem({ ..._options, ...parent }, htmlProps);
  htmlProps = useMenuDisclosure(_options, htmlProps);
  htmlProps = unstable_useProps("useMenuItemDisclosure", _options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_MenuItemDisclosureOptions> = [
  ...useMenuDisclosure.__keys,
  ...useMenuState.__keys,
  "stopId"
];

unstable_useMenuItemDisclosure.__keys = keys;

export const unstable_MenuItemDisclosure = unstable_createComponent({
  as: "button",
  useHook: unstable_useMenuItemDisclosure
});
