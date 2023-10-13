import type { ChangeEvent, InputHTMLAttributes, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { disabledFromProps } from "@ariakit/core/utils/misc";
import type { CommandOptions } from "../command/command.js";
import { useCommand } from "../command/command.js";
import {
  useEvent,
  useForceUpdate,
  useMergeRefs,
  useTagName,
  useWrapElement,
} from "../utils/hooks.js";
import { useStoreState } from "../utils/store.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { CheckboxCheckedContext } from "./checkbox-checked-context.js";
import { useCheckboxContext } from "./checkbox-context.js";
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

function getPrimitiveValue<T>(value: T) {
  if (Array.isArray(value)) {
    return value.toString();
  }
  return value as Exclude<T, readonly any[]>;
}

/**
 * Returns props to create a `Checkbox` component. If the element is not a
 * native checkbox, the hook will return additional props to make sure it's
 * accessible.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * const props = useCheckbox({ render: <div /> });
 * <Role {...props}>Accessible checkbox</Role>
 * ```
 */
export const useCheckbox = createHook<CheckboxOptions>(
  ({
    store,
    name,
    value: valueProp,
    checked: checkedProp,
    defaultChecked,
    ...props
  }) => {
    const context = useCheckboxContext();
    store = store || context;

    const [_checked, setChecked] = useState(defaultChecked ?? false);

    const checked = useStoreState(store, (state) => {
      if (checkedProp !== undefined) return checkedProp;
      if (state?.value === undefined) return _checked;
      if (valueProp != null) {
        if (Array.isArray(state.value)) {
          const primitiveValue = getPrimitiveValue(valueProp);
          return state.value.includes(primitiveValue);
        }
        return state.value === valueProp;
      }
      if (Array.isArray(state.value)) return false;
      if (typeof state.value === "boolean") return state.value;
      return false;
    });

    const ref = useRef<HTMLInputElement>(null);
    const tagName = useTagName(ref, props.as || "input");
    const nativeCheckbox = isNativeCheckbox(tagName, props.type);
    const mixed = checked ? checked === "mixed" : undefined;
    const isChecked = checked === "mixed" ? false : checked;
    const disabled = disabledFromProps(props);
    // When the checked property is programmatically set on the change event, we
    // need to schedule the element's property update, so the controlled
    // isChecked state can be taken into account.
    const [propertyUpdated, schedulePropertyUpdate] = useForceUpdate();

    useEffect(() => {
      const element = ref.current;
      if (!element) return;
      setMixed(element, mixed);
      if (nativeCheckbox) return;
      element.checked = isChecked;
      if (name !== undefined) {
        element.name = name;
      }
      if (valueProp !== undefined) {
        element.value = `${valueProp}`;
      }
    }, [propertyUpdated, mixed, nativeCheckbox, isChecked, name, valueProp]);

    const onChangeProp = props.onChange;

    const onChange = useEvent((event: ChangeEvent<HTMLInputElement>) => {
      if (disabled) {
        event.stopPropagation();
        event.preventDefault();
        return;
      }
      setMixed(event.currentTarget, mixed);
      if (!nativeCheckbox) {
        // If the element is not a native checkbox, we need to manually update
        // its checked property.
        event.currentTarget.checked = !event.currentTarget.checked;
        schedulePropertyUpdate();
      }
      onChangeProp?.(event);
      if (event.defaultPrevented) return;

      const elementChecked = event.currentTarget.checked;
      setChecked(elementChecked);

      store?.setValue((prevValue) => {
        if (valueProp == null) return elementChecked;
        const primitiveValue = getPrimitiveValue(valueProp);
        if (!Array.isArray(prevValue)) {
          return prevValue === primitiveValue ? false : primitiveValue;
        }
        if (elementChecked) {
          if (prevValue.includes(primitiveValue)) {
            return prevValue;
          }
          return [...prevValue, primitiveValue];
        }
        return prevValue.filter((v) => v !== primitiveValue);
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
      [isChecked],
    );

    props = {
      role: !nativeCheckbox ? "checkbox" : undefined,
      type: nativeCheckbox ? "checkbox" : undefined,
      "aria-checked": checked,
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onChange,
      onClick,
    };

    props = useCommand({ clickOnEnter: !nativeCheckbox, ...props });

    return {
      name: nativeCheckbox ? name : undefined,
      value: nativeCheckbox ? valueProp : undefined,
      checked: isChecked,
      ...props,
    };
  },
);

/**
 * Renders an accessible checkbox element. If the underlying element is not a
 * native checkbox, this component will pass additional attributes to make sure
 * it's accessible.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * <Checkbox render={<div />}>Accessible checkbox</Checkbox>
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
   * Object returned by the
   * [`useCheckboxStore`](https://ariakit.org/reference/use-checkbox-store)
   * hook. If not provided, the closest
   * [`CheckboxProvider`](https://ariakit.org/reference/checkbox-provider)
   * component's context will be used. Otherwise, the component will fall back
   * to an internal store.
   *
   * Live examples:
   * - [Checkbox as button](https://ariakit.org/examples/checkbox-as-button)
   */
  store?: CheckboxStore;
  /**
   * The native `name` attribute.
   */
  name?: string;
  /**
   * The value of the checkbox. This is useful when the same checkbox store is
   * used for multiple `Checkbox` elements, in which case the value will be an
   * array of checked values.
   *
   * Live examples:
   * - [Checkbox group](https://ariakit.org/examples/checkbox-group)
   * - [MenuItemCheckbox](https://ariakit.org/examples/menu-item-checkbox)
   * @example
   * ```jsx
   * <CheckboxProvider defaultValue={["Apple", "Orange"]}>
   *   <Checkbox value="Apple" />
   *   <Checkbox value="Orange" />
   *   <Checkbox value="Watermelon" />
   * </CheckboxProvider>
   * ```
   */
  value?: InputHTMLAttributes<HTMLInputElement>["value"];
  /**
   * The default `checked` state of the checkbox. This prop is ignored if the
   * `checked` or the `store` props are provided.
   */
  defaultChecked?: "mixed" | boolean;
  /**
   * The `checked` state of the checkbox. This will override the value inferred
   * from `store` prop, if provided. This can be `"mixed"` to indicate that the
   * checkbox is partially checked.
   */
  checked?: "mixed" | boolean;
  /**
   * A function that is called when the checkbox's `checked` store changes.
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export type CheckboxProps<T extends As = "input"> = Props<CheckboxOptions<T>>;
