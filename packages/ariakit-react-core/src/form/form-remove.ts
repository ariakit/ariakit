import { MouseEvent, useContext } from "react";
import { StringLike } from "@ariakit/core/form/types";
import { isTextField } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import { ButtonOptions, useButton } from "../button/button.js";
import { useEvent } from "../utils/hooks.js";
import {
  createComponent,
  createElement,
  createHook,
} from "../utils/system.jsx";
import { As, Props } from "../utils/types.js";
import { FormContext } from "./form-context.js";
import { FormStore, FormStoreState } from "./form-store.js";

function findNextOrPreviousField(
  items: FormStoreState["items"] | undefined,
  name: string,
  index: number
) {
  const fields = items?.filter(
    (item) => item.type === "field" && item.name.startsWith(name)
  );
  const regex = new RegExp(`^${name}\\.(\\d+)`);
  const nextField = fields?.find((field) => {
    const fieldIndex = field.name.replace(regex, "$1");
    return parseInt(fieldIndex) > index;
  });
  if (nextField) return nextField;
  return fields?.reverse().find((field) => {
    const fieldIndex = field.name.replace(regex, "$1");
    return parseInt(fieldIndex) < index;
  });
}

function findPushButton(
  items: FormStoreState["items"] | undefined,
  name: string
) {
  return items?.find((item) => item.type === "button" && item.name === name);
}

/**
 * Returns props to create a `FormRemove` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 * const props = useFormRemove({
 *   store,
 *   name: store.names.languages,
 *   index: 0,
 * });
 * const values = store.useState("values");
 *
 * <Form store={store}>
 *   {values.languages.map((_, i) => (
 *     <FormInput key={i} name={store.names.languages[i]} />
 *   ))}
 *   <Role {...props}>Remove first language</Role>
 * </Form>
 * ```
 */
export const useFormRemove = createHook<FormRemoveOptions>(
  ({ store, name: nameProp, index, autoFocusOnClick = true, ...props }) => {
    const context = useContext(FormContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormRemove must be wrapped in a Form component"
    );

    const name = `${nameProp}`;
    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (!store) return;
      store.removeValue(name, index);
      if (!autoFocusOnClick) return;
      const { items } = store.getState();
      const item = findNextOrPreviousField(items, name, index);
      const element = item?.element;
      if (element) {
        element.focus();
        if (isTextField(element)) {
          element.select();
        }
      } else {
        const pushButton = findPushButton(items, name);
        pushButton?.element?.focus();
      }
    });

    props = {
      ...props,
      onClick,
    };

    props = useButton(props);

    return props;
  }
);

/**
 * Renders a button that will remove an item from an array field in the form
 * when clicked.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormStore({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 * const values = form.useState("values");
 *
 * <Form store={form}>
 *   {values.languages.map((_, i) => (
 *     <div key={i}>
 *       <FormInput name={form.names.languages[i]} />
 *       <FormRemove name={form.names.languages} index={i} />
 *     </div>
 *   ))}
 * </Form>
 * ```
 */
export const FormRemove = createComponent<FormRemoveOptions>((props) => {
  const htmlProps = useFormRemove(props);
  return createElement("button", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  FormRemove.displayName = "FormRemove";
}

export interface FormRemoveOptions<T extends As = "button">
  extends ButtonOptions<T> {
  /**
   * Object returned by the `useFormStore` hook. If not provided, the parent
   * `Form` component's context will be used.
   */
  store?: FormStore;
  /**
   * Name of the array field.
   */
  name: StringLike;
  /**
   * Index of the item to remove.
   */
  index: number;
  /**
   * Whether the focus should be moved to the next or previous field when the
   * button is clicked.
   * @default true
   */
  autoFocusOnClick?: boolean;
}

export type FormRemoveProps<T extends As = "button"> = Props<
  FormRemoveOptions<T>
>;
