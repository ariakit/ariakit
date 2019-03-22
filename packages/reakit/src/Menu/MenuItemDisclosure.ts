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
  const ref = React.useRef<HTMLElement>(null);
  const { parent } = options;

  if (!parent) {
    // TODO: Better error
    throw new Error("Missing parent prop");
  }

  const lastMouseDown = React.useRef<EventTarget | null>();

  React.useEffect(() => {
    if (!ref.current || !parent || parent.orientation !== "horizontal")
      return undefined;

    const handleFocus = (event: FocusEvent) => {
      if (event.target !== lastMouseDown.current) {
        options.show();
      }
    };

    const handleBlur = () => {
      lastMouseDown.current = null;
    };

    const handleMouseDown = (event: MouseEvent | TouchEvent) => {
      lastMouseDown.current = event.target;
    };

    ref.current.addEventListener("focus", handleFocus);
    ref.current.addEventListener("blur", handleBlur);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("touchstart", handleMouseDown);
    return () => {
      ref.current!.removeEventListener("focus", handleFocus);
      ref.current!.removeEventListener("blur", handleBlur);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("touchstart", handleMouseDown);
    };
  }, []);

  React.useEffect(() => {
    if (!parent || parent.orientation !== "horizontal") return;
    const thisStop = parent.stops.find(s => s.ref.current === ref.current);
    const thisIsCurrent = thisStop && thisStop.id === parent.currentId;
    if (!thisIsCurrent && options.visible) {
      options.hide();
    }
  }, [
    parent.orientation,
    parent.currentId,
    parent.stops,
    options.show,
    options.hide
  ]);

  htmlProps = mergeProps(
    {
      ref,
      onKeyDown: event => {
        if (event.key === "Escape") {
          event.preventDefault();
          options.hide();
        }
      }
    } as typeof htmlProps,
    htmlProps
  );
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
