import {
  FocusEvent,
  MouseEvent,
  SyntheticEvent,
  useContext,
  useEffect,
  useRef,
} from "react";
import { BivariantCallback } from "@ariakit/core/utils/types";
import {
  CompositeItemOptions,
  useCompositeItem,
} from "../composite/composite-item";
import { useEvent, useForkRef, useId, useTagName } from "../utils/hooks";
import { useStoreState } from "../utils/store";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system";
import { As, Props } from "../utils/types";
import { RadioContext } from "./radio-context";
import { RadioStore, RadioStoreState } from "./radio-store";

function getIsChecked(
  value: RadioOptions["value"],
  storeValue?: RadioStoreState["value"]
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
 *   <Role as="input" {...props} />
 *   <Radio value="Orange" />
 * </RadioGroup>
 * ```
 */
export const useRadio = createHook<RadioOptions>(
  ({ store, value, checked, ...props }) => {
    const context = useContext(RadioContext);
    store = store || context;

    const id = useId(props.id);

    const ref = useRef<HTMLInputElement>(null);
    const isChecked =
      useStoreState(
        store,
        (state) => checked ?? getIsChecked(value, state.value)
      ) ?? checked;

    // When the radio store has a default value, we need to update the active id
    // to point to the checked element, otherwise it'll be the first item in the
    // list.
    useEffect(() => {
      if (!isChecked) return;
      const isActiveItem = id && store?.getState().activeId === id;
      if (!isActiveItem) return;
      store?.setActiveId(id);
    }, [store, isChecked, id]);

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
      store?.setValue(value);
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
      ref: useForkRef(ref, props.ref),
      onChange,
      onClick,
      onFocus,
    };

    props = useCompositeItem({ store, clickOnEnter: !nativeRadio, ...props });

    return {
      value: nativeRadio ? value : undefined,
      checked: isChecked,
      ...props,
    };
  }
);

/**
 * Renders a radio button element.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx
 * const radio = useRadioStore();
 * <RadioGroup store={radio}>
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

export interface RadioOptions<T extends As = "input">
  extends CompositeItemOptions<T> {
  /**
   * Object returned by the `useRadioStore` hook. If not provided, the parent
   * `RadioGroup` component's context will be used.
   */
  store?: RadioStore;
  /**
   * The value of the radio button.
   */
  value: string | number;
  /**
   * Whether the radio button is checked.
   */
  checked?: boolean;
  /**
   * Callback function that is called when the radio button store changes.
   */
  onChange?: BivariantCallback<
    (event: SyntheticEvent<HTMLInputElement>) => void
  >;
}

export type RadioProps<T extends As = "input"> = Props<RadioOptions<T>>;
