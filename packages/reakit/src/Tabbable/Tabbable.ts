import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useForkRef } from "reakit-utils/useForkRef";
import { useIsomorphicEffect } from "reakit-utils/useIsomorphicEffect";
import { warning } from "reakit-warning";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { useFocusOnMouseDown } from "./__utils/useFocusOnMouseDown";

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
};

export type TabbableHTMLProps = BoxHTMLProps & {
  disabled?: boolean;
};

export type TabbableProps = TabbableOptions & TabbableHTMLProps;

function isUserAgent(string: string) {
  if (typeof window === "undefined") return false;
  return window.navigator.userAgent.indexOf(string) !== -1;
}

const isSafariOrFirefoxOnMac =
  isUserAgent("Mac") &&
  !isUserAgent("Chrome") &&
  (isUserAgent("Safari") || isUserAgent("Firefox"));

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

export const useTabbable = createHook<TabbableOptions, TabbableHTMLProps>({
  name: "Tabbable",
  compose: useBox,
  keys: ["disabled", "focusable"],

  useOptions(options, { disabled }) {
    return { disabled, ...options };
  },

  useProps(
    options,
    {
      ref: htmlRef,
      tabIndex: htmlTabIndex,
      onClick: htmlOnClick,
      onMouseDown: htmlOnMouseDown,
      style: htmlStyle,
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLElement>(null);
    const trulyDisabled = options.disabled && !options.focusable;
    const [nativeTabbable, setNativeTabbable] = React.useState(true);
    const tabIndex = nativeTabbable ? htmlTabIndex : htmlTabIndex || 0;
    const style = options.disabled
      ? { pointerEvents: "none" as const, ...htmlStyle }
      : htmlStyle;
    const onMouseDownFocus = isSafariOrFirefoxOnMac
      ? useFocusOnMouseDown()
      : undefined;

    useIsomorphicEffect(() => {
      const tabbable = ref.current;
      if (!tabbable) {
        warning(
          true,
          "Can't determine if the element is a native tabbable element because `ref` wasn't passed to the component.",
          "See https://reakit.io/docs/tabbable"
        );
        return;
      }
      if (!isNativeTabbable(tabbable)) {
        setNativeTabbable(false);
      }
    }, []);

    const onClick = React.useCallback(
      (event: React.MouseEvent) => {
        if (options.disabled) {
          event.stopPropagation();
          event.preventDefault();
          return;
        }
        htmlOnClick?.(event);
      },
      [options.disabled, htmlOnClick]
    );

    const onMouseDown = React.useCallback(
      (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (options.disabled) {
          event.stopPropagation();
          event.preventDefault();
          return;
        }
        onMouseDownFocus?.(event);
        htmlOnMouseDown?.(event);
      },
      [options.disabled, onMouseDownFocus, htmlOnMouseDown]
    );

    return {
      ref: useForkRef(ref, htmlRef),
      style,
      tabIndex: !trulyDisabled ? tabIndex : undefined,
      disabled: trulyDisabled && nativeTabbable ? true : undefined,
      "aria-disabled": options.disabled ? true : undefined,
      onClick,
      onMouseDown,
      ...htmlProps,
    };
  },
});

export const Tabbable = createComponent({
  as: "div",
  useHook: useTabbable,
});
