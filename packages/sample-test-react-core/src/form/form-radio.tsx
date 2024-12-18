import { invariant } from "@ariakit/core/utils/misc";
import type { ChangeEvent, ElementType } from "react";
import type { RadioOptions } from "../radio/radio.tsx";
import { useRadio } from "../radio/radio.tsx";
import { useEvent } from "../utils/hooks.ts";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useFormContext } from "./form-context.tsx";
import type { FormControlOptions } from "./form-control.tsx";
import { useFormControl } from "./form-control.tsx";

const TagName = "input" satisfies ElementType;
type TagName = typeof TagName;

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
export const useFormRadio = createHook<TagName, FormRadioOptions>(
  function useFormRadio({ store, name: nameProp, value, ...props }) {
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

    props = useFormControl({
      store,
      name,
      "aria-labelledby": undefined,
      ...props,
    });

    return props;
  },
);

/**
 * Renders a radio button as a form control. This component must be wrapped in a
 * [`FormRadioGroup`](https://ariakit.org/reference/form-radio-group) along with
 * other radio buttons sharing the same
 * [`name`](https://ariakit.org/reference/form-radio#name).
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {10-12}
 * const form = useFormStore({
 *   defaultValues: {
 *     char: "a",
 *   },
 * });
 *
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
export const FormRadio = memo(
  forwardRef(function FormRadio(props: FormRadioProps) {
    const htmlProps = useFormRadio(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface FormRadioOptions<T extends ElementType = TagName>
  extends FormControlOptions<T>,
    Omit<RadioOptions<T>, "store" | "name"> {}

export type FormRadioProps<T extends ElementType = TagName> = Props<
  T,
  FormRadioOptions<T>
>;
