import { useDynamicStoreState } from "@ariakit/solid-store";
import {
  createHook,
  createInstance,
  createRef,
  extractTagName,
  mergeProps,
  withOptions,
  wrapInstance,
} from "@ariakit/solid-utils";
import type { Props } from "@ariakit/solid-utils";
import { disabledFromProps } from "@ariakit/utils";
import type { Accessor, ComponentProps, ValidComponent } from "solid-js";
import { createEffect, createSignal } from "solid-js";
import { As } from "../as/as.tsx";
import type { CommandOptions } from "../command/command.tsx";
import { useCommand } from "../command/command.tsx";
import { CheckboxCheckedContext } from "./checkbox-checked-context.tsx";
import { useCheckboxContext } from "./checkbox-context.tsx";
import type { CheckboxStore } from "./checkbox-store.ts";

const TagName = "input" satisfies ValidComponent;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function setMixed(element: HTMLType, mixed?: boolean) {
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
 * @see https://solid.ariakit.com/components/checkbox
 * @example
 * ```jsx
 * const props = useCheckbox({ render: <div /> });
 * <Role {...props}>Accessible checkbox</Role>
 * ```
 */
export const useCheckbox = createHook<TagName, CheckboxOptions>(
  withOptions(
    { store: undefined, defaultChecked: undefined },
    function useCheckbox(props, options) {
      // Stable reference to the incoming props. The returned props object below
      // is reassigned to the `props` variable, so reactive getters and event
      // handlers must read from `ownProps` to avoid self-referencing the merged
      // result (e.g. the final `get name()` reads back into a `name()` that
      // reads `props.name` — an infinite loop if `props` is the merged proxy),
      // mirroring the established Command/Focusable pattern.
      const ownProps = props;
      const name = () => ownProps.name;
      const value = () => ownProps.value;
      const checkedProp = () => ownProps.checked;
      // User event handlers, captured as plain callables. Solid types `on*`
      // props as a union that includes a `[handler, data]` tuple form, which
      // isn't directly callable, so we read and cast them here.
      const onChangeProp = () =>
        ownProps.onChange as ((event: Event) => void) | undefined;
      const onClickProp = () =>
        ownProps.onClick as ((event: MouseEvent) => void) | undefined;

      const context = useCheckboxContext();
      const store = () => options.store?.() ?? context();

      // `defaultChecked` seeds the internal signal once, at init.
      const [_checked, setChecked] = createSignal(
        options.defaultChecked ?? false,
      );

      const checked = useDynamicStoreState(store, (state) => {
        const $checked = checkedProp();
        if ($checked !== undefined) return $checked;
        if (state?.value === undefined) return _checked();
        const $value = value();
        if ($value != null) {
          if (Array.isArray(state.value)) {
            const primitiveValue = getPrimitiveValue($value);
            return state.value.includes(primitiveValue);
          }
          return state.value === $value;
        }
        if (Array.isArray(state.value)) return false;
        if (typeof state.value === "boolean") return state.value;
        return false;
      });

      const ref = createRef<HTMLType>();
      const tagName = extractTagName(ref.get, TagName);
      const nativeCheckbox = () => isNativeCheckbox(tagName(), ownProps.type);
      const mixed = () => (checked() ? checked() === "mixed" : undefined);
      const isChecked = () =>
        checked() === "mixed" ? false : (checked() as boolean);
      const disabled = () => disabledFromProps(ownProps);

      // When the checked property is programmatically set on the change event,
      // we need to schedule the element's property update, so the controlled
      // isChecked state can be taken into account.
      const [propertyUpdated, schedulePropertyUpdate] = createSignal(
        undefined,
        {
          equals: false,
        },
      );

      createEffect(() => {
        propertyUpdated();
        const $mixed = mixed();
        const $nativeCheckbox = nativeCheckbox();
        const $isChecked = isChecked();
        const $name = name();
        const $value = value();
        const element = ref.current;
        if (!element) return;
        setMixed(element, $mixed);
        if ($nativeCheckbox) return;
        element.checked = $isChecked;
        if ($name !== undefined) {
          element.name = $name;
        }
        if ($value !== undefined) {
          element.value = String($value);
        }
      });

      const onChange = (event: Event & { currentTarget: HTMLType }) => {
        if (disabled()) {
          event.stopPropagation();
          event.preventDefault();
          return;
        }
        setMixed(event.currentTarget, mixed());
        if (!nativeCheckbox()) {
          // If the element is not a native checkbox, we need to manually update
          // its checked property.
          event.currentTarget.checked = !event.currentTarget.checked;
          queueMicrotask(schedulePropertyUpdate);
        }
        onChangeProp()?.(event);
        if (event.defaultPrevented) return;

        const elementChecked = event.currentTarget.checked;
        setChecked(elementChecked);

        store()?.setValue((prevValue) => {
          const $value = value();
          if ($value == null) return elementChecked;
          const primitiveValue = getPrimitiveValue($value);
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
      };

      const onClick = (event: MouseEvent & { currentTarget: HTMLType }) => {
        onClickProp()?.(event);
        if (event.defaultPrevented) return;
        if (nativeCheckbox()) return;
        // The onChange event expects a ChangeEvent, but here we need to pass a
        // MouseEvent. For non-native checkboxes, the click drives onChange.
        onChange(event as unknown as Event & { currentTarget: HTMLType });
      };

      props = wrapInstance(
        props,
        <As component={CheckboxCheckedContext.Provider} value={isChecked} />,
      );

      props = mergeProps(
        {
          get role() {
            return !nativeCheckbox() ? "checkbox" : undefined;
          },
          get "aria-checked"() {
            return checked();
          },
          ref: ref.set,
          onChange,
          onClick,
        },
        props,
        // Drop the user's raw `onChange`/`onClick` from the merge. The Ariakit
        // handlers above already invoke them internally (via `onChangeProp()`/
        // `onClickProp()`, honoring `event.defaultPrevented`); without this,
        // `combineProps` would also chain the user handlers, running them twice
        // per event. This matches React, which places its `onChange`/`onClick`
        // after `...props` so the Ariakit handler fully replaces the user's.
        ["onChange", "onClick"] as Array<keyof typeof props>,
      );

      props = mergeProps(
        {
          get clickOnEnter() {
            return ownProps.clickOnEnter ?? !nativeCheckbox();
          },
        },
        props,
      );

      // `useCommand` (via Command's `checked` HTML attribute) only accepts a
      // `boolean` checked, but our merged props still carry the `"mixed"` union
      // member from the option. The native `checked` attribute is finalized to
      // `isChecked()` (a plain boolean) just below, so narrowing here is safe.
      props = useCommand<TagName>(
        props as typeof props & {
          checked: Exclude<(typeof props)["checked"], "mixed">;
        },
      );

      props = mergeProps(
        {
          get type() {
            return nativeCheckbox() ? "checkbox" : undefined;
          },
          get name() {
            return nativeCheckbox() ? name() : undefined;
          },
          get value() {
            return nativeCheckbox() ? value() : undefined;
          },
          get checked() {
            return isChecked();
          },
        },
        props,
        // Drop the user's raw `type`/`name`/`value`/`checked` so the computed
        // getters are the sole source, mirroring React's `useCheckbox`, which
        // destructures these out of props before spreading `...props`. Without
        // this, `combineProps` resolves plain keys last-non-undefined-wins and
        // `props` (the user) is last, so a controlled `checked="mixed"` would
        // leak the raw `"mixed"` string instead of the coerced `isChecked()`
        // boolean, and a non-native checkbox would leak the user's `name`/
        // `value` that the getters strip. `type` is overridden here (after
        // `useCommand`) rather than before it so the checkbox's `undefined`
        // beats Command's `type="button"` for a non-native checkbox rendered as
        // a real `<button>` — combineProps is last-non-undefined-wins, so an
        // earlier `undefined` would otherwise let Command's value survive,
        // unlike React where the checkbox's `type` flows through `...props`
        // last and wins.
        ["type", "name", "value", "checked"] as Array<keyof typeof props>,
      );

      // Return the reactive props proxy directly. Unlike React (which calls
      // `removeUndefinedValues` then re-renders on every state change), flatten-
      // ing here would snapshot the reactive getters (`role`/`type`/`aria-
      // checked`/`checked`) at their initial values, so they'd never update
      // after mount (e.g. `nativeCheckbox()` flips once the ref resolves to a
      // non-`input` element). Solid omits `undefined`/`null` attributes when
      // rendering, so dropping `removeUndefinedValues` is safe — matching the
      // sibling Command/Focusable hooks, which also return the proxy as-is.
      return props;
    },
  ),
);

/**
 * Renders an accessible checkbox element. If the underlying element is not a
 * native checkbox, this component will pass additional attributes to make sure
 * it's accessible.
 * @see https://solid.ariakit.com/components/checkbox
 * @example
 * ```jsx
 * <Checkbox render={<div />}>Accessible checkbox</Checkbox>
 * ```
 */
export const Checkbox = function Checkbox(props: CheckboxProps) {
  const htmlProps = useCheckbox(props);
  return createInstance(TagName, htmlProps);
};

export interface CheckboxOptions<
  T extends ValidComponent = TagName,
> extends CommandOptions<T> {
  /**
   * Object returned by the
   * [`useCheckboxStore`](https://solid.ariakit.com/reference/use-checkbox-store)
   * hook. If not provided, the closest
   * [`CheckboxProvider`](https://solid.ariakit.com/reference/checkbox-provider)
   * component's context will be used. Otherwise, the component will fall back
   * to an internal store.
   *
   * Live examples:
   * - [Checkbox as button](https://solid.ariakit.com/examples/checkbox-as-button)
   */
  store?: Accessor<CheckboxStore>;
  /**
   * The native `name` attribute.
   *
   * Live examples:
   * - [MenuItemCheckbox](https://solid.ariakit.com/examples/menu-item-checkbox)
   */
  name?: string;
  /**
   * The value of the checkbox. This is useful when the same checkbox store is
   * used for multiple [`Checkbox`](https://solid.ariakit.com/reference/checkbox)
   * elements, in which case the value will be an array of checked values.
   *
   * Live examples:
   * - [Checkbox group](https://solid.ariakit.com/examples/checkbox-group)
   * - [MenuItemCheckbox](https://solid.ariakit.com/examples/menu-item-checkbox)
   * @example
   * ```jsx "value"
   * <CheckboxProvider defaultValue={["Apple", "Orange"]}>
   *   <Checkbox value="Apple" />
   *   <Checkbox value="Orange" />
   *   <Checkbox value="Watermelon" />
   * </CheckboxProvider>
   * ```
   */
  value?: ComponentProps<TagName>["value"];
  /**
   * The default checked state of the checkbox. This prop is ignored if the
   * [`checked`](https://solid.ariakit.com/reference/checkbox#checked) or the
   * [`store`](https://solid.ariakit.com/reference/checkbox#store) props are provided.
   */
  defaultChecked?: "mixed" | boolean;
  /**
   * The checked state of the checkbox. This will override the value inferred
   * from [`store`](https://solid.ariakit.com/reference/checkbox#store) prop, if
   * provided. This can be `"mixed"` to indicate that the checkbox is partially
   * checked.
   */
  checked?: "mixed" | boolean;
  /**
   * A function that is called when the checkbox's checked state changes.
   */
  onChange?: ComponentProps<TagName>["onChange"];
}

export type CheckboxProps<T extends ValidComponent = TagName> = Props<
  T,
  CheckboxOptions<T>
>;
