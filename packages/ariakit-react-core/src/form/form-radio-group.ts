import type { ElementType } from "react";
import { createElement, createHook2, forwardRef } from "../utils/system.js";
import type { Props2 } from "../utils/types.js";
import type { FormGroupOptions } from "./form-group.js";
import { useFormGroup } from "./form-group.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `FormRadioGroup` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { color: "red" } });
 * const props = useFormRadioGroup({ store });
 * <Form store={store}>
 *   <Role {...props}>
 *     <FormGroupLabel>Favorite color</FormGroupLabel>
 *     <FormRadio name={store.names.color} value="red" />
 *     <FormRadio name={store.names.color} value="blue" />
 *     <FormRadio name={store.names.color} value="green" />
 *   </Role>
 * </Form>
 * ```
 */
export const useFormRadioGroup = createHook2<TagName, FormRadioGroupOptions>(
  function useFormRadioGroup({ store, ...props }) {
    props = { role: "radiogroup", ...props };
    props = useFormGroup(props);
    return props;
  },
);

/**
 * Renders a group element for
 * [`FormRadio`](https://ariakit.org/reference/form-radio) elements. The
 * [`FormGroupLabel`](https://ariakit.org/reference/form-group-label) component
 * can be used inside this component so the `aria-labelledby` prop is properly
 * set on the group element.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {8-13}
 * const form = useFormStore({
 *   defaultValues: {
 *     color: "red",
 *   },
 * });
 *
 * <Form store={form}>
 *   <FormRadioGroup>
 *     <FormGroupLabel>Favorite color</FormGroupLabel>
 *     <FormRadio name={form.names.color} value="red" />
 *     <FormRadio name={form.names.color} value="blue" />
 *     <FormRadio name={form.names.color} value="green" />
 *   </FormRadioGroup>
 * </Form>
 * ```
 */
export const FormRadioGroup = forwardRef(function FormRadioGroup(
  props: FormRadioGroupProps,
) {
  const htmlProps = useFormRadioGroup(props);
  return createElement(TagName, htmlProps);
});

export type FormRadioGroupOptions<T extends ElementType = TagName> =
  FormGroupOptions<T>;

export type FormRadioGroupProps<T extends ElementType = TagName> = Props2<
  T,
  FormRadioGroupOptions<T>
>;
