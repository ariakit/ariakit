import { invariant } from "@ariakit/core/utils/misc";
import type { CompositeOptions } from "../composite/composite.js";
import { useComposite } from "../composite/composite.js";
import { useWrapElement } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import {
  RadioScopedContextProvider,
  useRadioProviderContext,
} from "./radio-context.js";
import type { RadioStore } from "./radio-store.js";

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
    const context = useRadioProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "RadioGroup must receive a `store` prop or be wrapped in a RadioProvider component.",
    );

    props = useWrapElement(
      props,
      (element) => (
        <RadioScopedContextProvider value={store}>
          {element}
        </RadioScopedContextProvider>
      ),
      [store],
    );

    props = {
      role: "radiogroup",
      ...props,
    };

    props = useComposite({ store, ...props });

    return props;
  },
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
  store?: RadioStore;
}

export type RadioGroupProps<T extends As = "div"> = Props<RadioGroupOptions<T>>;
