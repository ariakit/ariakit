import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { isTextField } from "reakit-utils/isTextField";
import { getDocument } from "reakit-utils/getDocument";
import { isSelfTarget } from "reakit-utils/isSelfTarget";
import { useBox, BoxOptions, BoxHTMLProps } from "../Box/Box";
import {
  unstable_CompositeStateReturn,
  unstable_useCompositeState,
} from "./CompositeState";
import { setTextFieldValue } from "./__utils/setTextFieldValue";

export type unstable_CompositeItemWidgetOptions = BoxOptions &
  Pick<Partial<unstable_CompositeStateReturn>, "wrap"> &
  Pick<
    unstable_CompositeStateReturn,
    "unstable_hasActiveWidget" | "unstable_setHasActiveWidget" | "currentId"
  >;

export type unstable_CompositeItemWidgetHTMLProps = BoxHTMLProps;

export type unstable_CompositeItemWidgetProps = unstable_CompositeItemWidgetOptions &
  unstable_CompositeItemWidgetHTMLProps;

function focusCurrentItem(widget: Element, currentId?: string | null) {
  if (currentId) {
    getDocument(widget).getElementById(currentId)?.focus();
  }
}

function getTextFieldValue(element: HTMLElement) {
  return (element as HTMLInputElement).value;
}

export const unstable_useCompositeItemWidget = createHook<
  unstable_CompositeItemWidgetOptions,
  unstable_CompositeItemWidgetHTMLProps
>({
  name: "CompositeItemWidget",
  compose: useBox,
  useState: unstable_useCompositeState,

  useProps(
    options,
    {
      onFocus: htmlOnFocus,
      onBlur: htmlOnBlur,
      onKeyDown: htmlOnKeyDown,
      ...htmlProps
    }
  ) {
    const initialValue = React.useRef("");

    const onFocus = (event: React.FocusEvent<HTMLElement>) => {
      htmlOnFocus?.(event);
      options.unstable_setHasActiveWidget?.(true);
      if (isTextField(event.currentTarget)) {
        initialValue.current = getTextFieldValue(event.currentTarget);
      }
    };

    const onBlur = (event: React.FocusEvent) => {
      htmlOnBlur?.(event);
      options.unstable_setHasActiveWidget?.(false);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      htmlOnKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (!isSelfTarget(event)) return;
      if (event.nativeEvent.isComposing) return;
      const self = event.currentTarget;
      if (event.key === "Enter") {
        if (isTextField(self)) {
          const isMultilineTextField = self.tagName === "TEXTAREA";
          // Make sure we can create new lines using Shift+Enter
          if (isMultilineTextField && event.shiftKey) return;
          // Make sure it'll not trigger a click on the parent button
          event.preventDefault();
          focusCurrentItem(self, options.currentId);
        }
      } else if (event.key === "Escape") {
        focusCurrentItem(self, options.currentId);
        if (isTextField(self)) {
          setTextFieldValue(self, initialValue.current);
        }
      }
    };

    return {
      tabIndex: options.unstable_hasActiveWidget ? 0 : -1,
      "data-composite-item-widget": true,
      onFocus,
      onBlur,
      onKeyDown,
      ...htmlProps,
    };
  },
});

export const unstable_CompositeItemWidget = createComponent({
  as: "div",
  useHook: unstable_useCompositeItemWidget,
});
