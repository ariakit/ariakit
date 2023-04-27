import type { ChangeEvent, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { CommandOptions } from "../command/command.js";
import { useCommand } from "../command/command.js";
import {
  useEvent,
  useForkRef,
  useTagName,
  useWrapElement,
} from "../utils/hooks.js";
import { useStoreState } from "../utils/store.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { CheckboxCheckedContext } from "./checkbox-checked-context.js";
import type { CheckboxStore } from "./checkbox-store.js";

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
  ({
    store,
    value: valueProp,
    checked: checkedProp,
    defaultChecked,
    ...props
  }) => {
    const storeChecked = useStoreState(store, (state) => {
      if (checkedProp !== undefined) return checkedProp;
      if (state.value === undefined) return;
      if (valueProp) {
        if (Array.isArray(state.value)) return state.value.includes(valueProp);
        return state.value === valueProp;
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
        if (!valueProp) return elementChecked;
        if (!Array.isArray(prevValue)) {
          return prevValue === valueProp ? false : valueProp;
        }
        if (elementChecked) return [...prevValue, valueProp];
        return prevValue.filter((v) => v !== valueProp);
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
      value: nativeCheckbox ? valueProp : undefined,
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
   *
   * Live examples:
   * - [Checkbox as button](https://ariakit.org/examples/checkbox-as-button)
   * - [Custom Checkbox](https://ariakit.org/examples/checkbox-custom)
   */
  store?: CheckboxStore;
  /**
   * The value of the checkbox. This is useful when the same checkbox store is
   * used for multiple `Checkbox` elements, in which case the value will be an
   * array of checked values.
   *
   * Live examples:
   * - [Checkbox group](https://ariakit.org/examples/checkbox-group)
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
   * The default `checked` state of the checkbox. This prop is ignored if the
   * `checked` or the `store` props are provided.
   */
  defaultChecked?: "mixed" | boolean;
  /**
   * The `checked` state of the checkbox. This will override the value inferred
   * from `store` prop, if provided. This can be `"mixed"` to indicate that the
   * checkbox is partially checked.
   *
   * Live examples:
   * - [Controlled Checkbox](https://ariakit.org/examples/checkbox-controlled)
   */
  checked?: "mixed" | boolean;
  /**
   * A function that is called when the checkbox's `checked` store changes.
   *
   * Live examples:
   * - [Controlled Checkbox](https://ariakit.org/examples/checkbox-controlled)
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export type CheckboxProps<T extends As = "input"> = Props<CheckboxOptions<T>>;
