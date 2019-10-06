import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
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
   * Whether or not trigger click on pressing <kbd>Enter</kbd>.
   * @private
   */
  unstable_clickOnEnter?: boolean;
  /**
   * Whether or not trigger click on pressing <kbd>Space</kbd>.
   * @private
   */
  unstable_clickOnSpace?: boolean;
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

function isInput(element: EventTarget) {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  );
}

// https://twitter.com/diegohaz/status/1176998102139572225
function hasFocusOnMouseDown(element: EventTarget) {
  const { userAgent } = navigator;
  const is = (string: string) => userAgent.indexOf(string) !== -1;
  const isLikeMac = is("Mac") || is("like Mac");
  const isSafariOrFirefox = is("Safari") || is("Firefox");
  return (
    !isLikeMac || !isSafariOrFirefox || !(element instanceof HTMLButtonElement)
  );
}

export const useTabbable = createHook<TabbableOptions, TabbableHTMLProps>({
  name: "Tabbable",
  compose: useBox,
  keys: [
    "disabled",
    "focusable",
    "unstable_clickOnEnter",
    "unstable_clickOnSpace"
  ],

  useOptions(
    { unstable_clickOnEnter = true, unstable_clickOnSpace = true, ...options },
    htmlProps
  ) {
    return {
      disabled: htmlProps.disabled,
      unstable_clickOnEnter,
      unstable_clickOnSpace,
      ...options
    };
  },

  useProps(
    options,
    {
      ref: htmlRef,
      tabIndex: htmlTabIndex = 0,
      onMouseDown: htmlOnMouseDown,
      onKeyDown: htmlOnKeyDown,
      style: htmlStyle,
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLElement>(null);
    const trulyDisabled = options.disabled && !options.focusable;
    const style = options.disabled
      ? { "pointer-events": "none", ...htmlStyle }
      : htmlStyle;

    const onMouseDown = React.useCallback((event: React.MouseEvent) => {
      const self = event.currentTarget as HTMLElement;
      const target = event.target as HTMLElement;

      if (
        self.contains(target) &&
        !isInput(target) &&
        !hasFocusOnMouseDown(self)
      ) {
        event.preventDefault();
        const isFocusControl =
          isFocusable(target) || target instanceof HTMLLabelElement;
        if (!hasFocusWithin(self) || self === target || !isFocusControl) {
          self.focus();
        }
      }
    }, []);

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (options.disabled) return;

        if (!isNativeTabbable(event.currentTarget)) {
          // Per the spec, space only triggers button click on key up.
          // On key down, it triggers the :active state.
          // Since we can't mimic this behavior, we trigger click on key down.
          if (
            (options.unstable_clickOnEnter && event.key === "Enter") ||
            (options.unstable_clickOnSpace && event.key === " ")
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
        } else if (
          (!options.unstable_clickOnEnter && event.key === "Enter") ||
          (!options.unstable_clickOnSpace && event.key === " ")
        ) {
          event.preventDefault();
        }
      },
      [
        options.disabled,
        options.unstable_clickOnEnter,
        options.unstable_clickOnSpace
      ]
    );

    return {
      ref: mergeRefs(ref, htmlRef),
      disabled: trulyDisabled,
      tabIndex: trulyDisabled ? undefined : htmlTabIndex,
      "aria-disabled": options.disabled,
      onMouseDown: useAllCallbacks(onMouseDown, htmlOnMouseDown),
      onKeyDown: useAllCallbacks(onKeyDown, htmlOnKeyDown),
      style,
      ...htmlProps
    };
  }
});

export const Tabbable = createComponent({
  as: "button",
  useHook: useTabbable
});
