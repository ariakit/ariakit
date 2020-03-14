import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import {
  unstable_CompositeItemOptions as CompositeItemOptions,
  unstable_CompositeItemHTMLProps as CompositeItemHTMLProps,
  unstable_useCompositeItem as useCompositeItem
} from "../Composite/CompositeItem";
import { useRadioState, RadioStateReturn } from "./RadioState";

export type RadioOptions = CompositeItemOptions &
  Pick<Partial<RadioStateReturn>, "state" | "setState"> & {
    /**
     * Same as the `value` attribute.
     */
    value: any;
    /**
     * Same as the `checked` attribute.
     */
    checked?: boolean;
    /**
     * @private
     */
    unstable_checkOnFocus?: boolean;
  };

export type RadioHTMLProps = CompositeItemHTMLProps &
  React.InputHTMLAttributes<any>;

export type RadioProps = RadioOptions & RadioHTMLProps;

function getChecked(options: RadioOptions) {
  if (typeof options.checked !== "undefined") {
    return options.checked;
  }
  return options.value && options.state === options.value;
}

function useInitialChecked(options: RadioOptions) {
  const [initialChecked] = React.useState(() => getChecked(options));
  const [initialCurrentId] = React.useState(options.currentId);
  const { id, setCurrentId } = options;

  React.useEffect(() => {
    if (initialChecked && id && initialCurrentId !== id) {
      setCurrentId?.(id);
    }
  }, [initialChecked, id, setCurrentId, initialCurrentId]);
}

export const useRadio = createHook<RadioOptions, RadioHTMLProps>({
  name: "Radio",
  compose: useCompositeItem,
  useState: useRadioState,
  keys: ["value", "checked"],

  useOptions(
    { unstable_clickOnEnter = false, unstable_checkOnFocus = true, ...options },
    { value, checked }
  ) {
    return {
      value,
      checked,
      unstable_clickOnEnter,
      unstable_checkOnFocus,
      ...options
    };
  },

  useProps(
    options,
    {
      onChange: htmlOnChange,
      onClick: htmlOnClick,
      onFocus: htmlOnFocus,
      ...htmlProps
    }
  ) {
    const checked = getChecked(options);

    useInitialChecked(options);

    const onChange = React.useCallback(
      (event: React.ChangeEvent) => {
        htmlOnChange?.(event);
        if (options.disabled) return;
        options.setState?.(options.value);
      },
      [htmlOnChange, options.disabled, options.setState, options.value]
    );

    const onClick = React.useCallback(
      (event: React.MouseEvent) => {
        const self = event.currentTarget as HTMLElement;
        if (self.tagName === "INPUT" || options.unstable_checkOnFocus) return;
        onChange(event as any);
      },
      [options.unstable_checkOnFocus, onChange]
    );

    const onFocus = React.useCallback(
      (event: React.FocusEvent) => {
        if (options.unstable_checkOnFocus) {
          onChange(event);
        }
      },
      [options.unstable_checkOnFocus, onChange]
    );

    return {
      checked,
      "aria-checked": checked,
      value: options.value,
      role: "radio",
      type: "radio",
      onChange,
      onClick: useAllCallbacks(onClick, htmlOnClick),
      onFocus: useAllCallbacks(onFocus, htmlOnFocus),
      ...htmlProps
    };
  }
});

export const Radio = createComponent({
  as: "input",
  useHook: useRadio
});
