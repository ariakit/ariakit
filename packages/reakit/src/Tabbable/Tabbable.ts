import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useForkRef } from "reakit-utils/useForkRef";
import { isFocusable } from "reakit-utils/tabbable";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import { isButton } from "reakit-utils/isButton";
import { warning } from "reakit-warning";
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
    const style = trulyDisabled
      ? { pointerEvents: "none" as const, ...htmlStyle }
      : htmlStyle;

    React.useEffect(() => {
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

    return {
      ref: useForkRef(ref, htmlRef),
      onClick,
      onMouseDown,
      style,
      ...(trulyDisabled && nativeTabbable ? { disabled: true } : {}),
      ...(options.disabled ? { "aria-disabled": true } : {}),
      ...(trulyDisabled ? {} : { tabIndex }),
      ...htmlProps
    };
  }
});

export const Tabbable = createComponent({
  as: "div",
  useHook: useTabbable
});
