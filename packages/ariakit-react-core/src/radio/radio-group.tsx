import { CompositeOptions, useComposite } from "../composite/composite";
import { useWrapElement } from "../utils/hooks";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { RadioContext } from "./radio-context";
import { RadioStore } from "./radio-store";

/**
 * Returns props to create a `RadioGroup` component.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx
 * const store = useRadioStore();
 * const props = useRadioGroup({ store });
 * <Role {...props}>
 *   <Radio value="Apple" />
 *   <Radio value="Orange" />
 * </Role>
 * ```
 */
export const useRadioGroup = createHook<RadioGroupOptions>(
  ({ store, ...props }) => {
    props = useWrapElement(
      props,
      (element) => (
        <RadioContext.Provider value={store}>{element}</RadioContext.Provider>
      ),
      [store]
    );

    props = {
      role: "radiogroup",
      ...props,
    };

    props = useComposite({ store, ...props });

    return props;
  }
);

/**
 * Renders a radio group element.
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
export const RadioGroup = createComponent<RadioGroupOptions>((props) => {
  const htmlProps = useRadioGroup(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  RadioGroup.displayName = "RadioGroup";
}

export interface RadioGroupOptions<T extends As = "div">
  extends CompositeOptions<T> {
  /**
   * Object returned by the `useRadioStore` hook.
   */
  store: RadioStore;
}

export type RadioGroupProps<T extends As = "div"> = Props<RadioGroupOptions<T>>;
