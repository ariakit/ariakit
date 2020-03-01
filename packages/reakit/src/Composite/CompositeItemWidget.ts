import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { closest } from "reakit-utils/closest";
import { isTextField } from "reakit-utils/isTextField";
import { useBox, BoxOptions, BoxHTMLProps } from "../Box/Box";
import {
  unstable_CompositeStateReturn,
  unstable_useCompositeState
} from "./CompositeState";

export type unstable_CompositeItemWidgetOptions = BoxOptions &
  Pick<
    unstable_CompositeStateReturn,
    "unstable_hasFocusInsideItem" | "unstable_setHasFocusInsideItem"
  >;

export type unstable_CompositeItemWidgetHTMLProps = BoxHTMLProps;

export type unstable_CompositeItemWidgetProps = unstable_CompositeItemWidgetOptions &
  unstable_CompositeItemWidgetHTMLProps;

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

    const onFocus = React.useCallback(
      (event: React.FocusEvent<HTMLElement>) => {
        options.unstable_setHasFocusInsideItem(true);
        if (isTextField(event.currentTarget)) {
          initialValue.current = event.currentTarget.isContentEditable
            ? event.currentTarget.innerHTML
            : (event.currentTarget as HTMLInputElement).value;
        }
      },
      [options.unstable_setHasFocusInsideItem]
    );

    const onBlur = React.useCallback(() => {
      options.unstable_setHasFocusInsideItem(false);
    }, [options.unstable_setHasFocusInsideItem]);

    const onKeyDown = React.useMemo(
      () =>
        createOnKeyDown({
          onKeyDown: htmlOnKeyDown,
          stopPropagation: true,
          preventDefault: false,
          shouldKeyDown: event => event.currentTarget === event.target,
          keyMap: {
            Enter: event => {
              if (isTextField(event.currentTarget)) {
                closest<HTMLElement>(
                  event.currentTarget,
                  "[data-composite-item]"
                )?.focus();
              }
            },
            Escape: event => {
              closest<HTMLElement>(
                event.currentTarget,
                "[data-composite-item]"
              )?.focus();
              if (isTextField(event.currentTarget)) {
                if (event.currentTarget.isContentEditable) {
                  event.currentTarget.innerHTML = initialValue.current;
                } else {
                  (event.currentTarget as HTMLInputElement).value =
                    initialValue.current;
                }
              }
            }
          }
        }),
      [htmlOnKeyDown]
    );

    return {
      tabIndex: options.unstable_hasFocusInsideItem ? 0 : -1,
      onFocus: useAllCallbacks(onFocus, htmlOnFocus),
      onBlur: useAllCallbacks(onBlur, htmlOnBlur),
      onKeyDown,
      "data-composite-item-widget": true,
      ...htmlProps
    };
  }
});

export const unstable_CompositeItemWidget = createComponent({
  as: "div",
  useHook: unstable_useCompositeItemWidget
});
