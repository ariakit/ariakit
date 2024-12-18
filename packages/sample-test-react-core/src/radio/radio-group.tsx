import { invariant } from "@ariakit/core/utils/misc";
import type { ElementType } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import { useComposite } from "../composite/composite.tsx";
import { useWrapElement } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import {
  RadioScopedContextProvider,
  useRadioProviderContext,
} from "./radio-context.tsx";
import type { RadioStore } from "./radio-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

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
export const useRadioGroup = createHook<TagName, RadioGroupOptions>(
  function useRadioGroup({ store, ...props }) {
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
 * Renders a [`radiogroup`](https://w3c.github.io/aria/#radiogroup) element that
 * manages a group of [`Radio`](https://ariakit.org/reference/radio) elements.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx
 * <RadioProvider>
 *   <RadioGroup>
 *     <Radio value="Apple" />
 *     <Radio value="Orange" />
 *   </RadioGroup>
 * </RadioProvider>
 * ```
 */
export const RadioGroup = forwardRef(function RadioGroup(
  props: RadioGroupProps,
) {
  const htmlProps = useRadioGroup(props);
  return createElement(TagName, htmlProps);
});

export interface RadioGroupOptions<T extends ElementType = TagName>
  extends CompositeOptions<T> {
  /**
   * Object returned by the
   * [`useRadioStore`](https://ariakit.org/reference/use-radio-store) hook. If
   * not provided, the closest
   * [`RadioProvider`](https://ariakit.org/reference/radio-provider) component's
   * context will be used.
   */
  store?: RadioStore;
}

export type RadioGroupProps<T extends ElementType = TagName> = Props<
  T,
  RadioGroupOptions<T>
>;
