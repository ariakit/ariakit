import type { ElementType } from "react";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.js";
import type { Props } from "../utils/types.js";
import { useFormControl } from "./form-control.js";
import type { FormControlOptions } from "./form-control.js";

const TagName = "input" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `FormField` component. Unlike `useFormInput`, this
 * hook doesn't automatically returns the `value` and `onChange` props. This is
 * so we can use it not only for native form elements but also for custom
 * components whose value is not controlled by the native `value` and `onChange`
 * props.
 * @deprecated Use `useFormControl` instead.
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { content: "" } });
 * const props = useFormField({ store, name: store.names.content });
 * const value = store.useValue(store.names.content);
 *
 * <Form store={store}>
 *   <FormLabel name={store.names.content}>Content</FormLabel>
 *   <Role
 *     {...props}
 *     value={value}
 *     onChange={(value) => store.setValue(store.names.content, value)}
 *     render={<Editor />}
 *   />
 * </Form>
 * ```
 */
export const useFormField = createHook<TagName, FormFieldOptions>(
  function useFormField(props) {
    return useFormControl(props);
  },
);

/**
 * Abstract component that renders a form field. Unlike
 * [`FormInput`](https://ariakit.org/reference/form-input), this component
 * doesn't automatically pass the `value` and `onChange` props down to the
 * underlying element. This is so we can use it not only for native form
 * elements but also for custom components whose value is not controlled by the
 * native `value` and `onChange` props.
 * @deprecated
 * This component has been renamed to
 * [`FormControl`](https://ariakit.org/reference/form-control). The API remains
 * the same.
 * @example
 * ```jsx {11-19}
 * const form = useFormStore({
 *   defaultValues: {
 *     content: "",
 *   },
 * });
 *
 * const value = form.useValue(form.names.content);
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.content}>Content</FormLabel>
 *   <FormField
 *     name={form.names.content}
 *     render={
 *       <Editor
 *         value={value}
 *         onChange={(value) => form.setValue(form.names.content, value)}
 *       />
 *     }
 *   />
 * </Form>
 * ```
 */
export const FormField = memo(
  forwardRef(function FormField(props: FormFieldProps) {
    const htmlProps = useFormField(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface FormFieldOptions<T extends ElementType = TagName>
  extends FormControlOptions<T> {}

export type FormFieldProps<T extends ElementType = TagName> = Props<
  T,
  FormFieldOptions<T>
>;
