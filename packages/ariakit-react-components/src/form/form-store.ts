import * as Core from "@ariakit/components/form/form-store";
import type { StringLike } from "@ariakit/components/form/types";
import { useStore, useStoreProps, useStoreState } from "@ariakit/react-store";
import type { Store } from "@ariakit/react-store";
import { useEvent } from "@ariakit/react-utils";
import type { PickRequired } from "@ariakit/utils";
import { useCallback, useEffect, useMemo } from "react";
import type {
  CollectionStoreFunctions,
  CollectionStoreOptions,
  CollectionStoreState,
} from "../collection/collection-store.ts";
import { useCollectionStoreProps } from "../collection/collection-store.ts";

type FormStoreHookStore<T extends FormStoreValues = FormStoreValues> = Omit<
  FormStore<T>,
  "useValue" | "useValidate" | "useSubmit"
>;

/**
 * Re-renders the component when the value of the given field changes and
 * returns the current value.
 *
 * Live examples:
 * - [Form with Select](https://ariakit.com/examples/form-select)
 * @example
 * const form = useFormStore({
 *   defaultValues: { email: "" },
 * });
 * const emailValue = useFormValue(form, form.names.email);
 */
// oxlint-disable-next-line no-unnecessary-type-parameters
export function useFormValue<T = any>(
  store: FormStoreHookStore,
  name: StringLike,
): T {
  return useStoreState(store, ["values"], () => store.getValue<T>(name));
}

/**
 * Registers a callback that will be used to validate the form when
 * [`validate`](https://ariakit.com/reference/use-form-store#validate) is
 * called, typically when a form field is touched or when the form is submitted.
 *
 * Live examples:
 * - [FormRadio](https://ariakit.com/examples/form-radio)
 * @example
 * useFormValidate(form, async (state) => {
 *   const errors = await api.validate(state.values);
 *   if (errors) {
 *     form.setErrors(errors);
 *   }
 * });
 */
export function useFormValidate<T extends FormStoreValues = FormStoreValues>(
  store: FormStoreHookStore<T>,
  callback: Core.FormStoreCallback<FormStoreState<T>>,
) {
  const eventCallback = useEvent(callback);
  // Whenever the items change (for example, when form fields are lazily
  // rendered), we need to reset the callbacks so they always run in a
  // consistent order.
  const items = useStoreState(store, "items");
  useEffect(
    () => store.onValidate(eventCallback),
    [store, items, eventCallback],
  );
}

/**
 * Registers a callback that will be used to submit the form when
 * [`submit`](https://ariakit.com/reference/use-form-store#submit) is called.
 *
 * Live examples:
 * - [FormRadio](https://ariakit.com/examples/form-radio)
 * - [Form with Select](https://ariakit.com/examples/form-select)
 * @example
 * useFormSubmit(form, async (state) => {
 *   try {
 *     await api.submit(state.values);
 *   } catch (errors) {
 *     form.setErrors(errors);
 *   }
 * });
 */
export function useFormSubmit<T extends FormStoreValues = FormStoreValues>(
  store: FormStoreHookStore<T>,
  callback: Core.FormStoreCallback<FormStoreState<T>>,
) {
  const eventCallback = useEvent(callback);
  // Same logic as useFormValidate.
  const items = useStoreState(store, "items");
  useEffect(() => store.onSubmit(eventCallback), [store, items, eventCallback]);
}

export function useFormStoreProps<T extends FormStoreHookStore>(
  store: T,
  update: () => void,
  props: FormStoreProps,
) {
  const collectionStore = useCollectionStoreProps(store, update, props);

  useStoreProps(collectionStore, props, "values", "setValues");
  useStoreProps(collectionStore, props, "errors", "setErrors");
  useStoreProps(collectionStore, props, "touched", "setTouched");

  const useValue = useCallback<FormStore["useValue"]>(
    (name) => useFormValue(collectionStore, name),
    [collectionStore],
  );

  const useValidate = useCallback<FormStore["useValidate"]>(
    (callback) => {
      useFormValidate(collectionStore, callback);
    },
    [collectionStore],
  );

  const useSubmit = useCallback<FormStore["useSubmit"]>(
    (callback) => {
      useFormSubmit(collectionStore, callback);
    },
    [collectionStore],
  );

  return useMemo(
    () => ({
      ...collectionStore,
      useValue,
      useValidate,
      useSubmit,
    }),
    [collectionStore, useValue, useValidate, useSubmit],
  );
}

/**
 * Creates a form store to control the state of
 * [Form](https://ariakit.com/components/form) components.
 * @example
 * ```jsx
 * const form = useFormStore({
 *   defaultValues: {
 *     email: "",
 *   },
 * });
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.email}>Email</FormLabel>
 *   <FormInput name={form.names.email} />
 *   <FormError name={form.names.email} />
 *   <FormSubmit>Submit</FormSubmit>
 * </Form>
 * ```
 */
export function useFormStore<T extends FormStoreValues = FormStoreValues>(
  props: PickRequired<
    FormStoreProps<T>,
    | "values"
    | "defaultValues"
    | "errors"
    | "defaultErrors"
    | "touched"
    | "defaultTouched"
  >,
): FormStore<T>;

export function useFormStore(props: FormStoreProps): FormStore;

export function useFormStore(props: FormStoreProps = {}): FormStore {
  const [store, update] = useStore(Core.createFormStore, props);
  return useFormStoreProps(store, update, props);
}

export interface FormStoreValues extends Core.FormStoreValues {}

export interface FormStoreItem extends Core.FormStoreItem {}

export interface FormStoreState<T extends FormStoreValues = FormStoreValues>
  extends Core.FormStoreState<T>, CollectionStoreState<FormStoreItem> {}

export interface FormStoreFunctions<T extends FormStoreValues = FormStoreValues>
  extends Core.FormStoreFunctions<T>, CollectionStoreFunctions<FormStoreItem> {
  /**
   * A custom hook that rerenders the component when the value of the given
   * field changes. It accepts a string or a reference to a field name from the
   * [`names`](https://ariakit.com/reference/use-form-store#names) object in the
   * store, for type safety. It returns the value of the field.
   *
   * Live examples:
   * - [Form with Select](https://ariakit.com/examples/form-select)
   * @example
   * const nameValue = useFormValue(store, "name");
   * // Can also use store.names for type safety.
   * const emailValue = useFormValue(store, store.names.email);
   * @deprecated Use
   * [`useFormValue`](https://ariakit.com/reference/use-form-value) instead.
   */
  // oxlint-disable-next-line no-unnecessary-type-parameters
  useValue: <T = any>(name: StringLike) => T;
  /**
   * Custom hook that accepts a callback that will be used to validate the form
   * when [`validate`](https://ariakit.com/reference/use-form-store#validate) is
   * called, typically when a form field is touched or when the form is
   * submitted.
   *
   * Live examples:
   * - [FormRadio](https://ariakit.com/examples/form-radio)
   * @example
   * useFormValidate(store, async (state) => {
   *   const errors = await api.validate(state.values);
   *   if (errors) {
   *     store.setErrors(errors);
   *   }
   * });
   * @deprecated Use
   * [`useFormValidate`](https://ariakit.com/reference/use-form-validate)
   * instead.
   */
  useValidate: (callback: Core.FormStoreCallback<FormStoreState<T>>) => void;
  /**
   * Custom hook that accepts a callback that will be used to submit the form
   * when [`submit`](https://ariakit.com/reference/use-form-store#submit) is
   * called.
   *
   * Live examples:
   * - [FormRadio](https://ariakit.com/examples/form-radio)
   * - [Form with Select](https://ariakit.com/examples/form-select)
   * @example
   * useFormSubmit(store, async (state) => {
   *   try {
   *     await api.submit(state.values);
   *   } catch (errors) {
   *     store.setErrors(errors);
   *   }
   * });
   * @deprecated Use
   * [`useFormSubmit`](https://ariakit.com/reference/use-form-submit) instead.
   */
  useSubmit: (callback: Core.FormStoreCallback<FormStoreState<T>>) => void;
}

export interface FormStoreOptions<T extends FormStoreValues = FormStoreValues>
  extends Core.FormStoreOptions<T>, CollectionStoreOptions<FormStoreItem> {
  /**
   * Function that will be called when
   * [`values`](https://ariakit.com/reference/use-form-store#values) state
   * changes.
   * @example
   * function MyForm({ values, onChange }) {
   *   const form = useFormStore({ values, setValues: onChange });
   * }
   */
  setValues?: (values: FormStoreState<T>["values"]) => void;
  /**
   * Function that will be called when the
   * [`errors`](https://ariakit.com/reference/use-form-store#errors) state
   * changes.
   * @example
   * useFormStore({ setErrors: (errors) => console.log(errors) });
   */
  setErrors?: (errors: FormStoreState<T>["errors"]) => void;
  /**
   * Function that will be called when the
   * [`touched`](https://ariakit.com/reference/use-form-store#touched) state
   * changes.
   * @example
   * useFormStore({ setTouched: (touched) => console.log(touched) });
   */
  setTouched?: (touched: FormStoreState<T>["touched"]) => void;
}

export interface FormStoreProps<T extends FormStoreValues = FormStoreValues>
  extends FormStoreOptions<T>, Core.FormStoreProps<T> {}

export interface FormStore<T extends FormStoreValues = FormStoreValues>
  extends FormStoreFunctions<T>, Store<Core.FormStore<T>> {}
