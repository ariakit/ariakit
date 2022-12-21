import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { CommandOptions, useCommand } from "../command/command";
import {
  useEvent,
  useForkRef,
  useTagName,
  useWrapElement,
} from "../utils/hooks";
import { useStoreState } from "../utils/store";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { CheckboxCheckedContext } from "./checkbox-checked-context";
import { CheckboxStore } from "./checkbox-store";

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
 * Returns props to create a `Checkbox` component. If the element is not a
 * native checkbox, the hook will return additional props to make sure it's
 * accessible.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * const props = useCheckbox({ as: "div" });
 * <Role {...props}>Accessible checkbox</Role>
 * ```
 */
export const useCheckbox = createHook<CheckboxOptions>(
  ({ store, value, checked: checkedProp, defaultChecked, ...props }) => {
    const storeChecked = useStoreState(store, (state) => {
      if (checkedProp !== undefined) return checkedProp;
      if (state.value === undefined) return;
      if (value) {
        if (Array.isArray(state.value)) return state.value.includes(value);
        return state.value === value;
      }
      if (Array.isArray(state.value)) return false;
      if (typeof state.value === "boolean") return state.value;
      return false;
    });

    const [_checked, setChecked] = useState(defaultChecked ?? false);
    const checked = checkedProp ?? storeChecked ?? _checked;

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

      store?.setValue((prevValue) => {
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
 * Renders an accessible checkbox element. If the underlying element is not a
 * native checkbox, this component will pass additional attributes to make sure
 * it's accessible.
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

export interface CheckboxOptions<T extends As = "input">
  extends CommandOptions<T> {
  /**
   * Object returned by the `useCheckboxStore` hook. If not provided, the
   * internal store will be used.
   */
  store?: CheckboxStore;
  /**
   * The value of the checkbox. This is useful when the same checkbox store is
   * used for multiple `Checkbox` elements, in which case the value will be an
   * array of checked values.
   * @example
   * ```jsx
   * const checkbox = useCheckboxStore({
   *   defaultValue: ["Apple", "Orange"],
   * });
   * <Checkbox store={checkbox} value="Apple" />
   * <Checkbox store={checkbox} value="Orange" />
   * <Checkbox store={checkbox} value="Watermelon" />
   * ```
   */
  value?: string | number;
  /**
   * The `checked` state of the checkbox. This will override the value inferred
   * from `store` prop, if provided. This can be `"mixed"` to indicate that the
   * checkbox is partially checked.
   */
  checked?: "mixed" | boolean;
  /**
   * The default `checked` state of the checkbox. This prop is ignored if the
   * `checked` or the `store` props are provided.
   */
  defaultChecked?: "mixed" | boolean;
  /**
   * A function that is called when the checkbox's `checked` store changes.
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export type CheckboxProps<T extends As = "input"> = Props<CheckboxOptions<T>>;
