import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { useForkRef } from "reakit-utils/useForkRef";
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

function hasCompletionString(inputValue: string, currentValue: string) {
  return (
    currentValue.length > inputValue.length &&
    currentValue.toLowerCase().indexOf(inputValue.toLowerCase()) === 0
  );
}

function getCompletionString(inputValue: string, currentValue: string) {
  const index = currentValue.toLowerCase().indexOf(inputValue.toLowerCase());
  return currentValue.slice(index + inputValue.length);
}

function getValue(options: unstable_ComboboxOptions) {
  if (options.inline) {
    if (options.autoSelect && isFirstItemAutoSelected(options)) {
      if (
        options.currentValue &&
        hasCompletionString(options.inputValue, options.currentValue)
      ) {
        return (
          options.inputValue +
          getCompletionString(options.inputValue, options.currentValue)
        );
      }
      return options.inputValue;
    }
    return options.currentValue || options.inputValue;
  }
  return options.inputValue;
}

export const unstable_useCombobox = createHook<
  unstable_ComboboxOptions,
  unstable_ComboboxHTMLProps
>({
  name: "Combobox",
  compose: useComposite,
  keys: COMBOBOX_KEYS,

  useOptions({ menuRole = "listbox", ...options }) {
    return { menuRole, ...options };
  },

  useProps(
    options,
    {
      ref: htmlRef,
      onClick: htmlOnClick,
      onChange: htmlOnChange,
      onBlur: htmlOnBlur,
      "aria-controls": ariaControls,
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLInputElement>(null);
    const onClickRef = useLiveRef(htmlOnClick);
    const onChangeRef = useLiveRef(htmlOnChange);
    const onBlurRef = useLiveRef(htmlOnBlur);
    const value = getValue(options);

    React.useEffect(() => {
      const firstId = options.items.find((item) => !item.disabled)?.id;
      if (
        options.currentValue &&
        options.autoSelect &&
        options.currentId === firstId
      ) {
        const index = value
          .toLowerCase()
          .indexOf(options.currentValue.toLowerCase());
        if (index !== -1) {
          ref.current?.setSelectionRange(
            options.inputValue.length,
            value.length
          );
        }
      }
    }, [
      value,
      options.inputValue,
      options.items,
      options.currentValue,
      options.autoSelect,
      options.currentId,
    ]);

    const [changed, setChanged] = React.useState(false);

    useUpdateEffect(() => {
      if (options.autoSelect && changed) {
        options.setCurrentId?.(undefined);
        setChanged(false);
      }
    }, [changed, options.autoSelect, options.setCurrentId]);

    const onClick = React.useCallback(
      (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        onClickRef.current?.(event);
        if (event.defaultPrevented) return;
        options.show?.();
      },
      [options.show]
    );

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onChangeRef.current?.(event);
        if (event.defaultPrevented) return;
        options.show?.();
        options.setCurrentId?.(null);
        options.setInputValue?.(event.target.value);
        const nativeEvent = event.nativeEvent as InputEvent;
        if (
          event.target.value.length >= options.inputValue.length &&
          nativeEvent.inputType === "insertText"
        ) {
          setChanged(true);
        }
      },
      [options.show, options.setCurrentId, options.setInputValue]
    );

    const onBlur = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        onBlurRef.current?.(event);
        if (event.defaultPrevented) return;
        if (options.currentValue) {
          options.setInputValue(value);
        }
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
      onClick,
      onChange,
      onBlur,
      ...htmlProps,
    };
  },

  useComposeProps(options, htmlProps) {
    const compositeHTMLProps = useComposite(options, htmlProps, true);
    // TODO: Somethings should be only onKeyDown
    const onKey = React.useCallback(
      (
        event: React.KeyboardEvent<HTMLInputElement>,
        handler?: React.KeyboardEventHandler<HTMLInputElement>
      ) => {
        const inputHasFocus = options.currentId === null;
        if (
          inputHasFocus &&
          !event.shiftKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.metaKey
        ) {
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
            return;
          if (event.key === "Escape") {
            options.hide?.();
          }
          // replace event.key.length === 1 by onKeyPress?
          // should show popover when deleting too
          if (
            event.key.startsWith("Arrow") ||
            event.key === "Backspace" ||
            event.key.length === 1
          ) {
            options.show?.();
          }
        } else if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
        } else if (event.key.length === 1) {
          return;
        } else if (
          (event.key.startsWith("Arrow") ||
            event.key === "Home" ||
            event.key === "End") &&
          options.menuRole === "grid"
        ) {
          event.preventDefault();
        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
        }
        handler?.(event);
      },
      [options.currentId, options.show]
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

export type unstable_ComboboxOptions = CompositeOptions &
  Pick<
    Partial<unstable_ComboboxStateReturn>,
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
    "baseId" | "inputValue" | "setInputValue" | "currentValue"
  >;

export type unstable_ComboboxHTMLProps = CompositeHTMLProps &
  React.InputHTMLAttributes<any>;

export type unstable_ComboboxProps = unstable_ComboboxOptions &
  unstable_ComboboxHTMLProps;
