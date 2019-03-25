import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { useLiveRef } from "../__utils/useLiveRef";
import { Keys } from "../__utils/types";

export type unstable_TabbableOptions = unstable_BoxOptions & {
  /**
   * Same as the HTML attribute.
   * @default 0
   */
  tabIndex?: number;
  /**
   * Same as the HTML attribute.
   */
  disabled?: boolean;
  /**
   * Same as the React prop. This won't be called if the `disabled` is passed.
   */
  onClick?: React.MouseEventHandler;
  /**
   * When an element is `disabled`, it may still be `focusable`.
   * In this case, only `aria-disabled` will be set.
   */
  unstable_focusable?: boolean;
  /**
   * Keyboard keys to trigger click.
   * @default [" "] // (space)
   */
  unstable_clickKeys?: string[];
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
    unstable_clickKeys = [" "],
    ...options
  }: unstable_TabbableOptions = {},
  htmlProps: unstable_TabbableProps = {}
) {
  const clickKeysRef = useLiveRef(unstable_clickKeys);

  const allOptions: unstable_TabbableOptions = {
    tabIndex,
    unstable_clickKeys,
    ...options
  };
  const reallyDisabled = options.disabled && !options.unstable_focusable;

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

        if (clickKeysRef.current.indexOf(event.key) !== -1) {
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

const keys: Keys<unstable_TabbableOptions> = [
  ...useBox.__keys,
  "tabIndex",
  "disabled",
  "onClick",
  "unstable_focusable",
  "unstable_clickKeys"
];

useTabbable.__keys = keys;

export const Tabbable = unstable_createComponent({
  as: "button",
  useHook: useTabbable
});
