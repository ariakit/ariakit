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

function getValue(options: unstable_ComboboxOptions) {
  if (options.inline) {
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
      "aria-controls": ariaControls,
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLInputElement>(null);
    const onClickRef = useLiveRef(htmlOnClick);
    const onChangeRef = useLiveRef(htmlOnChange);
    const value = getValue(options);

    // TODO: Highlight should only happen if autocompleting
    // React.useEffect(() => {
    //   const firstId = options.items[0]?.id;
    //   if (
    //     options.currentValue &&
    //     options.autoSelect &&
    //     options.currentId === firstId
    //   ) {
    //     const index = value.indexOf(options.currentValue);
    //     if (index !== -1) {
    //       ref.current?.setSelectionRange(
    //         options.inputValue.length,
    //         value.length
    //       );
    //     }
    //   }
    // }, [
    //   value,
    //   options.inputValue,
    //   options.items,
    //   options.currentValue,
    //   options.autoSelect,
    //   options.currentId,
    // ]);

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
        options.setCurrentId?.(null);
        // TODO: compare event.target.value with options.inputValue
        // So we can determine if we have to auto select
        options.setInputValue?.(event.target.value);
      },
      [options.setCurrentId, options.setInputValue]
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
          if (["ArrowLeft", "ArrowRight"].includes(event.key)) return;
          if (event.key === "Escape") {
            options.hide?.(true);
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
