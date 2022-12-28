import { useStoreProvider } from "ariakit-react-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import { CompositeOptions, useComposite } from "../composite/composite";
import { RadioContextState } from "./__utils";
import { RadioState } from "./radio-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a radio group element.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx
 * const state = useRadioState();
 * const props = useRadioGroup({ state });
 * <Role {...props}>
 *   <Radio value="Apple" />
 *   <Radio value="Orange" />
 * </Role>
 * ```
 */
export const useRadioGroup = createHook<RadioGroupOptions>(
  ({ state, ...props }) => {
    props = useStoreProvider({ state, ...props }, RadioContextState);

    props = {
      role: "radiogroup",
      ...props,
    };

    props = useComposite({ state, ...props });

    return props;
  }
);

/**
 * A component that renders a radio group element.
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
export const RadioGroup = createComponent<RadioGroupOptions>((props) => {
  const htmlProps = useRadioGroup(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  RadioGroup.displayName = "RadioGroup";
}

export type RadioGroupOptions<T extends As = "div"> = Omit<
  CompositeOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useRadioState` hook.
   */
  state: RadioState;
};

export type RadioGroupProps<T extends As = "div"> = Props<RadioGroupOptions<T>>;
