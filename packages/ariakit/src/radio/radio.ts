import {
  FocusEvent,
  MouseEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  useEvent,
  useForkRef,
  useId,
  useLiveRef,
  useTagName,
} from "ariakit-react-utils/hooks";
import { createMemoComponent, useStore } from "ariakit-react-utils/store";
import { createElement, createHook } from "ariakit-react-utils/system";
import { As, BivariantCallback, Props } from "ariakit-utils/types";
import {
  CompositeItemOptions,
  useCompositeItem,
} from "../composite/composite-item";
import { RadioContextState } from "./__utils";
import { RadioState } from "./radio-state";

function getIsChecked(
  value: RadioOptions["value"],
  stateValue?: RadioState["value"]
) {
  if (stateValue === undefined) return;
  if (value != null && stateValue != null) {
    return stateValue === value;
  }
  return !!stateValue;
}

function isNativeRadio(tagName?: string, type?: string) {
  return tagName === "input" && (!type || type === "radio");
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a radio button element.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx
 * const state = useRadioState();
 * const props = useRadio({ state, value: "Apple" });
 * <RadioGroup state={state}>
 *   <Role as="input" {...props} />
 *   <Radio value="Orange" />
 * </RadioGroup>
 * ```
 */
export const useRadio = createHook<RadioOptions>(
  ({ state, value, checked, ...props }) => {
    const id = useId(props.id);
    state = useStore(state || RadioContextState, [
      useCallback((s: RadioState) => s.activeId === id, [id]),
      useCallback((s: RadioState) => s.value === value, [value]),
      "setActiveId",
      "setValue",
    ]);

    const ref = useRef<HTMLInputElement>(null);
    const isActiveItemRef = useLiveRef(state?.activeId === id);
    const isChecked = checked ?? getIsChecked(value, state?.value);

    // When the radio state has a default value, we need to update the active id
    // to point to the checked element, otherwise it'll be the first item in the
    // list.
    useEffect(() => {
      if (!isActiveItemRef.current && isChecked) {
        state?.setActiveId(id);
      }
    }, [isChecked, state?.setActiveId, id]);

    const onChangeProp = props.onChange;
    const tagName = useTagName(ref, props.as || "input");
    const nativeRadio = isNativeRadio(tagName, props.type);

    const onChange = useEvent((event: SyntheticEvent<HTMLInputElement>) => {
      if (props.disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (!nativeRadio) {
        event.currentTarget.checked = true;
      }
      onChangeProp?.(event);
      if (event.defaultPrevented) return;
      state?.setValue(value);
    });

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLInputElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (nativeRadio) return;
      onChange(event);
    });

    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLInputElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      if (!nativeRadio) return;
      if (!state?.moves) return;
      if (!isActiveItemRef.current) return;
      onChange(event);
    });

    props = {
      id,
      role: !nativeRadio ? "radio" : undefined,
      type: nativeRadio ? "radio" : undefined,
      "aria-checked": isChecked,
      ...props,
      ref: useForkRef(ref, props.ref),
      onChange,
      onClick,
      onFocus,
    };

    props = useCompositeItem({ state, clickOnEnter: !nativeRadio, ...props });

    return {
      value: nativeRadio ? value : undefined,
      checked: isChecked,
      ...props,
    };
  }
);

/**
 * A component that renders a radio button element.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx
 * const radio = useRadioState();
 * <RadioGroup state={radio}>
 *   <Radio value="Apple" />
 *   <Radio value="Orange" />
 * </RadioGroup>
 * ```
 */
export const Radio = createMemoComponent<RadioOptions>((props) => {
  const htmlProps = useRadio(props);
  return createElement("input", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Radio.displayName = "Radio";
}

export type RadioOptions<T extends As = "input"> = Omit<
  CompositeItemOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useRadioState` hook. If not provided, the parent
   * `RadioGroup` component's context will be used.
   */
  state?: RadioState;
  /**
   * The value of the radio button.
   */
  value: string | number;
  /**
   * Whether the radio button is checked.
   */
  checked?: boolean;
  /**
   * Callback function that is called when the radio button state changes.
   */
  onChange?: BivariantCallback<
    (event: SyntheticEvent<HTMLInputElement>) => void
  >;
};

export type RadioProps<T extends As = "input"> = Props<RadioOptions<T>>;
