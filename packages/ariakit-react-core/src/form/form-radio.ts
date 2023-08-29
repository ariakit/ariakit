import type { ChangeEvent } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { RadioOptions } from "../radio/radio.js";
import { useRadio } from "../radio/radio.js";
import { useEvent } from "../utils/hooks.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useFormContext } from "./form-context.js";
import type { FormFieldOptions } from "./form-field.js";
import { useFormField } from "./form-field.js";

/**
 * Returns props to create a `FormRadio` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { char: "a" } });
 * const a = useFormRadio({ store, name: store.names.char, value: "a" });
 * const b = useFormRadio({ store, name: store.names.char, value: "b" });
 * const c = useFormRadio({ store, name: store.names.char, value: "c" });
 * <Form store={store}>
 *   <FormRadioGroup>
 *     <FormGroupLabel>Favorite character</FormGroupLabel>
 *     <Role {...a} />
 *     <Role {...b} />
 *     <Role {...c} />
 *   </FormRadioGroup>
 * </Form>
 * ```
 */
export const useFormRadio = createHook<FormRadioOptions>(
  ({ store, name: nameProp, value, ...props }) => {
    const context = useFormContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormRadio must be wrapped in a Form component.",
    );

    const name = `${nameProp}`;
    const onChangeProp = props.onChange;

    const onChange = useEvent((event: ChangeEvent<HTMLInputElement>) => {
      onChangeProp?.(event);
      if (event.defaultPrevented) return;
      store?.setValue(name, value);
    });

    const checkedProp = props.checked;
    const checked = store.useState(
      () => checkedProp ?? store?.getValue(name) === value,
    );

    props = {
      ...props,
      checked,
      onChange,
    };

    props = useRadio({ value, ...props });

    props = useFormField({
      store,
      name,
      "aria-labelledby": undefined,
      ...props,
    });

    return props;
  },
);

/**
 * Renders a radio button in a form.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormStore({ defaultValues: { char: "a" } });
 * <Form store={form}>
 *   <FormRadioGroup>
 *     <FormGroupLabel>Favorite character</FormGroupLabel>
 *     <FormRadio name={form.names.char} value="a" />
 *     <FormRadio name={form.names.char} value="b" />
 *     <FormRadio name={form.names.char} value="c" />
 *   </FormRadioGroup>
 * </Form>
 * ```
 */
export const FormRadio = createMemoComponent<FormRadioOptions>((props) => {
  const htmlProps = useFormRadio(props);
  return createElement("input", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  FormRadio.displayName = "FormRadio";
}

export interface FormRadioOptions<T extends As = "input">
  extends FormFieldOptions<T>,
    Omit<RadioOptions<T>, "store"> {}

export type FormRadioProps<T extends As = "input"> = Props<FormRadioOptions<T>>;
