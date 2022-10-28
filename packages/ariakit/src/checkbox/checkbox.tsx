import { ChangeEvent, MouseEvent, useEffect, useRef } from "react";
import {
  useControlledState,
  useEvent,
  useForkRef,
  useTagName,
  useWrapElement,
} from "ariakit-react-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
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
 * Returns checkbox props. If the element receiving these props is not a native
 * checkbox, the hook will return additional props to make sure it's accessible.
 * This component hook is used by the
 * [`Checkbox`](https://ariakit.org/apis/checkbox) component.
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
    const isChecked = checked === "mixed" ? false : checked;

    useEffect(() => {
      const element = ref.current;
      if (!element) return;
      setMixed(element, mixed);
      element.checked = isChecked;
    }, [mixed, isChecked]);

    const onChangeProp = props.onChange;

    const onChange = useEvent((event: ChangeEvent<HTMLInputElement>) => {
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
      onChangeProp?.(event);
      if (event.defaultPrevented) return;

      const elementChecked = event.currentTarget.checked;
      setChecked(elementChecked);

      state?.setValue((prevValue) => {
        if (!value) return elementChecked;
        if (!Array.isArray(prevValue)) return value;
        if (elementChecked) return [...prevValue, value];
        return prevValue.filter((v) => v !== value);
      });
    });

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLInputElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (nativeCheckbox) return;
      // @ts-expect-error The onChange event expects a ChangeEvent, but here we
      // need to pass a MouseEvent.
      onChange(event);
    });

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

    props = useCommand({ clickOnEnter: !nativeCheckbox, ...props });

    return {
      value: nativeCheckbox ? value : undefined,
      checked: isChecked,
      ...props,
    };
  }
);

/**
 * Renders an accessible checkbox. If an element other than a native
 * `input[type=checkbox]` is passed to the `as` prop, this component will make
 * sure the rendered element is accessible.
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

if (process.env.NODE_ENV !== "production") {
  Checkbox.displayName = "Checkbox";
}

export type CheckboxOptions<T extends As = "input"> = CommandOptions<T> & {
  /**
   * Object returned by the
   * [`useCheckboxState`](https://ariakit.org/apis/checkbox-state) hook. If not
   * provided, the internal state will be used.
   */
  state?: CheckboxState;
  /**
   * The value of the checkbox. This is useful when the same checkbox state is
   * used for multiple `Checkbox` elements, in which case the value will be an
   * array of checked values.
   * @example
   * ```jsx
   * const checkbox = useCheckboxState({ defaultValue: ["Apple", "Orange"] });
   * <Checkbox state={checkbox} value="Apple" />
   * <Checkbox state={checkbox} value="Orange" />
   * <Checkbox state={checkbox} value="Watermelon" />
   * ```
   */
  value?: string | number;
  /**
   * The checked state of the checkbox. This will override the value inferred
   * from [`state`](https://ariakit.org/apis/checkbox#state) prop, if provided.
   */
  checked?: "mixed" | boolean;
  /**
   * The default checked state of the checkbox.
   */
  defaultChecked?: "mixed" | boolean;
  /**
   * A function that is called when the checkbox's checked state changes.
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export type CheckboxProps<T extends As = "input"> = Props<CheckboxOptions<T>>;
