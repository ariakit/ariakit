import type { ChangeEvent, ElementType, FocusEvent, MouseEvent } from "react";
import { useEffect, useRef } from "react";
import {
  disabledFromProps,
  removeUndefinedValues,
} from "@ariakit/core/utils/misc";
import type { BivariantCallback } from "@ariakit/core/utils/types";
import type { CompositeItemOptions } from "../composite/composite-item.js";
import { useCompositeItem } from "../composite/composite-item.js";
import {
  useEvent,
  useForceUpdate,
  useId,
  useMergeRefs,
  useTagName,
} from "../utils/hooks.js";
import { useStoreState } from "../utils/store.js";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.js";
import type { Props } from "../utils/types.js";
import { useRadioContext } from "./radio-context.js";
import type { RadioStore, RadioStoreState } from "./radio-store.js";

const TagName = "input" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function getIsChecked(
  value: RadioOptions["value"],
  storeValue?: RadioStoreState["value"],
) {
  if (storeValue === undefined) return;
  if (value != null && storeValue != null) {
    return storeValue === value;
  }
  return !!storeValue;
}

function isNativeRadio(tagName?: string, type?: string) {
  return tagName === "input" && (!type || type === "radio");
}

/**
 * Returns props to create a `Radio` component.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx
 * const store = useRadioStore();
 * const props = useRadio({ store, value: "Apple" });
 * <RadioGroup store={store}>
 *   <Role {...props} render={<input />} />
 *   <Radio value="Orange" />
 * </RadioGroup>
 * ```
 */
export const useRadio = createHook<TagName, RadioOptions>(function useRadio({
  store,
  name,
  value,
  checked,
  ...props
}) {
  const context = useRadioContext();
  store = store || context;

  const id = useId(props.id);

  const ref = useRef<HTMLType>(null);
  const isChecked = useStoreState(
    store,
    (state) => checked ?? getIsChecked(value, state?.value),
  );

  // When the radio store has a default value, we need to update the active id
  // to point to the checked element, otherwise it'll be the first item in the
  // list. TODO: Maybe this could be done in the radio store directly?
  useEffect(() => {
    if (!id) return;
    if (!isChecked) return;
    const isActiveItem = store?.getState().activeId === id;
    if (isActiveItem) return;
    store?.setActiveId(id);
  }, [store, isChecked, id]);

  const onChangeProp = props.onChange;
  const tagName = useTagName(ref, TagName);
  const nativeRadio = isNativeRadio(tagName, props.type);
  const disabled = disabledFromProps(props);
  // When the checked property is programmatically set on the change event, we
  // need to schedule the element's property update, so the controlled
  // isChecked state can be taken into account.
  const [propertyUpdated, schedulePropertyUpdate] = useForceUpdate();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (nativeRadio) return;
    if (isChecked !== undefined) {
      element.checked = isChecked;
    }
    if (name !== undefined) {
      element.name = name;
    }
    if (value !== undefined) {
      element.value = `${value}`;
    }
  }, [propertyUpdated, nativeRadio, isChecked, name, value]);

  const onChange = useEvent((event: ChangeEvent<HTMLType>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (!nativeRadio) {
      event.currentTarget.checked = true;
      schedulePropertyUpdate();
    }
    onChangeProp?.(event);
    if (event.defaultPrevented) return;
    store?.setValue(value);
  });

  const onClickProp = props.onClick;

  const onClick = useEvent((event: MouseEvent<HTMLType>) => {
    onClickProp?.(event);
    if (event.defaultPrevented) return;
    if (nativeRadio) return;
    // @ts-expect-error The onChange event expects a ChangeEvent, but here we
    // need to pass a MouseEvent.
    onChange(event);
  });

  const onFocusProp = props.onFocus;

  const onFocus = useEvent((event: FocusEvent<HTMLType>) => {
    onFocusProp?.(event);
    if (event.defaultPrevented) return;
    if (!nativeRadio) return;
    if (!store) return;
    const { moves, activeId } = store.getState();
    if (!moves) return;
    if (id && activeId !== id) return;
    onChange(event);
  });

  props = {
    id,
    role: !nativeRadio ? "radio" : undefined,
    type: nativeRadio ? "radio" : undefined,
    "aria-checked": isChecked,
    ...props,
    ref: useMergeRefs(ref, props.ref),
    onChange,
    onClick,
    onFocus,
  };

  props = useCompositeItem<TagName>({
    store,
    clickOnEnter: !nativeRadio,
    ...props,
  });

  return removeUndefinedValues({
    name: nativeRadio ? name : undefined,
    value: nativeRadio ? value : undefined,
    checked: isChecked,
    ...props,
  });
});

/**
 * Renders a radio button element that's typically wrapped in a
 * [`RadioGroup`](https://ariakit.org/reference/radio-group) component.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx {3-4}
 * <RadioProvider>
 *   <RadioGroup>
 *     <Radio value="Apple" />
 *     <Radio value="Orange" />
 *   </RadioGroup>
 * </RadioProvider>
 * ```
 */
export const Radio = memo(
  forwardRef(function Radio(props: RadioProps) {
    const htmlProps = useRadio(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface RadioOptions<T extends ElementType = TagName>
  extends CompositeItemOptions<T> {
  /**
   * Object returned by the
   * [`useRadioStore`](https://ariakit.org/reference/use-radio-store) hook. If
   * not provided, the closest
   * [`RadioGroup`](https://ariakit.org/reference/radio-group) or
   * [`RadioProvider`](https://ariakit.org/reference/radio-provider) components'
   * context will be used.
   */
  store?: RadioStore;
  /**
   * The value of the radio button.
   *
   * Live examples:
   * - [FormRadio](https://ariakit.org/examples/form-radio)
   * - [MenuItemRadio](https://ariakit.org/examples/menu-item-radio)
   */
  value: string | number;
  /**
   * The native `name` attribute.
   */
  name?: string;
  /**
   * Determines if the radio button is checked. Using this prop will make the
   * radio button controlled and override the
   * [`value`](https://ariakit.org/reference/radio-provider#value) state.
   */
  checked?: boolean;
  /**
   * Callback function that is called when the radio button state changes.
   */
  onChange?: BivariantCallback<(event: ChangeEvent<HTMLType>) => void>;
}

export type RadioProps<T extends ElementType = TagName> = Props<
  T,
  RadioOptions<T>
>;
