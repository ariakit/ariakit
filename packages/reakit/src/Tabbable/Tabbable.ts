import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { useLiveRef } from "../__utils/useLiveRef";
import { unstable_createHook } from "../utils/createHook";

export type TabbableOptions = BoxOptions & {
  /**
   * Same as the HTML attribute.
   */
  disabled?: boolean;
  /**
   * When an element is `disabled`, it may still be `focusable`. It works
   * similarly to `readOnly` on form elements. In this case, only
   * `aria-disabled` will be set.
   */
  focusable?: boolean;
  /**
   * Keyboard keys to trigger click.
   * @private
   */
  unstable_clickKeys?: string[];
};

export type TabbableHTMLProps = BoxHTMLProps & {
  disabled?: boolean;
};

export type TabbableProps = TabbableOptions & TabbableHTMLProps;

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

const defaultClickKeys = ["Enter", " "];

export const useTabbable = unstable_createHook<
  TabbableOptions,
  TabbableHTMLProps
>({
  name: "Tabbable",
  compose: useBox,
  keys: ["disabled", "focusable", "unstable_clickKeys"],

  useOptions({ unstable_clickKeys = defaultClickKeys, ...options }, htmlProps) {
    return {
      unstable_clickKeys,
      disabled: htmlProps.disabled,
      ...options
    };
  },

  useProps(
    options,
    { tabIndex = 0, onClick, onMouseOver, onMouseDown, ...htmlProps }
  ) {
    const ref = React.useRef<HTMLElement>(null);
    const clickKeysRef = useLiveRef(options.unstable_clickKeys);
    const trulyDisabled = options.disabled && !options.focusable;

    return mergeProps(
      {
        ref,
        disabled: trulyDisabled,
        tabIndex: trulyDisabled ? undefined : tabIndex,
        "aria-disabled": options.disabled,
        onMouseDown: React.useCallback(
          (event: React.MouseEvent) => {
            event.preventDefault();
            if (options.disabled) {
              event.stopPropagation();
            } else {
              (ref.current || (event.target as HTMLElement)).focus();
              if (onMouseDown) {
                onMouseDown(event);
              }
            }
          },
          [options.disabled, onMouseDown]
        ),
        onClick: React.useCallback(
          (event: React.MouseEvent) => {
            if (options.disabled) {
              event.stopPropagation();
              event.preventDefault();
            } else if (onClick) {
              onClick(event);
            }
          },
          [options.disabled, onClick]
        ),
        onMouseOver: React.useCallback(
          (event: React.MouseEvent) => {
            if (options.disabled) {
              event.stopPropagation();
              event.preventDefault();
            } else if (onMouseOver) {
              onMouseOver(event);
            }
          },
          [options.disabled, onMouseOver]
        ),
        onKeyDown: React.useCallback(
          (event: React.KeyboardEvent) => {
            if (options.disabled) return;
            if (
              clickKeysRef.current === defaultClickKeys &&
              isNativeTabbable(event.target)
            ) {
              return;
            }

            if (
              clickKeysRef.current &&
              clickKeysRef.current.indexOf(event.key) !== -1
            ) {
              event.preventDefault();
              event.target.dispatchEvent(
                new MouseEvent("click", {
                  view: window,
                  bubbles: true,
                  cancelable: false
                })
              );
            }
          },
          [options.disabled]
        )
      } as TabbableHTMLProps,
      htmlProps
    );
  }
});

export const Tabbable = unstable_createComponent({
  as: "button",
  useHook: useTabbable
});
