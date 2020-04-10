import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { useForkRef } from "reakit-utils/useForkRef";
import { createEvent } from "reakit-utils/createEvent";
import { warning } from "reakit-warning/warning";
import {
  unstable_CompositeItemOptions as CompositeItemOptions,
  unstable_CompositeItemHTMLProps as CompositeItemHTMLProps,
  unstable_useCompositeItem as useCompositeItem,
} from "../Composite/CompositeItem";
import { useRadioState, RadioStateReturn } from "./RadioState";

export type RadioOptions = CompositeItemOptions &
  Pick<Partial<RadioStateReturn>, "state" | "setState"> & {
    /**
     * Same as the `value` attribute.
     */
    value: string | number;
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
  return (
    typeof options.value !== "undefined" && options.state === options.value
  );
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

function fireChange(element: HTMLElement, onChange?: React.ChangeEventHandler) {
  const event = createEvent(element, "change");
  Object.defineProperties(event, {
    type: { value: "change" },
    target: { value: element },
    currentTarget: { value: element },
  });
  onChange?.(event as any);
}

export const useRadio = createHook<RadioOptions, RadioHTMLProps>({
  name: "Radio",
  compose: useCompositeItem,
  useState: useRadioState,
  keys: ["value", "checked", "unstable_checkOnFocus"],

  useOptions(
    { unstable_clickOnEnter = false, unstable_checkOnFocus = true, ...options },
    { value, checked }
  ) {
    return {
      value,
      checked,
      unstable_clickOnEnter,
      unstable_checkOnFocus,
      ...options,
    };
  },

  useProps(
    options,
    { ref: htmlRef, onChange: htmlOnChange, onClick: htmlOnClick, ...htmlProps }
  ) {
    const ref = React.useRef<HTMLInputElement>(null);
    const [isNativeRadio, setIsNativeRadio] = React.useState(true);
    const checked = getChecked(options);
    const isCurrentItemRef = useLiveRef(options.currentId === options.id);
    const onChangeRef = useLiveRef(htmlOnChange);
    const onClickRef = useLiveRef(htmlOnClick);

    useInitialChecked(options);

    React.useEffect(() => {
      const self = ref.current;
      if (!self) {
        warning(
          true,
          "Can't determine whether the element is a native radio because `ref` wasn't passed to the component",
          "See https://reakit.io/docs/radio"
        );
        return;
      }
      if (self.tagName !== "INPUT" || self.type !== "radio") {
        setIsNativeRadio(false);
      }
    }, []);

    const onChange = React.useCallback(
      (event: React.ChangeEvent) => {
        onChangeRef.current?.(event);
        if (event.defaultPrevented) return;
        if (options.disabled) return;
        options.setState?.(options.value);
      },
      [options.disabled, options.setState, options.value]
    );

    const onClick = React.useCallback(
      (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        onClickRef.current?.(event);
        if (event.defaultPrevented) return;
        const self = event.currentTarget;
        fireChange(self, onChange);
      },
      [onChange]
    );

    React.useEffect(() => {
      const self = ref.current;
      if (!self) return;
      if (
        options.unstable_moves &&
        isCurrentItemRef.current &&
        options.unstable_checkOnFocus
      ) {
        fireChange(self, onChange);
      }
    }, [options.unstable_moves, options.unstable_checkOnFocus, onChange]);

    return {
      ref: useForkRef(ref, htmlRef),
      role: !isNativeRadio ? "radio" : undefined,
      type: isNativeRadio ? "radio" : undefined,
      value: isNativeRadio ? options.value : undefined,
      "aria-checked": checked,
      checked,
      onChange,
      onClick,
      ...htmlProps,
    };
  },
});

export const Radio = createComponent({
  as: "input",
  memo: true,
  useHook: useRadio,
});
