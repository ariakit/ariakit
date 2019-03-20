import * as React from "react";

import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";

import { useMenuItem } from "./MenuItem";
import {
  unstable_MenuDisclosureOptions,
  unstable_MenuDisclosureProps,
  useMenuDisclosure
} from "./MenuDisclosure";
import { useMenuState, unstable_MenuStateReturn } from "./MenuState";

export type unstable_MenuItemDisclosureOptions = unstable_MenuDisclosureOptions &
  Partial<unstable_MenuStateReturn> &
  Pick<unstable_MenuStateReturn, "hide"> & {
    /** TODO: Description */
    stopId?: string;
  };

export type unstable_MenuItemDisclosureProps = unstable_MenuDisclosureProps;

export function useMenuItemDisclosure(
  { stopId, ...options }: unstable_MenuItemDisclosureOptions,
  htmlProps: unstable_MenuItemDisclosureProps = {}
) {
  const ref = React.useRef<HTMLElement | null>(null);
  const { parent } = options;

  if (!parent) {
    throw new Error("Missing parent prop");
  }

  React.useEffect(() => {
    if (!parent || parent.orientation !== "horizontal") return;
    const thisStop = parent.stops.find(s => s.ref.current === ref.current);
    const thisIsCurrent = thisStop && thisStop.id === parent.currentId;
    if (thisIsCurrent) {
      options.show();
    } else {
      options.hide();
    }
  }, [
    parent.orientation,
    parent.currentId,
    parent.stops,
    options.show,
    options.hide
  ]);

  htmlProps = mergeProps({ ref } as typeof htmlProps, htmlProps);
  htmlProps = useMenuItem({ stopId, ...parent }, htmlProps);
  htmlProps = useMenuDisclosure(options, htmlProps);
  htmlProps = useHook("useMenuItemDisclosure", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_MenuItemDisclosureOptions> = [
  ...useMenuDisclosure.keys,
  ...useMenuState.keys,
  "stopId"
];

useMenuItemDisclosure.keys = keys;

export const MenuItemDisclosure = unstable_createComponent(
  "button",
  useMenuItemDisclosure
);
