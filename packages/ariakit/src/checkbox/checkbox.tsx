import { ChangeEvent, MouseEvent, useCallback, useEffect, useRef } from "react";
import {
  useControlledState,
  useEventCallback,
  useForkRef,
  useTagName,
  useWrapElement,
} from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { CommandOptions, useCommand } from "../command/command";
import { CheckboxCheckedContext } from "./__utils";
import { CheckboxState } from "./checkbox-state";

function getStateChecked(
  stateValue?: CheckboxState["value"],
  elementValue?: CheckboxOptions["value"]
) {
  if (stateValue === undefined) return;
  if (elementValue) {
    if (Array.isArray(stateValue)) {
      return stateValue.includes(elementValue);
    }
    return stateValue === elementValue;
  }
  if (Array.isArray(stateValue)) {
    return false;
  }
  if (typeof stateValue === "boolean") {
    return stateValue;
  }
  return false;
}

function setMixed(element: HTMLInputElement, mixed?: boolean) {
  if (mixed) {
    element.indeterminate = true;
  } else if (element.indeterminate) {
    element.indeterminate = false;
  }
}

function isNativeCheckbox(tagName?: string, type?: string) {
  return tagName === "input" && (!type || type === "checkbox");
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component. If the element is not a native checkbox, the hook will
 * return additional props to make sure it's accessible.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * const props = useCheckbox({ as: "div" });
 * <Role {...props}>Accessible checkbox</Role>
 * ```
 */
export const useCheckbox = createHook<CheckboxOptions>(
  ({ state, value, checked: checkedProp, defaultChecked, ...props }) => {
    const [checked, setChecked] = useControlledState(
      defaultChecked ?? false,
      checkedProp ?? getStateChecked(state?.value, value)
    );

    const ref = useRef<HTMLInputElement>(null);
    const tagName = useTagName(ref, props.as || "input");
    const nativeCheckbox = isNativeCheckbox(tagName, props.type);
    const mixed = checked ? checked === "mixed" : undefined;

    useEffect(() => {
      if (!ref.current) return;
      setMixed(ref.current, mixed);
    }, [mixed]);

    const onChangeProp = useEventCallback(props.onChange);

    const onChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        if (props.disabled) {
          event.stopPropagation();
          event.preventDefault();
          return;
        }
        setMixed(event.currentTarget, mixed);
        if (!nativeCheckbox) {
          // If the element is not a native checkbox, we need to manually update
          // its checked property.
          event.currentTarget.checked = !event.currentTarget.checked;
        }
        onChangeProp(event);
        if (event.defaultPrevented) return;

        const elementChecked = event.currentTarget.checked;
        setChecked(elementChecked);

        state?.setValue((prevValue) => {
          if (!value) return elementChecked;
          if (!Array.isArray(prevValue)) return value;
          if (elementChecked) return [...prevValue, value];
          return prevValue.filter((v) => v !== value);
        });
      },
      [
        props.disabled,
        mixed,
        nativeCheckbox,
        onChangeProp,
        setChecked,
        state?.setValue,
        value,
      ]
    );

    const onClickProp = useEventCallback(props.onClick);

    const onClick = useCallback(
      (event: MouseEvent<HTMLInputElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        if (nativeCheckbox) return;
        // @ts-ignore The onChange event expects a ChangeEvent, but here we need
        // to pass a MouseEvent.
        onChange(event);
      },
      [onClickProp, onChange]
    );

    const isChecked = checked === "mixed" ? false : checked;

    props = useWrapElement(
      props,
      (element) => (
        <CheckboxCheckedContext.Provider value={isChecked}>
          {element}
        </CheckboxCheckedContext.Provider>
      ),
      [isChecked]
    );

    props = {
      role: !nativeCheckbox ? "checkbox" : undefined,
      type: nativeCheckbox ? "checkbox" : undefined,
      "aria-checked": checked,
      ...props,
      ref: useForkRef(ref, props.ref),
      onChange,
      onClick,
    };

    props = useCommand({ clickOnEnter: false, ...props });

    return {
      value: nativeCheckbox ? value : undefined,
      checked: isChecked,
      ...props,
    };
  }
);

/**
 * A component that renders a native accessible checkbox. If another element is
 * passed to the `as` prop, this component will make sure the rendered element is
 * accessible.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * <Checkbox as="div">Accessible checkbox</Checkbox>
 * ```
 */
export const Checkbox = createComponent<CheckboxOptions>((props) => {
  const htmlProps = useCheckbox(props);
  return createElement("input", htmlProps);
});

export type CheckboxOptions<T extends As = "input"> = CommandOptions<T> & {
  /**
   * Object returned by the `useCheckboxState` hook. If not provided, the
   * internal state will be used.
   */
  state?: CheckboxState;
  /**
   * The value of the checkbox. This is useful when the same checkbox state is
   * used for multiple `Checkbox` elements, in which case the value will be an
   * array of checked values.
   * @example
   * ```jsx
   * const checkbox = useCheckboxState({
   *   defaultValue: ["Apple", "Orange"],
   * });
   * <Checkbox state={checkbox} value="Apple" />
   * <Checkbox state={checkbox} value="Orange" />
   * <Checkbox state={checkbox} value="Watermelon" />
   * ```
   */
  value?: string | number;
  /**
   * The `checked` state of the checkbox. This will override the value inferred
   * from `state` prop, if provided.
   */
  checked?: "mixed" | boolean;
  /**
   * The default `checked` state of the checkbox.
   */
  defaultChecked?: "mixed" | boolean;
  /**
   * A function that is called when the checkbox's `checked` state changes.
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export type CheckboxProps<T extends As = "input"> = Props<CheckboxOptions<T>>;
