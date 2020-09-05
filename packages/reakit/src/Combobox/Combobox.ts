import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { useForkRef } from "reakit-utils/useForkRef";
import { warning } from "reakit-warning";
import { useUpdateEffect } from "reakit-utils/useUpdateEffect";
import {
  CompositeOptions,
  CompositeHTMLProps,
  useComposite,
} from "../Composite/Composite";
import { COMBOBOX_KEYS } from "./__keys";
import { unstable_ComboboxStateReturn } from "./ComboboxState";
import { getMenuId } from "./__utils/getMenuId";

function getControls(baseId: string, ariaControls?: string) {
  const menuId = getMenuId(baseId);
  if (ariaControls) {
    return `${ariaControls} ${menuId}`;
  }
  return menuId;
}

function getAutocomplete(options: unstable_ComboboxOptions) {
  if (options.list && options.inline) return "both";
  if (options.list) return "list";
  if (options.inline) return "inline";
  return "none";
}

function isFirstItemAutoSelected(options: unstable_ComboboxOptions) {
  const firstItem = options.items.find((item) => !item.disabled);
  return (
    options.autoSelect &&
    options.currentId &&
    firstItem?.id === options.currentId
  );
}

function hasCompletionString(inputValue: string, currentValue?: string) {
  return (
    !!currentValue &&
    currentValue.length > inputValue.length &&
    currentValue.toLowerCase().indexOf(inputValue.toLowerCase()) === 0
  );
}

function getCompletionString(inputValue: string, currentValue?: string) {
  if (!currentValue) return "";
  const index = currentValue.toLowerCase().indexOf(inputValue.toLowerCase());
  return currentValue.slice(index + inputValue.length);
}

function getValue(options: unstable_ComboboxOptions) {
  if (!options.inline) {
    return options.inputValue;
  }
  if (options.autoSelect && isFirstItemAutoSelected(options)) {
    if (hasCompletionString(options.inputValue, options.currentValue)) {
      return (
        options.inputValue +
        getCompletionString(options.inputValue, options.currentValue)
      );
    }
    return options.inputValue;
  }
  return options.currentValue || options.inputValue;
}

function getFirstEnabledItemId(items: unstable_ComboboxOptions["items"]) {
  return items.find((item) => !item.disabled)?.id;
}

function useCompletionString(
  ref: React.RefObject<HTMLInputElement>,
  {
    items,
    inputValue,
    currentValue,
    autoSelect,
    currentId,
  }: unstable_ComboboxOptions
) {
  React.useEffect(() => {
    if (!autoSelect) return;
    if (!currentValue) return;
    if (!hasCompletionString(inputValue, currentValue)) return;
    if (currentId !== getFirstEnabledItemId(items)) return;
    const element = ref.current;
    if (!element) {
      warning(
        true,
        "Can't auto select combobox because `ref` wasn't passed to the component",
        "See https://reakit.io/docs/combobox"
      );
      return;
    }
    element.setSelectionRange(inputValue.length, currentValue.length);
  }, [autoSelect, currentValue, inputValue, currentId, items]);
}

export const unstable_useCombobox = createHook<
  unstable_ComboboxOptions,
  unstable_ComboboxHTMLProps
>({
  name: "Combobox",
  compose: useComposite,
  keys: COMBOBOX_KEYS,

  useOptions({ menuRole = "listbox", hideOnEsc = true, ...options }) {
    return { menuRole, hideOnEsc, ...options };
  },

  useProps(
    options,
    {
      ref: htmlRef,
      onKeyDown: htmlOnKeyDown,
      onKeyPress: htmlOnKeyPress,
      onChange: htmlOnChange,
      onClick: htmlOnClick,
      onBlur: htmlOnBlur,
      "aria-controls": ariaControls,
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLInputElement>(null);
    const onKeyDownRef = useLiveRef(htmlOnKeyDown);
    const onKeyPressRef = useLiveRef(htmlOnKeyPress);
    const onChangeRef = useLiveRef(htmlOnChange);
    const onClickRef = useLiveRef(htmlOnClick);
    const onBlurRef = useLiveRef(htmlOnBlur);
    const value = getValue(options);
    const hasInsertedTextRef = React.useRef(false);

    useCompletionString(ref, options);

    useUpdateEffect(() => {
      if (
        options.items.length &&
        options.autoSelect &&
        hasInsertedTextRef.current
      ) {
        // If autoSelect is set to true and the last change was a text
        // insertion, we want to automatically focus on the first suggestion.
        // This effect will run both when inputValue changes and when items
        // change so we can also catch async items.
        options.setCurrentId(undefined);
      } else {
        // Without autoSelect, we'll always blur the combobox option and move
        // focus onto the combobox input.
        options.setCurrentId(null);
      }
    }, [
      options.items,
      options.inputValue,
      options.autoSelect,
      options.setCurrentId,
    ]);

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDownRef.current?.(event);
        // Resets the reference on key down so we can figure it out later on
        // key press.
        hasInsertedTextRef.current = false;
        if (event.defaultPrevented) return;
        if (event.key === "Escape" && options.hideOnEsc) {
          options.hide?.();
        }
      },
      [options.hideOnEsc, options.hide]
    );

    const onKeyPress = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyPressRef.current?.(event);
        // onKeyPress will catch only printable character presses, so we skip
        // text removal and paste.
        hasInsertedTextRef.current = true;
      },
      []
    );

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onChangeRef.current?.(event);
        if (event.defaultPrevented) return;
        options.show?.();
        options.setInputValue?.(event.target.value);
        if (!options.autoSelect || !hasInsertedTextRef.current) {
          // If autoSelect is set to true, we don't want to unselect the
          // option. Unless the change doesn't represent an insertion of text.
          options.setCurrentId?.(null);
        }
      },
      [
        options.show,
        options.autoSelect,
        options.setCurrentId,
        options.setInputValue,
      ]
    );

    const onClick = React.useCallback(
      (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        onClickRef.current?.(event);
        if (event.defaultPrevented) return;
        options.show?.();
        options.setCurrentId?.(null);
        options.setInputValue(value);
      },
      [options.show, options.setCurrentId, options.setInputValue, value]
    );

    const onBlur = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        onBlurRef.current?.(event);
        if (event.defaultPrevented) return;
        options.setInputValue(value);
      },
      [options.setInputValue, value]
    );

    return {
      ref: useForkRef(ref, useForkRef(options.unstable_referenceRef, htmlRef)),
      role: "combobox",
      autoComplete: "off",
      "aria-controls": getControls(options.baseId, ariaControls),
      "aria-haspopup": options.menuRole,
      "aria-expanded": options.visible,
      "aria-autocomplete": getAutocomplete(options),
      value,
      onKeyDown,
      onKeyPress,
      onChange,
      onClick,
      onBlur,
      ...htmlProps,
    };
  },

  useComposeProps(
    options,
    { onKeyUp, onKeyDown: htmlOnKeyDown, ...htmlProps }
  ) {
    const compositeHTMLProps = useComposite(options, htmlProps, true);

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        const inputHasFocus = options.currentId === null;
        htmlOnKeyDown?.(event);
        if (inputHasFocus) {
          if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === "Home" ||
            event.key === "End"
          ) {
            // Do not perform list actions when pressing horizontal arrow keys
            // when focusing the combobox input while no option has focus.
            return;
          }
          if (
            !event.defaultPrevented &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.shiftKey &&
            !event.metaKey &&
            (event.key === "ArrowUp" ||
              event.key === "ArrowDown" ||
              event.key.length === 1)
          ) {
            // Up/Down arrow keys and printable characters should open the
            // combobox popover.
            options.show?.();
          }
        } else if (options.menuRole === "grid") {
          // If menu is a grid and there's an option with focus, we don't want
          // navigation keys to move the caret on the combobox input.
          if (
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === "Home" ||
            event.key === "End" ||
            event.key === "PageUp" ||
            event.key === "PageDown"
          ) {
            event.preventDefault();
          }
        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          // If menu is a one-dimensional list and there's an option with
          // focus, we don't want Up/Down arrow keys to move the caret on the
          // combobox input.
          event.preventDefault();
        } else if (
          event.key === "Home" ||
          event.key === "End" ||
          event.key.length === 1
        ) {
          // If menu is a one-dimensional list and there's an option with
          // focus, we don't want Home/End and printable characters to perform
          // actions on the option, only on the combobox input.
          return;
        }
        compositeHTMLProps.onKeyDown?.(event);
      },
      [
        htmlOnKeyDown,
        options.show,
        options.menuRole,
        compositeHTMLProps.onKeyDown,
      ]
    );
    return {
      ...compositeHTMLProps,
      onKeyDown,
      onKeyUp,
    };
  },
});

export const unstable_Combobox = createComponent({
  as: "input",
  memo: true,
  useHook: unstable_useCombobox,
});

export type unstable_ComboboxOptions = CompositeOptions &
  Pick<
    Partial<unstable_ComboboxStateReturn>,
    | "currentValue"
    | "menuRole"
    | "list"
    | "inline"
    | "autoSelect"
    | "visible"
    | "show"
    | "hide"
    | "unstable_referenceRef"
  > &
  Pick<
    unstable_ComboboxStateReturn,
    "baseId" | "inputValue" | "setInputValue"
  > & {
    /**
     * When enabled, user can hide the combobox popover by pressing
     * <kbd>Esc</kbd> while focusing on the combobox input.
     * @default true
     */
    hideOnEsc?: boolean;
  };

export type unstable_ComboboxHTMLProps = CompositeHTMLProps &
  React.InputHTMLAttributes<any>;

export type unstable_ComboboxProps = unstable_ComboboxOptions &
  unstable_ComboboxHTMLProps;
