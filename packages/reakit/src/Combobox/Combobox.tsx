import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import {
  CompositeOptions,
  CompositeHTMLProps,
  useComposite,
} from "../Composite/Composite";
import { COMBOBOX_KEYS } from "./__keys";
import { unstable_ComboboxStateReturn } from "./ComboboxState";

export type unstable_ComboboxOptions = CompositeOptions &
  Pick<Partial<unstable_ComboboxStateReturn>, "baseId"> &
  Pick<unstable_ComboboxStateReturn, "state" | "setState">;

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

  useProps(options, { "aria-controls": ariaControls, ...htmlProps }) {
    const controls = ariaControls
      ? `${ariaControls} ${options.baseId}-grid`
      : `${options.baseId}-grid`;

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        options.setState?.(event.target.value);
      },
      [options.setState]
    );

    return {
      role: "combobox",
      autoComplete: "off",
      "aria-controls": controls,
      "aria-haspopup": "grid",
      "aria-expanded": true,
      "aria-owns": `${options.baseId}-grid`,
      value: options.state,
      onChange,
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
        const inputHasFocus = options.currentId == null;
        if (inputHasFocus) {
          if (["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        } else if (event.key.startsWith("Arrow")) {
          event.preventDefault();
        }
        if (event.key === " ") {
          return;
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
