import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useForkRef } from "reakit-utils/useForkRef";
import { isFocusable } from "reakit-utils/tabbable";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import { isButton } from "reakit-utils/isButton";
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

function isNativeTabbable(element: Element) {
  return (
    element.tagName === "BUTTON" ||
    element.tagName === "INPUT" ||
    element.tagName === "SELECT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "A" ||
    element.tagName === "AUDIO" ||
    element.tagName === "VIDEO"
  );
}

// https://twitter.com/diegohaz/status/1176998102139572225
function isUserAgent(string: string) {
  if (typeof window === "undefined") return false;
  return window.navigator.userAgent.indexOf(string) !== -1;
}

const isSafariOrFirefoxOnMac =
  isUserAgent("Mac") && (isUserAgent("Safari") || isUserAgent("Firefox"));

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
    { disabled }
  ) {
    return {
      disabled,
      unstable_clickOnEnter,
      unstable_clickOnSpace,
      ...options
    };
  },

  useProps(
    options,
    {
      ref: htmlRef,
      tabIndex: htmlTabIndex,
      onClick: htmlOnClick,
      onMouseDown: htmlOnMouseDown,
      onKeyDown: htmlOnKeyDown,
      style: htmlStyle,
      "data-custom-tabbable": isCustomTabbableAlready,
      ...htmlProps
    }: TabbableHTMLProps & { "data-custom-tabbable"?: boolean }
  ) {
    const ref = React.useRef<HTMLElement>(null);
    const trulyDisabled = options.disabled && !options.focusable;
    const [nativeTabbable, setNativeTabbable] = React.useState(true);
    const tabIndex = nativeTabbable ? htmlTabIndex : htmlTabIndex || 0;
    const style = trulyDisabled
      ? { pointerEvents: "none" as const, ...htmlStyle }
      : htmlStyle;

    React.useEffect(() => {
      const tabbable = ref.current;
      if (tabbable && !isNativeTabbable(tabbable)) {
        setNativeTabbable(false);
      }
    }, []);

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

    const onMouseDown = React.useCallback(
      (event: React.MouseEvent) => {
        if (options.disabled) {
          event.stopPropagation();
          event.preventDefault();
          return;
        }

        if (htmlOnMouseDown) {
          htmlOnMouseDown(event);
        }

        if (event.defaultPrevented) {
          return;
        }

        const self = event.currentTarget as HTMLElement;
        const target = event.target as HTMLElement;

        if (isSafariOrFirefoxOnMac && isButton(self) && self.contains(target)) {
          event.preventDefault();
          const isFocusControl =
            isFocusable(target) || target instanceof HTMLLabelElement;
          if (!hasFocusWithin(self) || self === target || !isFocusControl) {
            self.focus();
          }
        }
      },
      [options.disabled, htmlOnMouseDown]
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (htmlOnKeyDown) {
          htmlOnKeyDown(event);
        }

        if (
          options.disabled ||
          isNativeTabbable(event.currentTarget) ||
          // Native interactive elements don't get clicked on cmd+Enter/Space
          event.metaKey ||
          // This will be true if `useTabbable` has already been used.
          // In this case, we don't want to .click() twice.
          isCustomTabbableAlready
        ) {
          return;
        }

        // Per the spec, space only triggers button click on key up.
        // On key down, it triggers the :active state.
        // Since we can't mimic this behavior, we trigger click on key down.
        if (
          (options.unstable_clickOnEnter && event.key === "Enter") ||
          (options.unstable_clickOnSpace && event.key === " ")
        ) {
          event.preventDefault();
          (event.target as HTMLElement).click();
        }
      },
      [
        isCustomTabbableAlready,
        options.disabled,
        options.unstable_clickOnEnter,
        options.unstable_clickOnSpace,
        htmlOnKeyDown
      ]
    );

    return {
      ref: useForkRef(ref, htmlRef),
      disabled: trulyDisabled,
      tabIndex: trulyDisabled ? undefined : tabIndex,
      "aria-disabled": options.disabled,
      onClick,
      onMouseDown,
      onKeyDown,
      style,
      "data-custom-tabbable": nativeTabbable ? undefined : true,
      ...htmlProps
    };
  }
});

export const Tabbable = createComponent({
  as: "button",
  useHook: useTabbable
});
