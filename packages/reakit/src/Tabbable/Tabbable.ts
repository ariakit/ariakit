import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";

export type unstable_TabbableOptions = unstable_BoxOptions & {
  /** TODO: Description */
  tabIndex?: number;
  /** TODO: Description */
  disabled?: boolean;
  /** TODO: Description */
  onClick?: React.MouseEventHandler;
  /** TODO: Description */
  focusable?: boolean;
  /** TODO: Description */
  clickKeys?: string[];
};

export type unstable_TabbableProps = unstable_BoxProps;

function isNativeTabbable(element: EventTarget) {
  if (element instanceof HTMLButtonElement) return true;
  if (element instanceof HTMLInputElement) return true;
  if (element instanceof HTMLSelectElement) return true;
  if (element instanceof HTMLTextAreaElement) return true;
  if (element instanceof HTMLAnchorElement) return true;
  if (element instanceof HTMLAudioElement) return true;
  if (element instanceof HTMLVideoElement) return true;
  return false;
}

export function useTabbable(
  {
    tabIndex = 0,
    clickKeys = [" "],
    ...options
  }: unstable_TabbableOptions = {},
  htmlProps: unstable_TabbableProps = {}
) {
  const allOptions = { tabIndex, clickKeys, ...options };
  const reallyDisabled = options.disabled && !options.focusable;

  htmlProps = mergeProps(
    {
      disabled: reallyDisabled,
      tabIndex: reallyDisabled ? undefined : tabIndex,
      "aria-disabled": options.disabled,
      onClick: event => {
        if (options.disabled) {
          event.stopPropagation();
          event.preventDefault();
        } else if (options.onClick) {
          options.onClick(event);
        }
      },
      onKeyDown: event => {
        if (isNativeTabbable(event.target) || options.disabled) return;

        if (clickKeys.indexOf(event.key) !== -1) {
          event.preventDefault();
          event.target.dispatchEvent(
            new MouseEvent("click", {
              view: window,
              bubbles: true,
              cancelable: false
            })
          );
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useBox(allOptions, htmlProps);
  htmlProps = useHook("useTabbable", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_TabbableOptions> = [
  ...useBox.keys,
  "tabIndex",
  "disabled",
  "onClick",
  "focusable",
  "clickKeys"
];

useTabbable.keys = keys;

export const Tabbable = unstable_createComponent("button", useTabbable);
