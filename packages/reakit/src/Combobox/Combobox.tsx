import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useLiveRef } from "reakit-utils/useLiveRef";
import {
  CompositeOptions,
  CompositeHTMLProps,
  useComposite,
} from "../Composite/Composite";
import { COMBOBOX_KEYS } from "./__keys";
import { unstable_ComboboxStateReturn } from "./ComboboxState";
import { getPopupId } from "./__utils";

export type unstable_ComboboxOptions = CompositeOptions &
  Pick<
    Partial<unstable_ComboboxStateReturn>,
    "autocomplete" | "hasPopup" | "visible"
  > &
  Pick<
    unstable_ComboboxStateReturn,
    | "baseId"
    | "currentValue"
    | "setCurrentValue"
    | "selectedValue"
    | "setSelectedValue"
  >;

export type unstable_ComboboxHTMLProps = CompositeHTMLProps &
  React.InputHTMLAttributes<any>;

export type unstable_ComboboxProps = unstable_ComboboxOptions &
  unstable_ComboboxHTMLProps;

export const unstable_useCombobox = createHook<
  unstable_ComboboxOptions,
  unstable_ComboboxHTMLProps
>({
  name: "Combobox",
  compose: useComposite,
  keys: COMBOBOX_KEYS,

  useOptions({ hasPopup = "listbox", ...options }) {
    return { hasPopup, ...options };
  },

  useProps(
    options,
    {
      "aria-controls": ariaControls,
      onChange: htmlOnChange,
      onKeyDown: htmlOnKeyDown,
      ...htmlProps
    }
  ) {
    const onChangeRef = useLiveRef(htmlOnChange);
    const onKeyDownRef = useLiveRef(htmlOnKeyDown);

    const value = options.autocomplete
      ? options.selectedValue || options.currentValue
      : options.currentValue;

    const controls = ariaControls
      ? `${ariaControls} ${getPopupId(options.baseId)}`
      : getPopupId(options.baseId);

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onChangeRef.current?.(event);
        if (event.defaultPrevented) return;
        options.setSelectedValue?.(undefined);
        options.setCurrentValue?.(event.target.value);
      },
      [options.setSelectedValue, options.setCurrentValue]
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDownRef.current?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "Escape") {
          options.setSelectedValue?.(undefined);
        }
      },
      [options.setSelectedValue]
    );

    return {
      role: "combobox",
      autoComplete: "off",
      "aria-controls": controls,
      "aria-haspopup": options.hasPopup,
      "aria-expanded": options.visible,
      "aria-autocomplete": options.autocomplete ? "both" : "list",
      value,
      onChange,
      onKeyDown,
      ...htmlProps,
    };
  },

  useComposeProps(options, htmlProps) {
    const compositeHTMLProps = useComposite(options, htmlProps);
    const onKey = React.useCallback(
      (
        event: React.KeyboardEvent<HTMLInputElement>,
        handler?: React.KeyboardEventHandler<HTMLInputElement>
      ) => {
        const inputHasFocus = options.currentId === null;
        if (inputHasFocus) {
          if (["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        } else if (event.key.length === 1) {
          return;
        } else if (event.key.startsWith("Arrow")) {
          event.preventDefault();
        }
        handler?.(event);
      },
      [options.currentId]
    );
    return {
      ...compositeHTMLProps,
      onKeyDown: React.useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
          onKey(event, compositeHTMLProps.onKeyDown);
        },
        [compositeHTMLProps.onKeyDown, onKey]
      ),
      onKeyUp: React.useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
          onKey(event, compositeHTMLProps.onKeyUp);
        },
        [compositeHTMLProps.onKeyUp, onKey]
      ),
    };
  },
});

export const unstable_Combobox = createComponent({
  as: "input",
  memo: true,
  useHook: unstable_useCombobox,
});
