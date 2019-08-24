import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { mergeRefs } from "reakit-utils/mergeRefs";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { isFocusable } from "reakit-utils/tabbable";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";

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
  return (
    element instanceof HTMLButtonElement ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLAnchorElement ||
    element instanceof HTMLAudioElement ||
    element instanceof HTMLVideoElement
  );
}

function isFormTabbable(element: EventTarget) {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  );
}

const defaultClickKeys = ["Enter", " "];

export const useTabbable = createHook<TabbableOptions, TabbableHTMLProps>({
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
    {
      ref: htmlRef,
      tabIndex: htmlTabIndex = 0,
      onClick: htmlOnClick,
      onMouseOver: htmlOnMouseOver,
      onMouseDown: htmlOnMouseDown,
      onKeyDown: htmlOnKeyDown,
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLElement>(null);
    const clickKeysRef = useLiveRef(options.unstable_clickKeys);
    const trulyDisabled = options.disabled && !options.focusable;

    const onMouseDown = React.useCallback(
      (event: React.MouseEvent) => {
        if (
          isFormTabbable(event.target) ||
          // https://github.com/facebook/react/issues/11387
          !event.currentTarget.contains(event.target as HTMLElement)
        ) {
          if (htmlOnMouseDown) {
            htmlOnMouseDown(event);
          }
          return;
        }
        event.preventDefault();
        if (options.disabled) {
          event.stopPropagation();
        } else {
          const currentTarget = event.currentTarget as HTMLElement;
          const target = event.target as HTMLElement;
          const isFocusControl =
            isFocusable(target) || target instanceof HTMLLabelElement;
          if (
            !hasFocusWithin(currentTarget) ||
            // has focus within, but clicked on the tabbable element itself
            currentTarget === target ||
            // clicked on an element other than the tabbable, but it's not
            // focusable nor a label element (controls focus)
            !isFocusControl
          ) {
            currentTarget.focus();
          }
          if (htmlOnMouseDown) {
            htmlOnMouseDown(event);
          }
        }
      },
      [options.disabled, htmlOnMouseDown]
    );

    const onClick = React.useCallback(
      (event: React.MouseEvent) => {
        if (options.disabled) {
          event.stopPropagation();
          event.preventDefault();
        } else if (htmlOnClick) {
          htmlOnClick(event);
        }
      },
      [options.disabled, htmlOnClick]
    );

    const onMouseOver = React.useCallback(
      (event: React.MouseEvent) => {
        if (options.disabled) {
          event.stopPropagation();
          event.preventDefault();
        } else if (htmlOnMouseOver) {
          htmlOnMouseOver(event);
        }
      },
      [options.disabled, htmlOnMouseOver]
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (options.disabled) return;

        const isClickKey =
          clickKeysRef.current &&
          clickKeysRef.current.indexOf(event.key) !== -1;

        if (!isClickKey) return;

        const isDefaultClickKey = defaultClickKeys.indexOf(event.key) !== -1;

        if (isDefaultClickKey && isNativeTabbable(event.target)) {
          return;
        }

        event.preventDefault();
        event.target.dispatchEvent(
          new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: false
          })
        );
      },
      [clickKeysRef, options.disabled]
    );

    return {
      ref: mergeRefs(ref, htmlRef),
      disabled: trulyDisabled,
      tabIndex: trulyDisabled ? undefined : htmlTabIndex,
      "aria-disabled": options.disabled,
      onMouseDown,
      onClick,
      onMouseOver,
      onKeyDown: useAllCallbacks(onKeyDown, htmlOnKeyDown),
      ...htmlProps
    };
  }
});

export const Tabbable = createComponent({
  as: "button",
  useHook: useTabbable
});
