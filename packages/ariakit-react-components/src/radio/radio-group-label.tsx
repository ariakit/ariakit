import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import type { ElementType } from "react";
import type { GroupLabelOptions } from "../group/group-label.tsx";
import { useGroupLabel } from "../group/group-label.tsx";
import type { RadioStore } from "./radio-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `RadioGroupLabel` component. This hook must be used
 * in a component that's wrapped with `RadioGroup` so the `aria-labelledby` prop
 * is properly set on the radio group element.
 * @see https://ariakit.com/components/radio
 * @example
 * ```jsx
 * // This component must be wrapped with RadioGroup
 * const props = useRadioGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export const useRadioGroupLabel = createHook<TagName, RadioGroupLabelOptions>(
  function useRadioGroupLabel({ store, ...props }) {
    props = useGroupLabel(props);
    return props;
  },
);

/**
 * Renders a label in a radio group. This component must be wrapped with
 * [`RadioGroup`](https://ariakit.com/reference/radio-group) so the
 * `aria-labelledby` prop is properly set on the radio group element.
 *
 * The radio group receives the label id after this component mounts, so
 * server-rendered HTML doesn't name the radio group until hydration.
 * @see https://ariakit.com/components/radio
 * @example
 * ```jsx {3}
 * <RadioProvider>
 *   <RadioGroup>
 *     <RadioGroupLabel>Fruit</RadioGroupLabel>
 *     <Radio value="Apple" />
 *     <Radio value="Orange" />
 *   </RadioGroup>
 * </RadioProvider>
 * ```
 */
export const RadioGroupLabel = forwardRef(function RadioGroupLabel(
  props: RadioGroupLabelProps,
) {
  const htmlProps = useRadioGroupLabel(props);
  return createElement(TagName, htmlProps);
});

export interface RadioGroupLabelOptions<
  T extends ElementType = TagName,
> extends GroupLabelOptions<T> {
  /**
   * Object returned by the
   * [`useRadioStore`](https://ariakit.com/reference/use-radio-store) hook. If
   * not provided, the closest
   * [`RadioGroup`](https://ariakit.com/reference/radio-group) or
   * [`RadioProvider`](https://ariakit.com/reference/radio-provider) components'
   * context will be used.
   */
  store?: RadioStore;
}

export type RadioGroupLabelProps<T extends ElementType = TagName> = Props<
  T,
  RadioGroupLabelOptions<T>
>;
