import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { useForkRef } from "reakit-utils/useForkRef";
import {
  CompositeOptions,
  CompositeHTMLProps,
  useComposite,
} from "../Composite/Composite";
import { COMBOBOX_KEYS } from "./__keys";
import { unstable_ComboboxStateReturn } from "./ComboboxState";
import { getMenuId } from "./__utils/getMenuId";

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
      onKeyDown: htmlOnKeyDown,
      "aria-controls": ariaControls,
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLInputElement>(null);
    const onClickRef = useLiveRef(htmlOnClick);
    const onChangeRef = useLiveRef(htmlOnChange);
    const onKeyDownRef = useLiveRef(htmlOnKeyDown);
    const menuId = getMenuId(options.baseId);
    const controls = ariaControls ? `${ariaControls} ${menuId}` : menuId;

    const autocomplete =
      options.list && options.inline
        ? "both"
        : options.list
        ? "list"
        : options.inline
        ? "inline"
        : "none";

    const value = options.inline
      ? options.currentValue || options.inputValue
      : options.inputValue;

    // TODO: Highlight should only happen if autocompleting
    React.useEffect(() => {
      const firstId = options.items[0]?.id;
      if (
        options.currentValue &&
        options.autoSelect &&
        options.currentId === firstId
      ) {
        const index = value.indexOf(options.currentValue);
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

    const onClick = React.useCallback(
      (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        onClickRef.current?.(event);
        if (event.defaultPrevented) return;
        options.show?.();
      },
      [options.visible, options.show]
    );

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onChangeRef.current?.(event);
        if (event.defaultPrevented) return;
        options.setCurrentId?.(undefined);
        options.setInputValue?.(event.target.value);
      },
      [options.setCurrentId, options.setInputValue]
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDownRef.current?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "Escape") {
          options.setCurrentId?.(undefined);
        }
      },
      [options.setCurrentId]
    );

    return {
      ref: useForkRef(ref, useForkRef(options.unstable_referenceRef, htmlRef)),
      role: "combobox",
      autoComplete: "off",
      "aria-owns": controls,
      "aria-controls": controls,
      "aria-haspopup": options.menuRole,
      "aria-expanded": options.visible,
      "aria-autocomplete": autocomplete,
      value,
      onClick,
      onChange,
      onKeyDown,
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
        if (inputHasFocus) {
          if (["ArrowLeft", "ArrowRight"].includes(event.key)) return;
          if (event.key === "Escape") {
            options.hide?.();
          }
          // replace event.key.length === 1 by onKeyPress?
          // should show popover when deleting too
          if (event.key.startsWith("Arrow") || event.key.length === 1) {
            options.show?.();
          }
        } else if (event.key.length === 1) {
          return;
        } else if (
          event.key.startsWith("Arrow") &&
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
